using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using usersService.Enums;

namespace usersService.Types
{
    public class LocationType
    {
        public string LocationId { get; set; }
        public ICollection<UserType> Users { get; set; }
        public string Name { get; set; }
        [GraphQLNonNullType]
        public double Latitude { get; set; }
        [GraphQLNonNullType]
        public double Longitude { get; set; }
        public string Character { get; set; }
        public string Address { get; set; }
    }
}