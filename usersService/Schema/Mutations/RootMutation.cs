using Bogus.DataSets;
using HotChocolate.Subscriptions;
using usersService.Models;
using usersService.Schema.Mutations;
using usersService.Services;
using usersService.Types;

namespace usersService.Mutation
{
    public class RootMutation
    {
        private readonly UserRepository _userRepository;
        private readonly ChattingRepository _chatsRepository;
        private readonly MessageRepository _messageRepository;
        private readonly KidRepository _kidRepository;
        private readonly LocationRepository _locationRepository;

        private readonly LanguageRepository _languageRepository;

        public RootMutation(UserRepository userRepository, ChattingRepository chatsRepository, MessageRepository messageRepository, LocationRepository locationRepository, KidRepository kidRepository, LanguageRepository languageRepository)
        {
            _userRepository = userRepository;
            _chatsRepository = chatsRepository;
            _messageRepository = messageRepository;
            _locationRepository = locationRepository;
            _kidRepository = kidRepository;
            _languageRepository = languageRepository;
        }

        // [Authorize]
        public async Task<UserMutationResult> AddUser(UserMutationInput userInput)
        {
            try
            {
                UserModel user = new()
                {
                    Id = userInput.Id,
                    Name = userInput.Name,
                    Image = userInput.Image,
                    Gender = userInput.Gender,
                    Birthday = userInput.Birthday,
                    // Languages = userInput.Languages?.Select(language => new LanguageModel
                    // {
                    //     LanguageId = language.LanguageId,
                    //     Language = language.Language
                    // }).ToList(),
                    // Chats = userInput.Chats?.Select(chat => new ChatModel
                    // {
                    //     Id = chat.Id,
                    // }).ToList(),
                };
                if (userInput.Locations != null && userInput.Locations.Count > 0)
                {
                    foreach (var inputLocation in userInput.Locations)
                    {
                        var existingLocation = await _locationRepository.FindLocation(inputLocation.Latitude, inputLocation.Longitude);
                        //check if the location already in the DB
                        if (existingLocation != null)
                        {
                            //check if there is already relation between the user and the location
                            if (!user.UserLocations.Any(ul => ul.LocationId == existingLocation.LocationId))
                            {
                                user.UserLocations.Add(new UsersLocationsModel
                                {
                                    UserId = user.Id,
                                    LocationId = existingLocation.LocationId
                                });
                            }
                        }
                        else
                        {
                            LocationModel newLocation = new()
                            {
                                LocationId = Guid.NewGuid().ToString(),
                                Name = inputLocation.Name,
                                Latitude = inputLocation.Latitude,
                                Longitude = inputLocation.Longitude,
                                Character = inputLocation.Character,
                                Address = inputLocation.Address,
                            };
                            await _locationRepository.CreateLocation(newLocation);

                            user.UserLocations.Add(new UsersLocationsModel
                            {
                                UserId = user.Id,
                                LocationId = newLocation.LocationId
                            });
                        }
                    }
                }
                // List<KidModel> kids = userInput.Kids?.Select(kid => new KidModel
                // {
                //     Id = kid.Id,
                //     Name = kid.Name,
                //     Gender = kid.Gender,
                //     Birthday = kid.Birthday,
                //     UserId = user.Id
                // }).ToList();
                // user.Kids = kids;

                user = await _userRepository.CreateUser(user);

                // LocationModel personalLocation = user.UserLocations
                //     .Select(ul => ul.Location)
                //     .FirstOrDefault(l => l.Character == "Personal");

                UserMutationResult userToAdd = new()
                {
                    Id = user.Id,
                    Name = user.Name,
                    // Location = new LocationType
                    // {
                    //     LocationId = personalLocation.LocationId,
                    //     Name = personalLocation.Name,
                    //     Latitude = personalLocation.Latitude,
                    //     Longitude = personalLocation.Longitude,
                    //     Character = personalLocation.Character,
                    //     Address = personalLocation.Address
                    // },
                    // Image = user.Image,
                    // Gender = user.Gender,
                    Locations = user?.UserLocations?.Select(location => new LocationType
                    {
                        LocationId = location.Location.LocationId,
                        Name = location.Location.Name,
                        Latitude = location.Location.Latitude,
                        Longitude = location.Location.Longitude,
                        Character = location.Location.Character,
                        Address = location.Location.Address
                    }).ToList(),
                    // Languages = user.Languages?.Select(language => new LanguageType
                    // {
                    //     LanguageId = language.LanguageId,
                    //     Language = language.Language
                    // }).ToList(),
                    // Chats = user.Chats?.Select(chat => new ChatType
                    // {
                    //     Id = chat.Id,
                    // }).ToList(),
                    // Birthday = user.Birthday,
                };
                // List<KidType> kidsType = user?.Kids?.Select(kid => new KidType
                // {
                //     Id = kid.Id,
                //     Name = kid.Name,
                //     Gender = kid.Gender,
                //     Birthday = kid.Birthday,
                //     UserId = user.Id
                // }).ToList();
                // userToAdd.Kids = kidsType;

                return userToAdd;
            }
            catch (Exception e)
            {
                System.Console.WriteLine(e.Message);
                return null;
            }

        }

