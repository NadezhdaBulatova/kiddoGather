using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using usersService.Enums;

namespace usersService.Models
{
    public class UserModel
    {
        public required string Id { get; set; }
        public required string Name { get; set; }
        public string Image { get; set; }
        public Gender? Gender { get; set; }
        public ICollection<UsersLocationsModel> UserLocations { get; set; }
        public ICollection<KidModel> Kids { get; set; }
        public DateTime? Birthday { get; set; }
        public ICollection<UsersChatsModel> UserChats { get; set; }
        public ICollection<UsersLanguagesModel> UserLanguages { get; set; }
    }
}