using System.ComponentModel.DataAnnotations;
namespace usersService.Models
{
    public class ChatModel
    {
        [Key]
        public required string Id { get; set; }
        public ICollection<UsersChatsModel> UserChats { get; set; }
        public ICollection<MessageModel> Messages { get; set; }
        public MessageModel LastMessage { get; set; }
    }
}