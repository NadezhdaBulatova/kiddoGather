using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace usersService.Models
{
    public class UsersLocationsModel
    {
        public string UserId { get; set; }
        public string LocationId { get; set; }
        public UserModel User { get; set; }
        public LocationModel Location { get; set; }
    }
}