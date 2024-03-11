using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Runtime.InteropServices;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using backend.Dtos.Account;
using backend.Dtos.Email;
using backend.Services;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AccountController : Controller
    {
        private readonly JWTService _jwtService;
        private readonly SignInManager<User> _signInManager;
        private readonly UserManager<User> _userManager;
        private readonly MailService _mailService;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _facebookHttpClient;
        public AccountController(JWTService jwtService, SignInManager<User> signInManager, UserManager<User> userManager, MailService mailService, IConfiguration configuration)
        {
            _jwtService = jwtService;
            _signInManager = signInManager;
            _userManager = userManager;
            _mailService = mailService;
            _configuration = configuration;
            _facebookHttpClient = new HttpClient
            {
                BaseAddress = new Uri("https://graph.facebook.com")
            };
        }
        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return Unauthorized(new JsonResult (new {message = "User with specified email does not exist"}));
            }
            if (user.EmailConfirmed == false)
            {
                return Unauthorized(new JsonResult (new {message="Please confirm your email"}));
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);

            if (!result.Succeeded)
            {
                return Unauthorized(new JsonResult (new {message="Invalid password for specified email"}));
            }
            return CreateAppUserDto(user);
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterDto model)
        {
            if (await CheckEmailExistsAsync(model.Email))
            {
                return BadRequest(new JsonResult (new {message = $"Email {model.Email} already exists. Please try to use another email"}));
            }

            var newUser = new User {
                Nickname = model.Nickname,
                Email = model.Email.ToLower(),
                UserName = model.Email.ToLower(),
                // EmailConfirmed = true
            };

            var result =   await _userManager.CreateAsync(newUser, model.Password);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            try {
                if (await SendConfirmEmailAsync(newUser)){
                     return Ok(new JsonResult (new {message = "Confirmation email has been sent. Please confirm your email"}));
                }
                return BadRequest(new JsonResult (new {message = "Failed to send email. Please contact support"}));

            } catch(Exception) {
                return BadRequest(new JsonResult (new {message = "Failed to send email. Please contact support"}));
            }
        }

        [HttpPut("confirm-email")]
        public async Task<IActionResult> ConfirmEmail(ConfirmEmailDto model) {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return BadRequest(new JsonResult (new {message = "User with specified email does not exist"}));
            }

            if (user.EmailConfirmed == true) {
                return BadRequest(new JsonResult (new {message = "Email is already confirmed"}));
            }

            var decodedToken = WebEncoders.Base64UrlDecode(model.Token);
            var token = Encoding.UTF8.GetString(decodedToken);

            var result = await _userManager.ConfirmEmailAsync(user, token);

            if (result.Succeeded) {
                return Ok(new JsonResult (new {message = "Email was confirmed"}));
            } else {
                return BadRequest(new JsonResult (new {message = "Email confirmation failed"}));
            }
        }

        [HttpPost("resend-confirm-email")]
        public async Task<IActionResult> ResendConfirmEmail(ResendEmailDto model) {
            
            if (string.IsNullOrEmpty(model.Email)) {
                return BadRequest(new JsonResult (new {message = "Email is required"}));
            }
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return BadRequest(new JsonResult (new {message = "User with specified email does not exist"}));
            }
            
            if (user.EmailConfirmed == true) {
                return BadRequest(new JsonResult (new {message = "Email is already confirmed"}));
            }

            try {
                if (await SendConfirmEmailAsync(user)) {
                    return Ok(new JsonResult (new {message = "Confirmation email has been sent. Please confirm your email"}));
                }
                return BadRequest(new JsonResult (new {message = "Failed to send email. Please contact support"}));

            } catch (Exception) {
                return BadRequest(new JsonResult (new {message = "Failed to send email. Please contact support"}));
            }
        }

        [HttpPut("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto model) {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return BadRequest(new JsonResult (new {message = "User with specified email does not exist"}));
            }
            
            if (user.EmailConfirmed == false) {
                return BadRequest(new JsonResult (new {message = "Please confirm your email first"}));
            }

            try {
                var decodedToken = WebEncoders.Base64UrlDecode(model.Token);
                var token = Encoding.UTF8.GetString(decodedToken);

                var result = await _userManager.ResetPasswordAsync(user, token, model.NewPassword);

                if (result.Succeeded) {
                    return Ok(new JsonResult (new {message = "Password reset successful"}));
                }
                return BadRequest(new JsonResult (new {message = "Failed to reset password. Please contact support"}));

            } catch (Exception) {
                return BadRequest(new JsonResult (new {message = "Failed to reset password. Please contact support"}));
            }
        }
                
        [HttpPost("forgot-credentials")]
        public async Task<IActionResult> ForgotCredentials(ResendEmailDto model) {
            if (string.IsNullOrEmpty(model.Email)) {
                return BadRequest(new JsonResult (new {message = "Email is required"}));
            }
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return BadRequest(new JsonResult (new {message = "User with specified email does not exist"}));
            }

            try {
                if (await SendForgotCredentialsAsync(user)) {
                    return Ok(new JsonResult (new {message = "Reset email has been sent. Please confirm your email"}));
                }
                return BadRequest(new JsonResult (new {message = "Failed to send email. Please contact support"}));

            } catch (Exception) {
                return BadRequest(new JsonResult (new {message = "Failed to send email. Please contact support"}));
            }
        }

        [HttpPost("register-with-third-party")]
        public async Task<ActionResult<UserDto>> RegisterWithThirdParty(RegisterWithThirdPartyDto model)
        {
            if (model.Provider == "google")
            {
                try {
                    if (!GoogleValidatedAsync(model.AccessToken, model.UserId).GetAwaiter().GetResult()) {
                        return BadRequest(new JsonResult (new {message = "Failed to validate google user"}));
                    }
                } catch (Exception) {
                    return BadRequest(new JsonResult (new {message = "Failed to validate google user"}));
                }
            }
            else if (model.Provider == "facebook")
            {
                try {
                    if (!FacebookValidatedAsync(model.AccessToken, model.UserId).GetAwaiter().GetResult()) {
                        return BadRequest(new JsonResult (new {message = "Failed to validate facebook user"}));
                    }
                } catch (Exception) {
                    return BadRequest(new JsonResult (new {message = "Failed to validate facebook user"}));
                }
            }
            else {
                return BadRequest(new JsonResult (new {message = "Invalid provider"}));
            }

            var user = await _userManager.FindByNameAsync(model.UserId);

            if (user != null ) {
                return BadRequest(new JsonResult (new {message = $"User with specified id already exists. Please login with {model.Provider}"}));
            }

            var newUser = new User{
                Nickname = model.Nickname,
                Provider = model.Provider,
                UserName = model.UserId,
            };

            var result = await _userManager.CreateAsync(newUser);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }
            return  CreateAppUserDto(newUser);
        }

        [HttpPost("login-with-third-party")]
        public async Task<ActionResult<UserDto>> LoginWithThirdParty(LoginWithThirdPartyDto model)
        {
            if (model.Provider == "google")
            {
                try {
                    if (!GoogleValidatedAsync(model.AccessToken, model.UserId).GetAwaiter().GetResult()) {
                        return BadRequest(new JsonResult (new {message = "Failed to validate google user - Validation failed"}));
                    }
                } catch (Exception) {
                    return BadRequest(new JsonResult (new {message = "Failed to validate google user - Exceptiom"}));
                }
            }
            else if (model.Provider == "facebook")
            {
                try {
                    if (!FacebookValidatedAsync(model.AccessToken, model.UserId).GetAwaiter().GetResult()) {
                        return BadRequest(new JsonResult (new {message = "Failed to validate facebook user"}));
                    }
                } catch (Exception) {
                    return BadRequest(new JsonResult (new {message = "Failed to validate facebook user"}));
                }
            }
            else {
                return BadRequest(new JsonResult (new {message = "Invalid provider"}));
            }

            var user = await _userManager.Users.FirstOrDefaultAsync(x =>  x.UserName == model.UserId && x.Provider == model.Provider);

            if (user == null ) {
                return BadRequest(new JsonResult (new {message = $"Unable to find requested account"}));
            }
            return  CreateAppUserDto(user);
        }



        [Authorize]
        [HttpGet("refresh-jwt")]
        public async Task<ActionResult<UserDto>> RefreshJWT()
        {
            var user = await _userManager.FindByEmailAsync(User.FindFirst(ClaimTypes.Email)?.Value);
            return CreateAppUserDto(user);
        }

        private async Task<bool> SendConfirmEmailAsync(User user)
        {
           var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
           token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
           var url = $"{_configuration["JWT:ClientUrl"]}/{_configuration["Email:confirmationEmailUrl"]}?token={token}&email={user.Email}";
           var body = $"<h1>Email Confirmation</h1>" +
                    $"<p>Hello, {user.Nickname}</p>" + 
                      $"<p>Please confirm your email by clicking <a href='{url}'>here</a></p>"+
                      $"<p><i>{_configuration["Email:FromName"]}<i></p>";

            var emailToSend = new EmailSendDto(user.Email, "Email Confirmation", body);

            return await _mailService.SendEmailAsync(emailToSend);
        }
        private async Task<bool> SendForgotCredentialsAsync(User user)
        {
           var token = await _userManager.GeneratePasswordResetTokenAsync(user);
           token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
           var url = $"{_configuration["JWT:ClientUrl"]}/{_configuration["Email:resetPasswordUrl"]}?token={token}&email={user.Email}";
           var body = $"<h1>Password reset</h1>" +
                    $"<p>Hello, {user.Nickname}</p>" + 
                      $"<p>To reset your password please click <a href='{url}'>here</a></p>"+
                      $"<p><i>{_configuration["Email:FromName"]}<i></p>";

            var emailToSend = new EmailSendDto(user.Email, "Password reset", body);

            return await _mailService.SendEmailAsync(emailToSend);
        }
        private UserDto CreateAppUserDto(User user)
        {
            return new UserDto
            {
                username = user.Nickname,
                id = user.Id,
                JWT = _jwtService.CreateJWT(user),
            };
        }

        private async Task<bool> CheckEmailExistsAsync(string email)
        {
            return await _userManager.Users.AnyAsync(x => x.Email == email.ToLower());
    }
        private async Task<bool> FacebookValidatedAsync(string accessToken, string userId)
        {
            var facebookKeys = _configuration["Facebook:AppId"] + "|" + _configuration["Facebook:AppSecret"];
            var fbResult = await _facebookHttpClient.GetFromJsonAsync<FacebookResultDto>($"debug_token?input_token={accessToken}&access_token={facebookKeys}");
            if (fbResult == null || fbResult.Data.is_valid == false || !fbResult.Data.user_id.Equals(userId))
            {
                return false;
            }
            return true;
        }
                
        private async Task<bool> GoogleValidatedAsync(string accessToken, string userId)
        {
            var response = await GoogleJsonWebSignature.ValidateAsync(accessToken);
            if (!response.Audience.Equals(_configuration["Google:ClientId"]) || !response.Subject.Equals(userId))
            {
                return false;
            }
            if (!response.Issuer.Equals("accounts.google.com") && !response.Issuer.Equals("https://accounts.google.com"))
            {
                return false;
            }
            if (response.ExpirationTimeSeconds == null) {
                return false;
            }

            DateTime now = DateTime.Now.ToUniversalTime();
            DateTime expiration = DateTimeOffset.FromUnixTimeSeconds((long)response.ExpirationTimeSeconds).DateTime;
            if (now > expiration) {
                return false;
            }
            return true;
        }
}
}