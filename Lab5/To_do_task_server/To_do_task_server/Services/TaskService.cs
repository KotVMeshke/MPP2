using To_do_List_Server.Tasks.DTO;
using To_do_List_Server.Tasks.Utils;
using To_do_task_server.DTO;
using System.IO;
using System.Text;
using System.Buffers.Text;
using To_Do_task_server.DTO;
using System.Threading.Tasks;

namespace To_do_task_server.Services
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

        public async Task<bool> AddTask(string user, TaskRequestDTO task)
        {
            var tasks = await GetTasks(user, "All");
            var newTask = new TaskResponceDTO()
            {
                Id = tasks.Count == 0 ? 1 : tasks.Count + 1,
                DueDate = task.DueDate,
                File = await UploadFile(task?.File),
                Status = task.Status,
                Title = task.Title
            };
            await TaskStorage.AddTask(user, newTask);
                
            return true;
        }

        public async Task<bool> UpdateTask(string user, TaskRequestDTO task)
        {
            var newTask = new TaskResponceDTO()
            {
                Id = task.Id,
                DueDate = task.DueDate,
                File = await UploadFile(task.File),
                Status = task.Status,
                Title = task.Title
            };
            await TaskStorage.UpdateTask(user, newTask);
            return true;
        }

        public async Task<bool> DeleteTask(string user, int id)
        {
            await TaskStorage.DeleteTask(user, id);
            return true;
        }

        private async Task<string?> UploadFile(FileRequestDTO? file)
        {
            if (file is null) return null;
            var fileName = $"{DateTime.Now.Ticks}-{file.FileName}";
            var fullPath = System.IO.Path.Combine("C:\\Users\\dimon\\OneDrive\\Рабочий стол\\Study\\Универ\\Курс 4\\Семестр 7\\СПП\\Lab5\\Uploads", fileName);
            var fileBytes = Convert.FromBase64String(file.FileBase64);
            await File.WriteAllBytesAsync(fullPath, fileBytes);
            return fileName;
        }

        public async Task<string> GetFile(string file)
        {
            var fullPath = System.IO.Path.Combine("C:\\Users\\dimon\\OneDrive\\Рабочий стол\\Study\\Универ\\Курс 4\\Семестр 7\\СПП\\Lab5\\Uploads", file);
            return Convert.ToBase64String(await File.ReadAllBytesAsync(fullPath));
        }
    }
}
