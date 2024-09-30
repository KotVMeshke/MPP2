namespace To_do_List_Server.Tasks.DTO
{
    public record class TaskDTO
    {
        public int Id { get; set; }
        public string? Title { get; set; } = "";
        public string? Status { get; set; } = "";
        public DateTime? DueDate { get; set; }
        public string? File { get; set; } = "";
    }
}
