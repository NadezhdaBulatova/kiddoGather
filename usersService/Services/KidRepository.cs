using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using usersService.Data;
using usersService.Models;

namespace usersService.Services
{
    public class KidRepository
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public KidRepository(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }
        public async Task<KidModel> CreateKid(KidModel kid)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var _context = scope.ServiceProvider.GetRequiredService<AppDBContext>();

                _context.Kids.Add(kid);
                await _context.SaveChangesAsync();
                return kid;
            }
        }

        public async Task<bool> DeleteKid(string id)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var _context = scope.ServiceProvider.GetRequiredService<AppDBContext>();

                var kidToDelete = _context.Kids.Find(id);
                _context.Kids.Remove(kidToDelete);
                return await _context.SaveChangesAsync() > 0;
            }

        }
    }
}