using HotChocolate.Authorization;
using Microsoft.AspNetCore.Mvc;
using To_do_List_Server.Tasks.DTO;
using To_do_task_server.Services;
using To_Do_task_server.DTO;

namespace To_do_task_server.Queries
{
    public class TaskQuery
    {
        [Authorize]
        public async Task<List<TaskResponceDTO>?> GetTasks([FromServices] TaskService service, string username, string status) =>
           await service.GetTasks(username, status);
    }
}