        public async Task<UserMutationResult> UpdateUser(UserMutationInput userInput)
        {
            try
            {
                var user = await _userRepository.FindUser(userInput.Id);
                if (userInput.Name != null) user.Name = userInput.Name;
                if (userInput.Image != null) user.Image = userInput.Image;
                if (userInput.Gender != null) user.Gender = userInput.Gender;
                if (userInput.Birthday != null) user.Birthday = userInput.Birthday;
                if (userInput.Locations != null && userInput.Locations.Count > 0)
                {
                    foreach (var inputLocation in userInput.Locations)
                    {
                        var existingLocation = await _locationRepository.FindLocation(inputLocation.Latitude, inputLocation.Longitude);
                        //check if the location already in the DB
                        if (existingLocation != null)
                        {
                            //check if there is already relation between the user and the location
                            if (!user.UserLocations.Any(ul => ul.LocationId == existingLocation.LocationId))
                            {
                                user.UserLocations.Add(new UsersLocationsModel
                                {
                                    UserId = user.Id,
                                    LocationId = existingLocation.LocationId
                                });
                            }
                        }
                        else
                        {
                            LocationModel newLocation = new()
                            {
                                LocationId = Guid.NewGuid().ToString(),
                                Name = inputLocation.Name,
                                Latitude = inputLocation.Latitude,
                                Longitude = inputLocation.Longitude,
                                Character = inputLocation.Character,
                                Address = inputLocation.Address,
                            };
                            await _locationRepository.CreateLocation(newLocation);

                            user.UserLocations.Add(new UsersLocationsModel
                            {
                                UserId = user.Id,
                                LocationId = newLocation.LocationId,
                            });
                        }
                    }
                }

                if (userInput.Languages != null && userInput.Languages.Count > 0)
                {
                    foreach (var inputLanguage in userInput.Languages)
                    {
                        var existingLanguage = await _languageRepository.FindLanguage(inputLanguage.Language);
                        if (existingLanguage != null)
                        {
                            if (!user.UserLanguages.Any(ul => ul.Language == existingLanguage))
                            {
                                user.UserLanguages.Add(new UsersLanguagesModel
                                {
                                    UserId = user.Id,
                                    LanguageId = existingLanguage.LanguageId
                                });
                            }
                        }
                        else
                        {
                            var newLang = await _languageRepository.CreateLanguage(inputLanguage.Language);
                            user.UserLanguages = user.UserLanguages ?? new List<UsersLanguagesModel>();
                            user.UserLanguages.Add(new UsersLanguagesModel
                            {
                                UserId = user.Id,
                                LanguageId = newLang.LanguageId,
                            });
                        }
                    }
                }
                if (userInput.Kids != null && userInput.Kids.Count > 0)
                {
                    foreach (var inputKid in userInput.Kids)
                    {
                        KidModel newKid = new()
                        {
                            Id = Guid.NewGuid().ToString(),
                            Name = inputKid.Name,
                            Gender = inputKid.Gender,
                            Birthday = inputKid.Birthday,
                            UserId = user.Id,
                        };
                        await _kidRepository.CreateKid(newKid);

                        user.Kids = user.Kids ?? new List<KidModel>();
                        user.Kids.Add(newKid);
                    }
                }
                if (userInput.Location != null)
                {
                    var location = await _locationRepository.FindLocation(userInput.Location.Latitude, userInput.Location.Longitude);
                    if (location == null)
                    {
                        location = new LocationModel
                        {
                            LocationId = Guid.NewGuid().ToString(),
                            Name = userInput.Location.Name,
                            Latitude = userInput.Location.Latitude,
                            Longitude = userInput.Location.Longitude,
                            Character = userInput.Location.Character,
                            Address = userInput.Location.Address,
                        };
                        await _locationRepository.CreateLocation(location);
                    }
                    user.UserLocations.Add(new UsersLocationsModel
                    {
                        UserId = user.Id,
                        LocationId = location.LocationId
                    });
                }

                user = await _userRepository.UpdateUser(user);

                user = await _userRepository.FindUser(user.Id);

                LocationModel personalLocation = user.UserLocations?
                    .Select(ul => ul.Location)
                    .FirstOrDefault(l => l.Character == "Personal");

                UserMutationResult userToUpdate = new()
                {
                    Id = user?.Id,
                    Name = user?.Name,
                    Location = personalLocation == null ? null : new LocationType
                    {
                        LocationId = personalLocation?.LocationId,
                        Name = personalLocation?.Name,
                        Latitude = personalLocation.Latitude,
                        Longitude = personalLocation.Longitude,
                        Character = personalLocation?.Character,
                        Address = personalLocation?.Address,
                    },
                    Image = user?.Image,
                    Gender = user?.Gender,
                    Locations = user?.UserLocations?.Select(location => location?.Location == null ? null : new LocationType
                    {
                        LocationId = location?.Location.LocationId,
                        Name = location?.Location.Name,
                        Latitude = location.Location.Latitude,
                        Longitude = location.Location.Longitude,
                        Character = location?.Location.Character,
                        Address = location?.Location.Address
                    }).ToList(),
                    Languages = user.UserLanguages?.Select(ul => ul.Language)?.Select(language => new LanguageType
                    {
                        LanguageId = language.LanguageId,
                        Language = language.Language
                    }).ToList(),
                    Birthday = user?.Birthday,
                    Kids = user.Kids?.Select(kid => kid == null ? null : new KidType
                    {
                        Id = kid?.Id,
                        Name = kid?.Name,
                        Gender = kid?.Gender,
                        Birthday = kid?.Birthday
                    }).ToList()
                };
                return userToUpdate;
            }
            catch (Exception e)
            {
                System.Console.WriteLine(e.Message);
                return null;
            }
        }

