using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using To_do_List_Server.Files.Endpoints;
using To_do_List_Server.Tasks.Endpoints;
using To_do_List_Server.Tasks.Service;
using To_do_List_Server.Users.Endpoints;
using To_do_List_Server.Users.Service;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(setup =>
{
    setup.AddPolicy("ReactPolicy", builder =>
    {
        builder.WithOrigins("http://localhost:3000")
        .AllowCredentials()
        .AllowAnyMethod()
        .AllowAnyHeader();
    });
});
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<TaskService>();

builder.Configuration.AddJsonFile("appparams.json");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var config = builder.Configuration;
        options.TokenValidationParameters = new TokenValidationParameters()
        {
            ValidAudience = config["JwtParameters:Audience"],
            ValidateAudience = true,
            ValidIssuer = config["JwtParameters:Issuer"],
            ValidateIssuer = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["JwtParameters:Key"]!)),
            ClockSkew = TimeSpan.Zero
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (context.Request.Cookies.ContainsKey("jwtToken"))
                {
                    context.Token = context.Request.Cookies["jwtToken"];
                }
                return Task.CompletedTask;
            }
        };


    });

builder.Services.AddAuthorization();

var app = builder.Build();
app.UseCors("ReactPolicy");

app.UseAuthentication();
app.UseAuthorization();
app.MapGroup("user").MapUser();
app.MapGroup("tasks").MapTask();
app.MapGroup("files").MapFiles();


app.Run();
