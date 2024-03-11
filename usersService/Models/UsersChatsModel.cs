using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace usersService.Models
{
    public class UsersChatsModel
    {
        public string UserId { get; set; }
        public string ChatId { get; set; }
        public UserModel User { get; set; }
        public ChatModel Chat { get; set; }
    }
}