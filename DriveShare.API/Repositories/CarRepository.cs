using DriveShare.API.Data;
using DriveShare.API.Models;
using DriveShare.API.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace DriveShare.API.Repositories
{
    public class CarRepository : GenericRepository<CarPost>, ICarRepository
    {
        public CarRepository(ApplicationDbContext context) : base(context) { }

        public async Task<IEnumerable<CarPost>> GetApprovedCarsAsync(
            string? brand, string? location,
            decimal? minPrice, decimal? maxPrice,
            CarType? carType, TransmissionType? transmission,
            string? sortOrder, int page, int pageSize)
        {
            var query = _context.Cars
                .Where(c => c.IsApproved)
                .Include(c => c.Owner)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(brand))
                query = query.Where(c => c.Brand.Contains(brand));

            if (!string.IsNullOrWhiteSpace(location))
                query = query.Where(c => c.Location.Contains(location));

            if (minPrice.HasValue)
                query = query.Where(c => c.PricePerDay >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(c => c.PricePerDay <= maxPrice.Value);

            if (carType.HasValue)
                query = query.Where(c => c.Type == carType.Value);

            if (transmission.HasValue)
                query = query.Where(c => c.Transmission == transmission.Value);

            query = sortOrder switch
            {
                "price_asc"  => query.OrderBy(c => c.PricePerDay),
                "price_desc" => query.OrderByDescending(c => c.PricePerDay),
                _            => query.OrderByDescending(c => c.Id)
            };

            return await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> CountApprovedCarsAsync(
            string? brand, string? location,
            decimal? minPrice, decimal? maxPrice,
            CarType? carType, TransmissionType? transmission)
        {
            var query = _context.Cars
                .Where(c => c.IsApproved)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(brand))
                query = query.Where(c => c.Brand.Contains(brand));
            if (!string.IsNullOrWhiteSpace(location))
                query = query.Where(c => c.Location.Contains(location));
            if (minPrice.HasValue)
                query = query.Where(c => c.PricePerDay >= minPrice.Value);
            if (maxPrice.HasValue)
                query = query.Where(c => c.PricePerDay <= maxPrice.Value);
            if (carType.HasValue)
                query = query.Where(c => c.Type == carType.Value);
            if (transmission.HasValue)
                query = query.Where(c => c.Transmission == transmission.Value);

            return await query.CountAsync();
        }

        public async Task<CarPost?> GetCarWithDetailsAsync(int id)
            => await _context.Cars
                .Include(c => c.Owner)
                .Include(c => c.Ratings)
                .FirstOrDefaultAsync(c => c.Id == id);

        public async Task<IEnumerable<CarPost>> GetCarsByOwnerAsync(int ownerId)
            => await _context.Cars
                .Where(c => c.OwnerId == ownerId)
                .ToListAsync();

        public async Task<CarPost?> GetCarWithBookingsAsync(int carId, int ownerId)
            => await _context.Cars
                .Include(c => c.Bookings)
                .FirstOrDefaultAsync(c => c.Id == carId && c.OwnerId == ownerId);
    }
}
