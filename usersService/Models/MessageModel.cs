using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace usersService.Models
{
    public class MessageModel
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public UserModel From { get; set; }

        public UserModel To { get; set; }

        public string Text { get; set; }

        public DateTime Date { get; set; }

        public string ChatId { get; set; }
        public ChatModel Chat { get; set; }
    }
}