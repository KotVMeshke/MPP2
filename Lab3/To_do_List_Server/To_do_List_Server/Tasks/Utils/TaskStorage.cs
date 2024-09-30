using To_do_List_Server.Tasks.DTO;

namespace To_do_List_Server.Tasks.Utils
{
    public class TaskStorage
    {
        private static Dictionary<string, List<TaskDTO>> tasks = new()
        { 
            {"user1", new List<TaskDTO>()} 
        };

        public static async Task CreateUserStorage(string user)
        {
            await Task.Run(() =>
            {
                tasks.Add(user,new List<TaskDTO>());
            });
        }
        public static async Task<List<TaskDTO>?> GetTasks(string user)
        {
            return await Task.Run(() =>
            {
                if (tasks.ContainsKey(user))
                {
                    return tasks[user];
                }
                else
                {
                    return null;
                }
            });

        }

        public static async Task AddTask(string user, TaskDTO task)
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

        public static async Task<TaskDTO?> UpdateTask(string user, TaskDTO task)
        {
            return await Task.Run(() =>
            {
                if (tasks.ContainsKey(user))
                {
                    var existedTask = tasks[user].FirstOrDefault(t => t.Id == task.Id);
                    if (existedTask is null)
                        return null;
                    existedTask = new TaskDTO()
                    {
                        Id = task.Id,
                        DueDate = task.DueDate is null ? existedTask.DueDate : task.DueDate,
                        File = task.File is null ? existedTask.File : task.File,
                        Status = task.Status is null ? existedTask.Status : task.Status,
                        Title = task.Title is null ? existedTask.Title : task.Title,

                    };
                    return existedTask;
                }
                else
                {
                    return null;
                }
            });
        }

        public static async Task<bool> DeleteTask(string user,int id)
        {
            return await Task.Run(() =>
            {
                tasks[user].Remove(tasks[user].FirstOrDefault(t => t.Id == id));
                return true;
            });
        }

    }
}
