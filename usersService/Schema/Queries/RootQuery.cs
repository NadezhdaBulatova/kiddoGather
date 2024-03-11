using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Bogus;
using HotChocolate.Authorization;
using usersService.Enums;
using usersService.Models;
using usersService.Schema.Mutations;
using usersService.Schema.Queries;
using usersService.Services;
using usersService.Types;

namespace usersService.Query
{
    public class RootQuery
    {
        private readonly UserRepository _userRepository;
        private readonly ChattingRepository _chatsRepository;

        private readonly MessageRepository _messageRepository;

        private readonly LocationRepository _locationsRepository;

        public RootQuery(UserRepository userRepository, ChattingRepository chatsRepository, MessageRepository messageRepository, LocationRepository locationsRepository)
        {
            _userRepository = userRepository;
            _chatsRepository = chatsRepository;
            _messageRepository = messageRepository;
            _locationsRepository = locationsRepository;
        }

        // //need to define the types here - models will be referenced also in DTOs - need to be different? 
        // public List<UserModel> GetUsers() {
        //     Faker<UserModel> userFaker = new Faker<UserModel>()
        //         .RuleFor(u => u.Id, f => f.Random.Guid().ToString())
        //         .RuleFor(u => u.Name, f => f.Name.FirstName())
        //         .RuleFor(u => u.Location, f => f.Random.Guid().ToString())
        //         .RuleFor(u => u.Location, f => f.Random.Guid().ToString())
        //         .RuleFor(u => u.Gender, f => f.PickRandom<Gender>())
        //         .RuleFor(u => u.FavoriteLocations, f => f.Make(5, () => f.Random.Guid().ToString()).ToList())
        //         .RuleFor(u => u.Kids, f => f.Make(5, () => new KidModel{
        //             Name = f.Name.FirstName(),
        //             Gender = f.PickRandom<Gender>(),
        //             Birthday = f.Date.Past(10, DateTime.Now.AddYears(-3)),
        //             Id = f.Random.Guid().ToString()
        //         }).ToList())
        //         .RuleFor(u => u.Birthday, f => f.Date.Past(30, DateTime.Now.AddYears(-30)))
        //         .RuleFor(u => u.Languages, f => f.Make(5, () => f.PickRandom<Language>()).ToList());
        //     return userFaker.Generate(10);
        // }
        // [Authorize]
        public async Task<UserQueryResult> GetUserById(string id)
        {
            var user = await _userRepository.FindUser(id);
            if (user == null)
            {
                throw new GraphQLException("User with id not found");
            }

            LocationModel personalLocation = user.UserLocations?
                .Select(ul => ul.Location)
                .FirstOrDefault(l => l.Character == "Personal");

            IEnumerable<LocationModel> otherLocations = user.UserLocations
                .Where(ul => ul.Location.Character != "Personal")
                .Select(ul => ul.Location);

            try
            {
                UserQueryResult foundUser = new()
                {
                    Id = user.Id,
                    Name = user.Name,
                    Location = personalLocation == null ? null : new LocationType
                    {
                        LocationId = personalLocation.LocationId,
                        Name = personalLocation?.Name,
                        Latitude = personalLocation.Latitude,
                        Longitude = personalLocation.Longitude,
                        Character = personalLocation?.Character,
                        Address = personalLocation?.Address
                    },
                    Image = user.Image,
                    Gender = user.Gender,
                    Locations = otherLocations?.Select(location => new LocationType
                    {
                        LocationId = location.LocationId,
                        Name = location?.Name,
                        Latitude = location.Latitude,
                        Longitude = location.Longitude,
                        Character = location?.Character,
                        Address = location?.Address
                    }).ToList(),
                    Kids = user.Kids?.Select(kid => new KidType
                    {
                        Id = kid.Id,
                        Name = kid.Name,
                        Gender = kid.Gender,
                        Birthday = kid.Birthday
                    })?.ToList(),
                    Languages = user.UserLanguages?.Select(ul => ul.Language).Select(language => new LanguageType
                    {
                        LanguageId = language.LanguageId,
                        Language = language.Language
                    })?.ToList(),
                    Chats = user.UserChats?.Select(uc => uc.Chat)?.Select(chat => new ChatType
                    {
                        Id = chat.Id,
                    })?.ToList(),
                    Birthday = user.Birthday,
                };
                return foundUser;
            }
            catch (Exception ex)
            {
                System.Console.WriteLine(ex.Message);
            }
            return null;
        }

