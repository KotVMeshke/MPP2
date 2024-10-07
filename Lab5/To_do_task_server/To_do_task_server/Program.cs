using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using To_do_task_server.Mutations;
using To_do_task_server.Queries;
using To_do_task_server.Services;

var builder = WebApplication.CreateBuilder(args);
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
        options.Events = new JwtBearerEvents()
        {
           
        };
    });
builder.Services.AddAuthorization();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder
            .WithOrigins("http://localhost:3000")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

builder
    .Services
        .AddGraphQLServer("user")
        .AddQueryType<UserQuery>()
        .AddMutationType<UserMutations>()
         .ModifyOptions(options => options.StrictValidation = false);

builder
    .Services
        .AddGraphQLServer("files")
        .AddAuthorizationCore()
        .AddMutationType<FileMutations>()
        .AddQueryType<FileMutations>()
        .ModifyOptions(options => options.StrictValidation = false);

builder
    .Services
        .AddGraphQLServer("tasks")
        .AddAuthorization()
        .AddQueryType<TaskQuery>()
        .AddMutationType<TaskMutation>()
        .ModifyOptions(options => options.StrictValidation = false);

builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<TaskService>();
var app = builder.Build();
app.UseAuthentication();
app.UseAuthorization();
app.UseCors("AllowAll");
app.MapGraphQL("/user", "user");
app.MapGraphQL("/tasks", "tasks");
app.MapGraphQL("/files", "files");


app.Run();
