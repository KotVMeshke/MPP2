using To_do_List_Server.Tasks.DTO;

namespace To_do_List_Server.Tasks.Utils
{
    public class TaskStorage
    {
        private static Dictionary<string, List<TaskResponceDTO>> tasks = new()
        {
            {"user1", new List<TaskResponceDTO>(){ new TaskResponceDTO() { DueDate = DateTime.UtcNow, File = null, Id = 1, Status = "Competed", Title = "Task1"} } }
        };

        public static async Task CreateUserStorage(string user)
        {
            await Task.Run(() =>
            {
                tasks.Add(user, new List<TaskResponceDTO>());
            });
        }

        public static async Task<TaskResponceDTO?> GetTaskById(string user, int id)
        {
            return await Task.Run(() =>
            {
                if (tasks.ContainsKey(user))
                {
                    return tasks[user].FirstOrDefault(t => t.Id == id);
                }
                else
                {
                    return null;
                }
            });
        }
        public static async Task<List<TaskResponceDTO>?> GetTasks(string user, string status)
        {
            return await Task.Run(() =>
            {
                if (tasks.ContainsKey(user))
                {
                    if (status == "All")
                    {
                        return tasks[user];
                    }
                    return tasks[user].Where(t => t.Status!.Equals(status,StringComparison.OrdinalIgnoreCase)).ToList();
                }
                else
                {
                    return null;
                }
            });

        }

        public static async Task AddTask(string user, TaskResponceDTO task)
        {
            await Task.Run(() =>
            {
                if (tasks.ContainsKey(user))
                    tasks[user].Add(task);
                else
                {
                    tasks.Add(user, [task]);
                }
            });
        }

        public static async Task<TaskResponceDTO?> UpdateTask(string user, TaskResponceDTO task)
        {
            return await Task.Run(() =>
            {
                if (tasks.ContainsKey(user))
                {
                    var existedTask = tasks[user].FirstOrDefault(t => t.Id == task.Id);
                    if (existedTask is null)
                        return null;

                    existedTask.DueDate = task.DueDate ?? existedTask.DueDate;
                    existedTask.File = task.File ?? existedTask.File;
                    existedTask.Status = task.Status ?? existedTask.Status;
                    existedTask.Title = task.Title ?? existedTask.Title;

                    
                    return existedTask;
                }
                else
                {
                    return null;
                }
            });
        }

        public static async Task<bool> DeleteTask(string user, int id)
        {
            return await Task.Run(() =>
            {
                tasks[user].Remove(tasks[user].FirstOrDefault(t => t.Id == id));
                return true;
            });
        }

    }
}
