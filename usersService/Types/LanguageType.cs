using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using usersService.Enums;

namespace usersService.Types
{
    public class LanguageType
    {
        public string LanguageId { get; set; }

        public string Language { get; set; }
        public List<UserType> Users { get; set; }
    }
}