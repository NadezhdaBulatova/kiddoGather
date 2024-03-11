using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace usersService.Models
{
    public class UsersLanguagesModel
    {
        public string UserId { get; set; }
        public string LanguageId { get; set; }
        public UserModel User { get; set; }
        public LanguageModel Language { get; set; }

    }
}