        [UseFiltering]
        [UseSorting()]
        public async Task<List<UserQueryResult>> GetAllUsers(string id, string filterOption = null)
        {
            var users = await _userRepository.GetAllUsers();


            var userQueryResults = users.Select(user =>
            {
                LocationModel personalLocation = user.UserLocations?
                    .Select(ul => ul.Location)
                    .FirstOrDefault(l => l.Character == "Personal");

                IEnumerable<LocationModel> otherLocations = user.UserLocations
                    .Where(ul => ul.Location.Character != "Personal")
                    .Select(ul => ul.Location);

                return new UserQueryResult
                {
                    Id = user.Id,
                    Name = user.Name,
                    Location = personalLocation == null ? null : new LocationType
                    {
                        LocationId = personalLocation.LocationId,
                        Name = personalLocation?.Name,
                        Latitude = personalLocation.Latitude,
                        Longitude = personalLocation.Longitude,
                        Character = personalLocation?.Character,
                        Address = personalLocation?.Address
                    },

                    Image = user.Image,
                    Gender = user.Gender,
                    Locations = otherLocations?.Select(location => new LocationType
                    {
                        LocationId = location.LocationId,
                        Name = location?.Name,
                        Latitude = location.Latitude,
                        Longitude = location.Longitude,
                        Character = location?.Character,
                        Address = location?.Address
                    }).ToList(),
                    Kids = user.Kids?.Select(kid => new KidType
                    {
                        Id = kid.Id,
                        Name = kid.Name,
                        Gender = kid.Gender,
                        Birthday = kid.Birthday
                    })?.ToList(),
                    Languages = user.UserLanguages?.Select(ul => ul.Language)?.Select(language => new LanguageType
                    {
                        LanguageId = language.LanguageId,
                        Language = language.Language
                    })?.ToList(),
                    Chats = user.UserChats?.Select(uc => uc.Chat)?.Select(chat => new ChatType
                    {
                        Id = chat.Id,
                    })?.ToList(),
                    Birthday = user.Birthday
                };
            }).ToList();

            UserQueryResult currentUser = userQueryResults.FirstOrDefault(u => u.Id == id);

            var returnValue = userQueryResults;

            foreach (var user in userQueryResults)
            {
                user.DistanceFromUser = Helpers.GetDistance(currentUser.Location, user.Location);
                user.KidsAgeDifference = Helpers.GetKidsAgeDifference(currentUser.Kids, user.Kids);
                user.SameFavPlaces = Helpers.GetFavoritePlacesCount(currentUser.Locations, user.Locations);
                user.SameLang = Helpers.GetSameLanguageCount(currentUser.Languages, user.Languages);
            }

            if (filterOption == "distance")
            {
                returnValue = userQueryResults
                    .OrderBy(u => u.DistanceFromUser < 0 ? 1 : 0)
                    .ThenBy(u => u.DistanceFromUser)
                    .ToList();
            }
            if (filterOption == "kids")
            {
                returnValue = userQueryResults
                    .OrderBy(u => u.KidsAgeDifference < 0 ? 1 : 0)
                    .ThenBy(u => u.KidsAgeDifference)
                    .ToList();
            }
            if (filterOption == "places")
            {
                returnValue = userQueryResults
                    .OrderByDescending(u => u.SameFavPlaces)
                    .ToList();
            }
            if (filterOption == "language")
            {
                returnValue = userQueryResults
                    .OrderByDescending(u => u.SameLang)
                    .ToList();
            }
            return returnValue.Where(u => u.DistanceFromUser <= 200 || u.DistanceFromUser <= 0).ToList();
        }


