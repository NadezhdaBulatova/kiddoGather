using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.NetworkInformation;
using System.Threading.Tasks;
using usersService.Types;

namespace usersService.Schema.Queries
{
    public class ChatQueryResult
    {
        public string Id { get; set; }

        public List<UserType> Users { get; set; }
        public List<MessageType> Messages { get; set; }
        public MessageType LastMessage { get; set; }
    }
}