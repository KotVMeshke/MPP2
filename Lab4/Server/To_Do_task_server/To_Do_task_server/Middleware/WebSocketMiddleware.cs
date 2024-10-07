using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.VisualBasic;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using To_do_List_Server.Tasks.DTO;
using To_do_List_Server.Tasks.Utils;
using To_Do_task_server.DTO;
using To_Do_task_server.Services;

namespace To_Do_task_server.Middleware
{
    public class WebSocketMiddleware
    {

        private readonly Dictionary<string,List<WebSocket>> connections = new(); 
        public WebSocketMiddleware(RequestDelegate _)
        {

        }

        public async Task InvokeAsync(HttpContext context, UserService userService, TaskService taskService, IConfiguration config)
        {
            if (context.WebSockets.IsWebSocketRequest)
            {
                var webSocket = await context.WebSockets.AcceptWebSocketAsync();
                await HandleRequest(webSocket, userService, taskService, config);
            }

        }

        public async Task HandleRequest(WebSocket webSocket, UserService userService, TaskService taskService, IConfiguration config)
        {
            try
            {


                var buffer = new byte[1024 * 4];
                Console.WriteLine(webSocket.State);
                var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                bool isValid = true;
                while (!result.CloseStatus.HasValue)
                {
                    //Console.WriteLine(message);
                    var splitedMessage = message.Split('/');
                    var options = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    };
                    var requestParams = JsonSerializer.Deserialize<RequestParamsDTO>(splitedMessage[0], options);
                    RequestPayload? payload = null;
                    string? file = null;
                    if (splitedMessage.Length >= 2)
                        payload = JsonSerializer.Deserialize<RequestPayload>(splitedMessage[1], options);
                    if (splitedMessage.Length >= 3)
                        file = message.Substring((splitedMessage[0] + "/" + splitedMessage[1] + "/").Length);

                    if (requestParams?.Method != "AUTH" && requestParams?.Method != "REG")
                    {
                        isValid = await ValidateToken(requestParams?.AccessToken!, config);
                        if (!isValid)
                        {
                            var statusCode = Encoding.UTF8.GetBytes(401.ToString());
                            await webSocket.SendAsync(new ArraySegment<byte>(statusCode, 0, statusCode.Length), WebSocketMessageType.Text, WebSocketMessageFlags.EndOfMessage, CancellationToken.None);
                        }

                    }
                    if (isValid)
                    {


                        switch (requestParams?.Method)
                        {
                            case "GET":
                                if (requestParams.TypeOfRequest == "FILE")
                                {
                                    await SendFile(webSocket,  payload.Param1);
                                }
                                else
                                {
                                    var tasks = await taskService.GetTasks(requestParams.UserName, payload!.Param1);

                                    var serializedTasks = JsonSerializer.Serialize(tasks);
                                    byte[] messageBuffer = Encoding.UTF8.GetBytes(serializedTasks);
                                    await webSocket.SendAsync(new ArraySegment<byte>(messageBuffer), WebSocketMessageType.Text, WebSocketMessageFlags.EndOfMessage, CancellationToken.None);
                                }
                                
                                break;
                            case "ADD":
                                var userTasks = await TaskStorage.GetTasks(requestParams.UserName, "All");
                                var taskDTO = new TaskResponceDTO()
                                {
                                    Id = userTasks is not null ? userTasks.Count + 1 : 1,
                                    DueDate = DateTime.Parse(payload?.Param3!),
                                    Status = payload?.Param2,
                                    Title = payload?.Param1,
                                    File = null
                                };
                                if (file is not null)
                                {
                                    var fileName = $"{DateTime.Now.Ticks}-{requestParams.FileName}";
                                    await UploadFile(file, Path.Combine("C:\\Users\\dimon\\OneDrive\\Рабочий стол\\Study\\Универ\\Курс 4\\Семестр 7\\СПП\\Lab4\\Uploads", fileName));
                                    taskDTO.File = fileName;
                                }

                                var isAdded = await taskService.AddTask(requestParams.UserName, taskDTO);
                                var users = connections[requestParams!.UserName];
                                foreach (var user in users)
                                {

                                    await SendUpdatedTasks(user, requestParams.UserName, taskService, payload.Param4);

                                }
                                break;
                            case "UPDATE":
                                userTasks = await TaskStorage.GetTasks(requestParams.UserName, "All");
                                taskDTO = new TaskResponceDTO()
                                {
                                    Id = requestParams.TaskId,
                                    DueDate = DateTime.Parse(payload?.Param3!),
                                    Status = payload?.Param2,
                                    Title = payload?.Param1,
                                    File = null
                                };
                                if (file is not null)
                                {
                                    var fileName = $"{DateTime.Now.Ticks}-{requestParams.FileName}";
                                    await UploadFile(file, Path.Combine("C:\\Users\\dimon\\OneDrive\\Рабочий стол\\Study\\Универ\\Курс 4\\Семестр 7\\СПП\\Lab4\\Uploads", fileName));
                                    taskDTO.File = fileName;
                                }

                                await taskService.UpdateTask(requestParams.UserName, taskDTO);
                                users = connections[requestParams!.UserName];
                                foreach (var user in users)
                                {

                                    await SendUpdatedTasks(user, requestParams.UserName, taskService, payload.Param4);

                                }
                                break;
                            case "DEL":
                                await taskService.DeleteTask(requestParams.UserName, requestParams.TaskId);
                                users = connections[requestParams!.UserName];
                                foreach (var user in users)
                                {

                                    await SendUpdatedTasks(user, requestParams.UserName, taskService, payload.Param4);

                                }
                                break;
                            case "AUTH":
                                var accesToken = await userService.Login(payload!.Param1, payload!.Param2);
                                var json = JsonSerializer.Serialize(new { accessToken = accesToken }, options);
                                var bytes = Encoding.UTF8.GetBytes(json);
                                await webSocket.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, WebSocketMessageFlags.EndOfMessage, CancellationToken.None);
                                if (accesToken is not null)
                                {
                                    await SendUpdatedTasks(webSocket, payload!.Param1, taskService, null);
                                    if (connections.ContainsKey(payload!.Param1))
                                        connections[payload!.Param1].Add(webSocket);
                                    else
                                    {
                                        connections.Add(payload!.Param1, new());
                                        connections[payload!.Param1].Add(webSocket);
                                    }
                                }
                                break;
                            case "REG":
                                accesToken = await userService.Register(payload!.Param1, payload!.Param2);
                                json = JsonSerializer.Serialize(new { accessToken = accesToken }, options);
                                bytes = Encoding.UTF8.GetBytes(json);
                                await webSocket.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, WebSocketMessageFlags.EndOfMessage, CancellationToken.None);
                                if (accesToken is not null)
                                {
                                    await SendUpdatedTasks(webSocket, payload!.Param1, taskService, null);
                                    if (connections.ContainsKey(payload!.Param1))
                                        connections[payload!.Param1].Add(webSocket);
                                    else
                                    {
                                        connections.Add(payload!.Param1, new());
                                        connections[payload!.Param1].Add(webSocket);
                                    }
                                }
                                break;
                            default:
                                break;
                        }

                        message = await ReceiveFullMessage(webSocket);
                    }


                }
                await webSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, CancellationToken.None);

            }
            catch (Exception ex)
            {
                if (webSocket.State != WebSocketState.Closed)
                 await webSocket.CloseAsync(WebSocketCloseStatus.InternalServerError, "It's your fault", CancellationToken.None);
                Console.WriteLine("Exception");
            }
        }
        private async Task<bool> ValidateToken(string token, IConfiguration config)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var result = await tokenHandler.ValidateTokenAsync(token, new TokenValidationParameters()
            {
               

            });
            return result.IsValid;
        }

        private async Task SendFile(WebSocket socket,string file)
        {
            byte[] buffer = new byte[8192];
            var filePath = Path.Combine("C:\\Users\\dimon\\OneDrive\\Рабочий стол\\Study\\Универ\\Курс 4\\Семестр 7\\СПП\\Lab4\\Uploads", file);
            using (FileStream fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read))
            {
                int bytesRead;
                while ((bytesRead = await fileStream.ReadAsync(buffer, 0, buffer.Length)) > 0)
                {
                    await socket.SendAsync(new ArraySegment<byte>(buffer, 0, bytesRead), WebSocketMessageType.Binary, false, CancellationToken.None);
                }
                await socket.SendAsync(new ArraySegment<byte>(buffer, 0, 0), WebSocketMessageType.Binary, true, CancellationToken.None);

                var message = JsonSerializer.Serialize(new { deliveredFile = file });
                byte[] endMessage = System.Text.Encoding.UTF8.GetBytes(message);
                await socket.SendAsync(new ArraySegment<byte>(endMessage), WebSocketMessageType.Text, true, CancellationToken.None);
            }
        }

        private async Task UploadFile(string file, string saveFilePath)
        {
            var fileBytes = Convert.FromBase64String(file);
            await File.WriteAllBytesAsync(saveFilePath, fileBytes);
        }

        private async Task<string> ReceiveFullMessage(WebSocket socket)
        {
            var buffer = new byte[1024 * 4];
            StringBuilder message = new StringBuilder();
            var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            message.Append(Encoding.UTF8.GetString(buffer, 0, result.Count));

            while (!result.EndOfMessage)
            {
                result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                message.Append(Encoding.UTF8.GetString(buffer, 0, result.Count));
            }
            return message.ToString();
        }

        private async Task SendUpdatedTasks(WebSocket webSocket, string userName, TaskService taskService, string status)
        {
            var tasks = await taskService.GetTasks(userName, status ?? "All");
            var serializedTasks = JsonSerializer.Serialize(tasks);
            if (webSocket.State == WebSocketState.Open)
            await webSocket.SendAsync(new ArraySegment<byte>(Encoding.UTF8.GetBytes(serializedTasks)), WebSocketMessageType.Text, WebSocketMessageFlags.EndOfMessage, CancellationToken.None);
        }
    }


}
