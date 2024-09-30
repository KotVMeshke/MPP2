using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using To_do_List_Server.Users.DTO;
using To_do_List_Server.Users.Utils;

namespace To_do_List_Server.Users.Service
{
    public class UserService(IConfiguration config)
    {

        public async Task<string?> Login(LoginDTO dto)
        {
            var user = await UserStorage.GetUser(dto.Username, dto.Password);
            if (user != null)
            {
                var access_token = CreateToken(user, TimeSpan.FromMinutes(10));
                //var refresh_token = CreateToken(user, TimeSpan.FromMinutes(20));
                return new JwtSecurityTokenHandler().WriteToken(access_token);
            }

            return null;

        }

        public async Task<string?> Register(LoginDTO dto)
        {
            var user = await UserStorage.CreateUser(dto.Username, dto.Password);
            if (user != null)
            {
                var access_token = CreateToken(user, TimeSpan.FromMinutes(10));
                //var refresh_token = CreateToken(user, TimeSpan.FromMinutes(20));
                return new JwtSecurityTokenHandler().WriteToken(access_token);
            }

            return null;

        }
        private JwtSecurityToken CreateToken(User user, TimeSpan exparationTime)
        {
            IEnumerable<Claim> claims =
                [
                    new Claim(ClaimTypes.Name, user.Username),
                ];
            return new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.Add(exparationTime),
                issuer: config["JwtParameters:Issuer"],
                audience: config["JwtParameters:Audience"],
                signingCredentials: new SigningCredentials(
                    new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["JwtParameters:Key"]!)),
                    SecurityAlgorithms.HmacSha256)
            );
        }
    }
}
