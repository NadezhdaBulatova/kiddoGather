using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Dtos.Account
{
    public class RegisterWithThirdPartyDto
    {
        [Required]
        [StringLength(15, MinimumLength = 3, ErrorMessage = "Username must be between {2} and {1} characters")]
        public string Nickname { get; set; }
        [Required]
        public string AccessToken { get; set; }
        [Required]
        public string UserId { get; set; }
        [Required]
        [Provider]
        public string Provider { get; set; }
    }
}