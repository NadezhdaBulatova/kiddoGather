using usersService.Models;

namespace usersService.Interfaces
{
    public interface UserRepositoryInterface
    {
        Task<UserModel> CreateUser(UserModel user);
        Task<UserModel> UpdateUser(UserModel user);
        Task<bool> DeleteUser(string id);
        Task<UserModel> FindUser(string id);
        Task<List<UserModel>> GetAllUsers();
    }
}