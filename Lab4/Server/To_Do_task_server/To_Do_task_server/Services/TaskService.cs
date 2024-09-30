using To_do_List_Server.Tasks.DTO;
using To_do_List_Server.Tasks.Utils;

namespace To_Do_task_server.Services
{
    public class TaskService
    {
        public async Task<TaskResponceDTO?> GetTaskById(string user, int id)
        {
            return await TaskStorage.GetTaskById(user, id);
        }
        public async Task<List<TaskResponceDTO>?> GetTasks(string user, string status)
        {
            return await TaskStorage.GetTasks(user, status);
        }

        public async Task<bool> AddTask(string user, TaskResponceDTO task)
        {
            await TaskStorage.AddTask(user, task);
            return true;
        }

        public async Task<bool> UpdateTask(string user, TaskResponceDTO task)
        {
            await TaskStorage.UpdateTask(user, task);
            return true;
        }

        public async Task<bool> DeleteTask(string user, int id)
        {
            await TaskStorage.DeleteTask(user, id);
            return true;
        }
    }
}
