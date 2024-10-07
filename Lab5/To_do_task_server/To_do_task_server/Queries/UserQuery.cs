using Microsoft.AspNetCore.Mvc;
using To_do_List_Server.Users.DTO;
using To_do_List_Server.Users.Utils;
using To_do_task_server.Services;

namespace To_do_task_server.Queries
{
    public class UserQuery
    {
        public User Hello() => new User();
    }
}
