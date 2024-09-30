using To_do_List_Server.Tasks.DTO;
using To_do_List_Server.Tasks.Utils;

namespace To_do_List_Server.Tasks.Service
{
    public class TaskService
    {
        public async Task<List<TaskDTO>?> GetTasks(string user, string status)
        {
            return (await TaskStorage.GetTasks(user))?.Where(t => t.Status != status).ToList();
        }

        public async Task<bool> AddTask(string user, TaskDTO task)
        {
            await TaskStorage.AddTask(user, task);
            return true;
        }

        public async Task<bool> UpdateTask(string user, TaskDTO task)
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
