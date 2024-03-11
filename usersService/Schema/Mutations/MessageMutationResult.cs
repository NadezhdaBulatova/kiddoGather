using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using usersService.Types;

namespace usersService.Schema.Mutations
{
    public class MessageMutationResult
    {
        [GraphQLNonNullType]
        public string Id { get; set; }
        public UserType From { get; set; }

        public UserType To { get; set; }

        public string Text { get; set; }

        public DateTime? Date { get; set; }

        public string ChatId { get; set; }
        public ChatType Chat { get; set; }
    }
}