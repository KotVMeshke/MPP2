namespace To_Do_task_server.DTO
{
    public class RequestParamsDTO
    {
        public string Method { get; set; }
        public int TaskId { get; set; }
        public string TypeOfRequest { get; set; }
        public string UserName { get; set; }
        public string AccessToken { get; set; }
        public string FileName { get; set; }
    }
}
