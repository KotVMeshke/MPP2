using To_do_task_server.DTO;

namespace To_Do_task_server.DTO
{
    public record class TaskRequestDTO
    {
        public int Id { get; set; }
        public string? Title { get; set; } = "";
        public string? Status { get; set; }
        public DateTime? DueDate { get; set; }
        public FileRequestDTO? File { get; set; }
    }
}
