using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using usersService.Enums;

namespace usersService.Models
{
    public class KidModel
    {
        [Key]
        public required string Id { get; set; }
        public string Name { get; set; }
        public Gender? Gender { get; set; }
        public DateTime? Birthday { get; set; }
        public string UserId { get; set; } 
        public UserModel User { get; set; }
    }
}