        public async Task<List<ChatQueryResult>> GetAllChats(string userId)
        {
            List<ChatModel> chats = (await _chatsRepository.GetAllChats(userId)).Where(chat => chat.LastMessage != null).ToList();
            System.Console.WriteLine(chats.Count);
            List<ChatQueryResult> results = chats.Select(chat => new ChatQueryResult
            {
                Id = chat?.Id,
                Users = chat?.UserChats?.Select(uc => uc.User)?.Select(user => new UserType
                {
                    Id = user.Id,
                    Name = user?.Name,
                    Image = user?.Image
                }).ToList(),
                LastMessage = chat?.LastMessage == null ? null : new MessageType
                {
                    Id = chat?.LastMessage?.Id,
                    From = new UserType { Id = chat?.LastMessage?.From?.Id, Name = chat?.LastMessage?.From?.Name },
                    To = new UserType { Id = chat?.LastMessage?.To?.Id, Name = chat?.LastMessage?.To?.Name },
                    Text = chat?.LastMessage?.Text,
                    Date = chat?.LastMessage?.Date,
                    ChatId = chat?.LastMessage?.ChatId
                }
            }).ToList();
            return results;
        }

        [UseSorting]
        public async Task<List<MessageMutationResult>> GetAllMessages(string chatId)
        {
            try
            {
                List<MessageModel> messages = await _messageRepository.GetAllMessages(chatId);
                List<MessageMutationResult> results = messages.Select(message => new MessageMutationResult
                {
                    Id = message?.Id,
                    From = new UserType
                    {
                        Id = message?.From?.Id,
                        Name = message?.From?.Name,
                        Image = message?.From?.Image,
                    },
                    To = new UserType
                    {
                        Id = message?.To?.Id,
                        Name = message?.To?.Name,
                        Image = message?.To?.Image,
                    },
                    Text = message?.Text,
                    Date = message?.Date,
                    ChatId = message?.ChatId,
                }).ToList();
                return results;
            }
            catch (Exception ex)
            {
                throw new GraphQLException(ex.Data.ToString());
            }
        }


        public async Task<ChatType> GetChatById(string id)
        {
            var chat = await _chatsRepository.GetChatById(id);
            if (chat == null)
            {
                throw new GraphQLException("Chat with id not found");
            }
            if (chat != null && chat.Messages != null)
            {
                chat.Messages = chat.Messages.OrderBy(message => message.Date).ToList();
            }
            return new ChatType
            {
                Id = chat.Id,
                Users = chat.UserChats?.Select(uc => uc.User)?.Select(user => new UserType
                {
                    Id = user.Id,
                    Name = user.Name,
                    Image = user.Image
                }).ToList(),
                Messages = chat.Messages?.Select(message => new MessageType
                {
                    Id = message.Id,
                    From = new UserType
                    {
                        Id = message.From.Id,
                        Name = message.From.Name,
                        Image = message.From.Image
                    },
                    To = new UserType
                    {
                        Id = message.To.Id,
                        Name = message.To.Name,
                        Image = message.To.Image
                    },
                    Text = message.Text,
                    Date = message.Date,
                    ChatId = message.ChatId
                }).ToList(),
                LastMessage = chat.LastMessage == null ? null : new MessageType
                {
                    Id = chat.LastMessage.Id,
                    From = new UserType
                    {
                        Id = chat.LastMessage.From.Id,
                        Name = chat.LastMessage.From.Name,
                        Image = chat.LastMessage.From.Image
                    },
                    To = new UserType
                    {
                        Id = chat.LastMessage.To.Id,
                        Name = chat.LastMessage.To.Name,
                        Image = chat.LastMessage.To.Image
                    },
                    Text = chat.LastMessage.Text,
                    Date = chat.LastMessage.Date,
                    ChatId = chat.LastMessage.ChatId
                }
            };
        }

        public async Task<List<LocationType>> GetAllLocations()
        {
            List<LocationModel> locations = await _locationsRepository.GetAllLocations();
            List<LocationType> results = locations.Select(location => new LocationType
            {
                LocationId = location?.LocationId,
                Users = location?.UserLocations?.Select(ul => ul.User)?.Select(user => new UserType
                {
                    Id = user.Id,
                    Name = user?.Name,
                    Image = user?.Image
                }).ToList(),
                Name = location?.Name,
                Latitude = location.Latitude,
                Longitude = location.Longitude,
                Character = location?.Character,
                Address = location?.Address
            }).ToList();
            return results;
        }
    }

}