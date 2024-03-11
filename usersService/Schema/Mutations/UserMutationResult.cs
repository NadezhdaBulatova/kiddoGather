using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using usersService.Enums;
using usersService.Models;
using usersService.Types;

namespace usersService.Schema.Mutations
{
    public class UserMutationResult
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public LocationType Location { get; set; }
        public string Image { get; set; }
        public Gender? Gender { get; set; }
        public ICollection<LocationType> Locations { get; set; }
        public ICollection<KidType> Kids { get; set; }
        public DateTime? Birthday { get; set; }
        public ICollection<LanguageType> Languages { get; set; }
        public ICollection<ChatType> Chats { get; set; }
    }
}