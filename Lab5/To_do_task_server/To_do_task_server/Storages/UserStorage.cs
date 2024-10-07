
using To_do_List_Server.Tasks.Utils;

namespace To_do_List_Server.Users.Utils
{
    public class UserStorage
    {
        public static List<User> Users = new List<User>
        {
            
        };

        public static async Task<User?> GetUser(string username, string password)
        {
            return await Task.Run(() => Users.FirstOrDefault(u => u.Username == username && u.Password == password));
        }

        public static async Task<User?> CreateUser(string username, string password)
        {
            return await Task.Run(async () =>
            {
                if (Users.FirstOrDefault(u => u.Username == username) is not null)
                    return null;
                var newUser = new User { Username = username, Password = password };
                Users.Add(newUser);
                await TaskStorage.CreateUserStorage(username);
                return newUser;
            });
        }
    }
}
