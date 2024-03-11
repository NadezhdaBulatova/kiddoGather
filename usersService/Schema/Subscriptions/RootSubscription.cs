using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using usersService.Mutation;
using usersService.Schema.Mutations;
using usersService.Types;

namespace usersService.Schema.Subscriptions
{
    public class RootSubscription
    {
        [Subscribe]
        [Topic($"{{{nameof(userId)}}}")]
        public MessageMutationResult OnMessageReceived(string userId, [EventMessage] MessageMutationResult message) => message;
    }
}