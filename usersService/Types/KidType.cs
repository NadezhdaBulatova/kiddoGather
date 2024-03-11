using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using usersService.Enums;

namespace usersService.Types
{
    public class KidType
    {
        [GraphQLNonNullType]
        public string Id { get; set; }
        public string Name { get; set; }
        public Gender? Gender { get; set; }
        public DateTime? Birthday { get; set; }
        public string UserId { get; set; } 
        public UserType User { get; set; }
    }
}