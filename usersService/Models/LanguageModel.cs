using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using usersService.Enums;

namespace usersService.Models
{
    public class LanguageModel
    {
        [Key]
        public string LanguageId { get; set; }
        // public ICollection<UserModel> Users { get; set; }
        public ICollection<UsersLanguagesModel> UserLanguages { get; set; }
        public string Language { get; set; }
    }
}