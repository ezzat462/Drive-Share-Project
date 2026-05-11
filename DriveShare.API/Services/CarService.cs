using DriveShare.API.Data;
using DriveShare.API.DTOs.Common;
using DriveShare.API.Models;
using DriveShare.API.Models.Enums;
using DriveShare.API.Repositories;
using DriveShare.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DriveShare.API.Services
{
    public class CarService : ICarService
    {
        private readonly ICarRepository _carRepository;
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;

        public CarService(ICarRepository carRepository, ApplicationDbContext context, INotificationService notificationService)
        {
            _carRepository = carRepository;
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<ApiResponse<PaginatedResult<CarPost>>> GetAllApprovedCarsAsync(
            string? brand = null, 
            string? location = null, 
            decimal? minPrice = null, 
            decimal? maxPrice = null, 
            string? sortOrder = null, 
            CarType? carType = null, 
            TransmissionType? transmission = null, 
            int page = 1, 
            int pageSize = 10)
        {
            var items = await _carRepository.GetApprovedCarsAsync(brand, location, minPrice, maxPrice, carType, transmission, sortOrder, page, pageSize);
            var totalItems = await _carRepository.CountApprovedCarsAsync(brand, location, minPrice, maxPrice, carType, transmission);

            var result = new PaginatedResult<CarPost>
            {
                TotalItems = totalItems,
                PageNumber = page,
                PageSize = pageSize,
                Items = items.ToList()
            };

            return ApiResponse<PaginatedResult<CarPost>>.SuccessResponse(result);
        }

        public async Task<ApiResponse<CarPost>> GetCarByIdAsync(int id)
        {
            var car = await _carRepository.GetCarWithDetailsAsync(id);
            
            if (car == null) return ApiResponse<CarPost>.FailureResponse("Car not found");
            return ApiResponse<CarPost>.SuccessResponse(car);
        }

        // ───────────────────────────────────────────────────────────
        //  WORKFLOW 1: Car Listing
        //  ► Persists the car with IsApproved = false
        //  ► Notifies ALL admins in real-time
        //  ► Returns a success message for the owner's UI
        // ───────────────────────────────────────────────────────────
        public async Task<ApiResponse<CarPost>> CreateCarAsync(CarPost car)
        {
            var owner = await _context.Users.FindAsync(car.OwnerId);
            if (owner == null) return ApiResponse<CarPost>.FailureResponse("Owner not found.");
            
            if (owner.ApprovalStatus != ApprovalStatus.Approved)
                return ApiResponse<CarPost>.FailureResponse("Your account is pending admin approval.");

            // Validate availability window
            var today = DateTime.UtcNow.Date;
            if (car.AvailableFrom.Date < today)
                return ApiResponse<CarPost>.FailureResponse("Available From date cannot be in the past.");

            if (car.AvailableTo.Date <= car.AvailableFrom.Date)
                return ApiResponse<CarPost>.FailureResponse("Available To date must be after Available From date.");

            await _carRepository.AddAsync(car);
            await _carRepository.SaveChangesAsync();

            // ► NOTIFICATION: Admin — "New car listing received from [User Name] and is pending approval."
            await _notificationService.SendNotificationToAdminsAsync(
                $"New car listing received from {owner.FullName} and is pending approval.",
                "NewCarPost");

            // ► RESPONSE MESSAGE: Owner sees this in the UI
            return ApiResponse<CarPost>.SuccessResponse(car, 
                "Your car listing has been submitted successfully and is currently under review by the admin.");
        }

        public async Task<ApiResponse<CarPost>> UpdateCarAsync(int id, CarPost car)
        {
            var existingCar = await _carRepository.GetByIdAsync(id);
            if (existingCar == null) return ApiResponse<CarPost>.FailureResponse("Car not found.");

            var owner = await _context.Users.FindAsync(existingCar.OwnerId);
            if (owner == null) return ApiResponse<CarPost>.FailureResponse("Owner not found.");
            
            if (owner.ApprovalStatus != ApprovalStatus.Approved)
                return ApiResponse<CarPost>.FailureResponse("Your account is pending admin approval.");

            // Validate availability window
            var today = DateTime.UtcNow.Date;
            if (car.AvailableFrom.Date < today)
                return ApiResponse<CarPost>.FailureResponse("Available From date cannot be in the past.");

            if (car.AvailableTo.Date <= car.AvailableFrom.Date)
                return ApiResponse<CarPost>.FailureResponse("Available To date must be after Available From date.");

            existingCar.Brand = car.Brand;
            existingCar.Model = car.Model;
            existingCar.Title = car.Title;
            existingCar.Type = car.Type;
            existingCar.Transmission = car.Transmission;
            existingCar.Year = car.Year;
            existingCar.PricePerDay = car.PricePerDay;
            existingCar.Location = car.Location;
            existingCar.Description = car.Description;
            existingCar.ImageUrl = car.ImageUrl;
            existingCar.AvailableFrom = car.AvailableFrom;
            existingCar.AvailableTo = car.AvailableTo;
            existingCar.IsApproved = false; // Re-approval needed after edit

            await _carRepository.UpdateAsync(existingCar);
            await _carRepository.SaveChangesAsync();
            return ApiResponse<CarPost>.SuccessResponse(existingCar, "Car updated successfully. Waiting for admin re-approval.");
        }

        public async Task<ApiResponse<List<CarPost>>> GetCarsByOwnerAsync(int ownerId)
        {
            var cars = await _carRepository.GetCarsByOwnerAsync(ownerId);
            return ApiResponse<List<CarPost>>.SuccessResponse(cars.ToList());
        }

        public async Task<ApiResponse<bool>> DeleteCarAsync(int carId, int ownerId)
        {
            var car = await _carRepository.GetCarWithBookingsAsync(carId, ownerId);

            if (car == null) return ApiResponse<bool>.FailureResponse("Car not found or access denied.");

            // Constraint: Prevent deletion if car is Rented or has upcoming accepted bookings.
            if (car.Status == CarStatus.Rented)
                return ApiResponse<bool>.FailureResponse("Cannot delete a car that is currently rented.");

            var hasUpcomingBookings = car.Bookings.Any(b => b.Status == BookingStatus.Accepted && b.EndDate >= DateTime.UtcNow);
            if (hasUpcomingBookings)
                return ApiResponse<bool>.FailureResponse("Cannot delete a car with upcoming accepted bookings.");

            await _carRepository.DeleteAsync(car);
            await _carRepository.SaveChangesAsync();
            return ApiResponse<bool>.SuccessResponse(true, "Car deleted successfully.");
        }
    }
}
