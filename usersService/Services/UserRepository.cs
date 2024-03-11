using Microsoft.EntityFrameworkCore;
using usersService.Data;
using usersService.Interfaces;
using usersService.Models;

namespace usersService.Services
{
    public class UserRepository : UserRepositoryInterface
    {

        private readonly IServiceScopeFactory _scopeFactory;

        public UserRepository(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }
        public async Task<UserModel> CreateUser(UserModel user)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var _context = scope.ServiceProvider.GetRequiredService<AppDBContext>();

                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                return user;
            }
        }

        public async Task<UserModel> UpdateUser(UserModel user)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var _context = scope.ServiceProvider.GetRequiredService<AppDBContext>();

                var existingUser = await _context.Users
                    .Include(user => user.Kids)
                    .Include(u => u.UserLocations)
                    .ThenInclude(ul => ul.Location)
                    .Include(u => u.UserLanguages)
                    .ThenInclude(ul => ul.Language)
                    .Include(u => u.UserChats)
                    .ThenInclude(uc => uc.Chat)
                    .FirstOrDefaultAsync(u => u.Id == user.Id);

                if (existingUser != null)
                {
                    _context.Entry(existingUser).CurrentValues.SetValues(user);

                    foreach (var userLocation in user.UserLocations)
                    {
                        if (!existingUser.UserLocations.Any(ul => ul.UserId == userLocation.UserId && ul.LocationId == userLocation.LocationId))
                        {
                            _context.UsersLocations.Add(userLocation);
                        }
                    }

                    foreach (var userLanguage in user.UserLanguages)
                    {
                        if (!existingUser.UserLanguages.Any(ul => ul.UserId == userLanguage.UserId && ul.LanguageId == userLanguage.LanguageId))
                        {
                            _context.UsersLanguages.Add(userLanguage);
                        }
                    }
                    foreach (var userChat in user.UserChats)
                    {
                        if (!existingUser.UserChats.Any(uc => uc.UserId == userChat.UserId && uc.ChatId == userChat.ChatId))
                        {
                            _context.UsersChats.Add(userChat);
                        }
                    }
                    await _context.SaveChangesAsync();
                }

                return user;
            }

        }

        public async Task<bool> DeleteUser(string id)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var _context = scope.ServiceProvider.GetRequiredService<AppDBContext>();

                var user = _context.Users.Find(id);
                _context.Users.Remove(user);
                return await _context.SaveChangesAsync() > 0;
            }

        }

        public Task<UserModel> FindUser(string id)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var _context = scope.ServiceProvider.GetRequiredService<AppDBContext>();

                var user = _context.Users
                    .Include(user => user.Kids)
                    .Include(u => u.UserLocations)
                    .ThenInclude(ul => ul.Location)
                    .Include(u => u.UserLanguages)
                    .ThenInclude(ul => ul.Language)
                    .Include(u => u.UserChats)
                    .ThenInclude(uc => uc.Chat)
                   .FirstOrDefault(u => u.Id == id);
                return Task.FromResult(user);
            }
        }

        public async Task<List<UserModel>> GetAllUsers()
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var _context = scope.ServiceProvider.GetRequiredService<AppDBContext>();

                var users = await _context.Users
                    .Include(user => user.Kids)
                    .Include(u => u.UserLocations)
                    .ThenInclude(ul => ul.Location)
                    .Include(u => u.UserLanguages)
                    .ThenInclude(ul => ul.Language)
                    .Include(u => u.UserChats)
                    .ThenInclude(uc => uc.Chat)
                    .ToListAsync();
                return users;
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