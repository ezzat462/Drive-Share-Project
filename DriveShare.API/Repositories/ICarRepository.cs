using DriveShare.API.Models;
using DriveShare.API.Models.Enums;

namespace DriveShare.API.Repositories
{
    public interface ICarRepository : IRepository<CarPost>
    {
        Task<IEnumerable<CarPost>> GetApprovedCarsAsync(
            string? brand, string? location,
            decimal? minPrice, decimal? maxPrice,
            CarType? carType, TransmissionType? transmission,
            string? sortOrder, int page, int pageSize);

        Task<int> CountApprovedCarsAsync(
            string? brand, string? location,
            decimal? minPrice, decimal? maxPrice,
            CarType? carType, TransmissionType? transmission);

        Task<CarPost?> GetCarWithDetailsAsync(int id);
        Task<IEnumerable<CarPost>> GetCarsByOwnerAsync(int ownerId);
        Task<CarPost?> GetCarWithBookingsAsync(int carId, int ownerId);
    }
}
