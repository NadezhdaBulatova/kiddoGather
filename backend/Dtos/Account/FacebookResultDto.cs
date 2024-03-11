using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Dtos.Account
{
    public class FacebookResultDto
    {
        public FacebookData Data { get; set; }
    }

    public class FacebookData
    {
        public bool is_valid { get; set; }
        public string user_id { get; set; }
    }
}