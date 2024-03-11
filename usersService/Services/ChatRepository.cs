using Microsoft.EntityFrameworkCore;
using usersService.Data;
using usersService.Models;

namespace usersService.Services
{
    public class ChattingRepository
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public ChattingRepository(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }
        public async Task<ChatModel> CreateChat(string idUser1, string idUser2)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var _context = scope.ServiceProvider.GetRequiredService<AppDBContext>();

                List<string> ids = [idUser1, idUser2];
                ids.Sort();
                string chatId = string.Join("&", ids);
                var existingChat = await GetChatById(chatId);

                if (existingChat == null)
                {

                    var chat = new ChatModel
                    {
                        Id = chatId,
                    };
                    _context.Chats.Add(chat);
                    var user1 = _context.Users.Find(idUser1);
                    var user2 = _context.Users.Find(idUser2);
                    var userChat1 = new UsersChatsModel { UserId = idUser1, ChatId = chatId, Chat = chat, User = user1 };
                    var userChat2 = new UsersChatsModel { UserId = idUser2, ChatId = chatId, Chat = chat, User = user2 };
                    _context.UsersChats.Add(userChat1);
                    _context.UsersChats.Add(userChat2);


                    await _context.SaveChangesAsync();
                    return chat;
                }
                else
                {
                    return existingChat;
                }
            }
        }
        public async Task<bool> DeleteChat(string id)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var _context = scope.ServiceProvider.GetRequiredService<AppDBContext>();

                var userChats = _context.UsersChats.FirstOrDefault(uc => uc.ChatId == id);

                if (userChats != null)
                {
                    _context.UsersChats.Remove(userChats);
                    await _context.SaveChangesAsync();

                    var chat = _context.Chats.Find(id);
                    _context.Chats.Remove(chat);

                    await _context.SaveChangesAsync();
                    return true;
                }
                return false;
            }
        }

        public async Task<ChatModel> GetChatById(string id)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var _context = scope.ServiceProvider.GetRequiredService<AppDBContext>();

                var existingChat = await _context.Chats
                   .Include(c => c.UserChats)
                   .ThenInclude(uc => uc.User)
                   .Include(c => c.Messages)
                   .FirstOrDefaultAsync(c => c.Id == id);
                if (existingChat == null)
                {
                    return null;
                }
                return existingChat;
            }

        }

        public async Task<List<ChatModel>> GetAllChats(string userId)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var _context = scope.ServiceProvider.GetRequiredService<AppDBContext>();

                return await _context.Chats
                    .Where(c => c.LastMessage != null)
                    .Include(c => c.UserChats)
                    .ThenInclude(uc => uc.User)
                    .Include(c => c.Messages)
                    .ToListAsync();
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