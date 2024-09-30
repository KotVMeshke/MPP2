namespace To_Do_task_server.DTO
{
    public record class TaskRequestDTO
    {
        public string? Title { get; set; } = "";
        public string? Status { get; set; }
        public DateTime? DueDate { get; set; }
    }
}
