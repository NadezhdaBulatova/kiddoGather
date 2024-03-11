namespace usersService.Types
{
    public class ChatType
    {
        [GraphQLNonNullType]
        public string Id { get; set; }

        public List<UserType> Users { get; set; }
        public List<MessageType> Messages { get; set; }
        public MessageType LastMessage { get; set; }
    }
}