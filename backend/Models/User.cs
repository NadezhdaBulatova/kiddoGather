
using System;
using Microsoft.AspNetCore.Identity;

public class User : IdentityUser
    {
        public string Nickname { get; set; }
        public string Password { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string Provider { get; set; }
    }
