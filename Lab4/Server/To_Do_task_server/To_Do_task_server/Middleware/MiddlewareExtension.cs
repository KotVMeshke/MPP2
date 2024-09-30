namespace To_Do_task_server.Middleware
{
    public static class MiddlewareExtension
    {
        public static IApplicationBuilder UseWebSocketsM(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<WebSocketMiddleware>();
        }
    }
}
