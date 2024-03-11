using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using usersService.Enums;
using usersService.Models;
using usersService.Types;

namespace usersService.Schema.Mutations
{
    public class UserMutationInput
    {
        [GraphQLNonNullType]
        public string Id { get; set; }
        public string Name { get; set; }
        public string Image { get; set; }
        public Gender? Gender { get; set; }
        public LocationType Location { get; set; }
        public ICollection<LocationModel> Locations { get; set; }
        public ICollection<KidModel> Kids { get; set; }
        public DateTime? Birthday { get; set; }
        public ICollection<LanguageModel> Languages { get; set; }
        public ICollection<ChatModel> Chats { get; set; }
    }
}