using Microsoft.AspNetCore.Mvc;
using To_do_List_Server.Tasks.DTO;
using To_Do_task_server.DTO;
using To_do_task_server.Services;
using HotChocolate.Authorization;

namespace To_do_task_server.Mutations
{
    public class TaskMutation
    {
        [Authorize]
        public async Task<List<TaskResponceDTO>?> AddTask(
            [FromServices] TaskService service, 
            TaskRequestDTO task, 
            string username, 
            string status)
        {
            await service.AddTask(username, task);
            return await service.GetTasks(username, status);
        }

        [Authorize]
        public async Task<List<TaskResponceDTO>?> UpdateTask(
            [FromServices] TaskService service,
            TaskRequestDTO task,
            string username, 
            string status)
        {
            await service.UpdateTask(username, task);
            return await service.GetTasks(username, status);
        }

        [Authorize]
        public async Task<List<TaskResponceDTO>?> DeleteTask(
            [FromServices] TaskService service,
            string username, int taskId, 
            string status)
        {
            await service.DeleteTask(username, taskId);
            return await service.GetTasks(username, status);
        }
    }
}
