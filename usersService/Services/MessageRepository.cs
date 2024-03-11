using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using usersService.Data;
using usersService.Models;

namespace usersService.Services
{
    public class MessageRepository
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public MessageRepository(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }
        public async Task<MessageModel> CreateMessage(string chatId, DateTime date, string text, string userFromId)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var _context = scope.ServiceProvider.GetRequiredService<AppDBContext>();
                System.Console.WriteLine("Started look for chat");
                var chat = await _context.Chats.Include(cu => cu.UserChats).ThenInclude(cu => cu.User).FirstOrDefaultAsync(c => c.Id == chatId);
                try
                {
                    var userChatFrom = chat.UserChats.Where(uc => uc.User.Id == userFromId && uc.ChatId == chat.Id).FirstOrDefault();
                    var userChatTo = chat.UserChats.Where(uc => uc.User.Id != userFromId && uc.ChatId == chat.Id).FirstOrDefault();
                    System.Console.WriteLine("UserChatFrom: ");
                    var message = new MessageModel
                    {
                        From = userChatFrom?.User,
                        To = userChatTo?.User,
                        ChatId = chat.Id,
                        Chat = chat,
                        Date = date.ToUniversalTime(),
                        Text = text
                    };
                    _context.Messages.Add(message);
                    chat.LastMessage = message;
                    await _context.SaveChangesAsync();
                    message = _context.Messages
                        .Include(m => m.From)
                        .Include(m => m.To)
                        .Include(m => m.Chat)
                        .ThenInclude(c => c.UserChats)
                        .ThenInclude(c => c.User)
                        .FirstOrDefault(m => m.Id == message.Id);
                    System.Console.WriteLine("Messsage created");
                    return message;
                }
                catch (Exception e)
                {
                    System.Console.WriteLine(e.Message);
                    return null;
                }
            }
        }

        public async Task<List<MessageModel>> GetAllMessages(string chatId)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var _context = scope.ServiceProvider.GetRequiredService<AppDBContext>();
                List<MessageModel> messages = [];
                try
                {
                    messages = await _context.Messages
                                .Include(m => m.Chat)
                                .ThenInclude(c => c.UserChats)
                                .ThenInclude(c => c.User)
                                .Where(m => m.ChatId == chatId)
                                .ToListAsync();
                }
                catch (Exception e)
                {
                    System.Console.WriteLine(e.Message);
                }
                return messages;
            }

        }

    }
}