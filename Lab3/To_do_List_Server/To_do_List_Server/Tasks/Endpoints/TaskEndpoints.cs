using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using To_do_List_Server.Tasks.DTO;
using To_do_List_Server.Tasks.Service;
using To_do_List_Server.Tasks.Utils;

namespace To_do_List_Server.Tasks.Endpoints
{
    public static class TaskEndpoints
    {
        public static void MapTask(this IEndpointRouteBuilder builder)
        {
            builder.MapGet("", GetTasks);
            builder.MapPost("", CreateTask)
                .DisableAntiforgery();
            builder.MapPut("/{id:int}", UpdateTask)
                .DisableAntiforgery();

            builder.MapDelete("/{id:int}", DeleteTask);
        }

        [Authorize]
        private static async Task<IResult> GetTasks(HttpContext context,[FromServices] TaskService service, string? filter)
        {
            var userName = context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name);
            if (string.IsNullOrEmpty(filter)) filter = "all";
            var tasks = await service.GetTasks(userName!.Value, filter);
            return tasks is not null ? Results.Ok(tasks) : Results.NotFound();
        }

        [Authorize]
        private static async Task<IResult> CreateTask(HttpContext context, [FromServices] TaskService service, [FromForm] string? title, [FromForm] string? status, [FromForm] DateTime? dueDate, [FromForm] IFormFile? file)
        {
            var userName = context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name);
            var userTasks = await TaskStorage.GetTasks(userName!.Value);
            var taskDTO = new TaskDTO()
            {
                Id = userTasks is not null ? userTasks.Count + 1 : 0,
                DueDate = dueDate,
                File = UploadFile(file),
                Status = status,
                Title = title
            };
            var isAdded = await service.AddTask(userName.Value, taskDTO);
            return isAdded ? Results.Ok(taskDTO) : Results.NotFound();
        }
        [Authorize]
        private static async Task<IResult> UpdateTask(HttpContext context,[FromServices] TaskService service,[FromRoute] int id, [FromForm] string? title, [FromForm] string? status, [FromForm] DateTime? dueDate, [FromForm] IFormFile? file)
        {
            var userName = context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)!.Value;

            var userTasks = await TaskStorage.GetTasks(userName);
            var taskDTO = new TaskDTO()
            {
                Id = id,
                DueDate = dueDate,
                File = UploadFile(file),
                Status = status,
                Title = title
            };
            var isAdded = await service.UpdateTask(userName, taskDTO);
            return isAdded ? Results.Ok(taskDTO) : Results.NotFound();
        }

        private static string? UploadFile(IFormFile? file)
        {
            if (file == null)
                return null;

            var fileName = $"{DateTime.Now.Ticks}-{file.FileName}";
            var filePath = Path.Combine("C:\\Users\\dimon\\OneDrive\\Рабочий стол\\Study\\Универ\\Курс 4\\Семестр 7\\СПП\\Lab3\\Uploads", fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                file.CopyTo(stream);
            }

            return fileName;
        }

        [Authorize]
        private static async Task<IResult> DeleteTask(HttpContext context,[FromServices] TaskService service,[FromRoute] int id)
        {
            var userName = context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)!.Value;
            var isDeleted = await service.DeleteTask(userName, id);
            return isDeleted ? Results.Ok("Deleted") : Results.Problem("Task wasn't deleted");
        }
    }
}
