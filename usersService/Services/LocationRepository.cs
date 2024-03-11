using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using usersService.Data;
using usersService.Models;

namespace usersService.Services
{
    public class LocationRepository
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public LocationRepository(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }
        public async Task<LocationModel> CreateLocation(LocationModel location)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var _context = scope.ServiceProvider.GetRequiredService<AppDBContext>();
                _context.Locations.Add(location);

                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.ToString());
                }

                return location;
            }
        }

        public async Task<bool> DeleteLocation(string locationId, string userId)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var _context = scope.ServiceProvider.GetRequiredService<AppDBContext>();
                var userLocation = _context.UsersLocations.FirstOrDefault(ul => ul.UserId == userId && ul.LocationId == locationId);
                if (userLocation != null)
                {
                    _context.UsersLocations.Remove(userLocation);
                    await _context.SaveChangesAsync();

                    var isLocationRelated = _context.UsersLocations.Any(ul => ul.LocationId == locationId);

                    if (!isLocationRelated)
                    {
                        var unrelatedLocation = _context.Locations.Find(locationId);
                        _context.Locations.Remove(unrelatedLocation);
                    }

                    await _context.SaveChangesAsync();
                    return true;
                }
                return false;
            }

        }

        public async Task<LocationModel> FindLocation(double latitude, double longitude)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var _context = scope.ServiceProvider.GetRequiredService<AppDBContext>();

                var location = await _context.Locations.FirstOrDefaultAsync(l => l.Latitude == latitude && l.Longitude == longitude);
                return location;
            }
        }

        public async Task<LocationModel> FindLocationById(string id)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var _context = scope.ServiceProvider.GetRequiredService<AppDBContext>();

                var location = await _context.Locations.FirstOrDefaultAsync(l => l.LocationId == id);
                return location;
            }
        }

        public async Task<List<LocationModel>> GetAllLocations()
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var _context = scope.ServiceProvider.GetRequiredService<AppDBContext>();

                var locations = await _context.Locations
                    .Include(u => u.UserLocations)
                    .ThenInclude(ul => ul.User)
                    .ToListAsync();
                return locations;
            }
        }

        public async Task SaveChanges()
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var _context = scope.ServiceProvider.GetRequiredService<AppDBContext>();

                await _context.SaveChangesAsync();
            }

        }

    }
}