using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Dtos.Email
{
    public class EmailSendDto

    {
        public string To { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
        public EmailSendDto(string to, string subject, string body)
        {
            this.To = to;
            this.Subject = subject;
            this.Body = body;
        }


        
    }
}