        public async Task<bool> RemoveLocationFromUser(string locationId, string userId)
        {

            return await _locationRepository.DeleteLocation(locationId, userId);
        }

        public async Task<bool> DeleteUser(string id)
        {
            return await _userRepository.DeleteUser(id);
        }

        public async Task<bool> DeleteKid(string id)
        {
            return await _kidRepository.DeleteKid(id);
        }

        public async Task<string> UploadUserPicture(string id, IFile file)
        {
            string fileName = $"{id}.jpg";
            var filePath = System.IO.Path.Combine("wwwroot/images", fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            string url = $"images/{fileName}";
            UserModel user = await _userRepository.FindUser(id);
            user.Image = url;
            user = await _userRepository.UpdateUser(user);
            return user.Image;
        }

        public async Task<ChatMutationResult> AddChat(ChatMutationInput chatInput)
        {
            ChatModel chat = await _chatsRepository.CreateChat(chatInput.IdUser1, chatInput.IdUser2);

            ChatMutationResult chatToAdd = new()
            {
                Id = chat.Id,
                Users = chat.UserChats?.Select(uc => uc.User)?.Select(user => new UserType
                {
                    Id = user.Id,
                    Name = user?.Name,
                    Image = user?.Image
                }).ToList()
            };
            return chatToAdd;
        }

        public async Task<MessageMutationResult> CreateMessage(string chatId, string date, string text, string userFromId, [Service] ITopicEventSender topicEventSender, CancellationToken cancellationToken)
        {
            MessageModel message = await _messageRepository.CreateMessage(chatId, DateTime.Now, text, userFromId);
            MessageMutationResult messageToAdd = new()
            {
                Id = message.Id,
                From = new UserType
                {
                    Id = message.From.Id,
                    Name = message.From.Name,
                    Image = message.From.Image,
                },
                To = new UserType
                {
                    Id = message.To.Id,
                    Name = message.To.Name,
                    Image = message.To.Image,
                },
                Text = message.Text,
                Date = message.Date,
                ChatId = message.ChatId,
            };
            await topicEventSender.SendAsync(messageToAdd.From.Id, messageToAdd, cancellationToken);
            await topicEventSender.SendAsync(messageToAdd.To.Id, messageToAdd, cancellationToken);
            return messageToAdd;
        }

    }

}