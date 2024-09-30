namespace To_do_List_Server.Files.Endpoints
{
    public static class FileEndpoints
    {
        public static void MapFiles(this IEndpointRouteBuilder builder)
        {
            builder.MapGet("/{fileName}", GetFile);
        }

        public static async Task<IResult> GetFile(string fileName)
        {
            return await Task.Run(() =>
            {
                var fullFilePath = Path.Combine("C:\\Users\\dimon\\OneDrive\\Рабочий стол\\Study\\Универ\\Курс 4\\Семестр 7\\СПП\\Lab3\\Uploads", fileName);
                if (Path.Exists(fullFilePath))
                {
                    var fileStream = new FileStream(fullFilePath, FileMode.Open, FileAccess.Read);
                    var contentType = "application/octet-stream";
                    return Results.File(fileStream, contentType, fileName);
                }
                else
                {
                    return Results.NotFound("File wasn't found");
                }
            });
        }

    }
}
