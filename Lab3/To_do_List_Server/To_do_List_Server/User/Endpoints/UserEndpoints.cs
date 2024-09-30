using Microsoft.AspNetCore.Mvc;
using To_do_List_Server.Users.DTO;
using To_do_List_Server.Users.Service;

namespace To_do_List_Server.Users.Endpoints
{
    public static class UserEndpoints
    {
        public static void MapUser(this IEndpointRouteBuilder builder)
        {
            builder.MapPost("/login", Login);
            builder.MapPost("/register", Register);
        }

        private static async Task<IResult> Login(HttpContext context, [FromServices] UserService service,[FromBody] LoginDTO login)
        {
            var token = await service.Login(login);
            if (token != null)
            {
                context.Response.Cookies.Append("jwtToken", token, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None

                });
                return Results.Ok();
            }else
            {
                return Results.BadRequest();
            }
        }

        private static async Task<IResult> Register(HttpContext context, [FromServices] UserService service, [FromBody] LoginDTO login)
        {
            var token = await service.Register(login);
            if (token != null)
            {
                context.Response.Cookies.Append("jwtToken", token, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None
                });
                return Results.Ok();
            }
            else
            {
                return Results.BadRequest();
            }
        }

    }
}
