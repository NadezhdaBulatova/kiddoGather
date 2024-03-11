using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Dtos.Account
{
    public class UserDto
    {
        public string username { get; set; }
        public string id { get; set; }
        public string JWT { get; set; }
        
    }
}