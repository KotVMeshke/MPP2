using Microsoft.AspNetCore.Mvc;
using To_do_List_Server.Users.DTO;
using To_do_task_server.DTO;
using To_do_task_server.Services;

namespace To_do_task_server.Mutations
{
    public class UserMutations
    {
        public async Task<AccessTokenDTO?> Authorize([FromServices] UserService service, string username, string password)
        {
            var token = await service.Login(username, password);
            return new() { AccessToken = token };
        }

        public async Task<AccessTokenDTO?> Register([FromServices] UserService service, string username, string password)
        {
            var token = await service.Register(username, password);
            return new() { AccessToken = token };
        }
    }
}
