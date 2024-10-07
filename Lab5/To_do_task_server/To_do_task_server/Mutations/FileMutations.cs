using HotChocolate.Authorization;
using Microsoft.AspNetCore.Mvc;
using To_do_task_server.DTO;
using To_do_task_server.Services;

namespace To_do_task_server.Mutations
{
    public class FileMutations
    {
        [Authorize]
        public async Task<FileResponceDTO> GetFile([FromServices] TaskService service, string file)
        {
            var fileData = await service.GetFile(file);
            return new FileResponceDTO() { FileBase64 = fileData, FileName = file };
        }
    }
}
