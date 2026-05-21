using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using sweetVenomServer.Data;
using sweetVenomServer.Models;
using Xunit;

namespace sweetVenomServer.Tests
{
    public class AuthControllerTests
    {
        private CakeShopContext GetInMemoryContext()
        {
            var options = new DbContextOptionsBuilder<CakeShopContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            return new CakeShopContext(options);
        }

        private IConfiguration GetJwtConfig()
        {
            var config = new Dictionary<string, string>
            {
                { "Jwt:Key",      "super_secret_test_key_12345678901234" },
                { "Jwt:Issuer",   "sweetVenomTest" },
                { "Jwt:Audience", "sweetVenomTest" }
            };
            return new ConfigurationBuilder()
                .AddInMemoryCollection(config!)
                .Build();
        }

        [Fact]
        public async Task Register_CreatesUser_WhenEmailIsNew()
        {
            var context = GetInMemoryContext();
            var controller = new AuthController(context, GetJwtConfig());

            var result = await controller.Register(new RegisterDto
            {
                Name = "Test User",
                Email = "test@example.com",
                Password = "password123",
                Phone = "0000000000",
                Role = "Client"
            });

            Assert.IsType<OkObjectResult>(result);
            Assert.Equal(1, await context.Users.CountAsync());
        }

        [Fact]
        public async Task Register_ReturnsBadRequest_WhenEmailAlreadyExists()
        {
            var context = GetInMemoryContext();
            var controller = new AuthController(context, GetJwtConfig());

            var dto = new RegisterDto
            {
                Name = "Test User",
                Email = "dupe@example.com",
                Password = "password123",
                Phone = "0000000000",
                Role = "Client"
            };

            await controller.Register(dto);
            var result = await controller.Register(dto);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Login_ReturnsToken_WhenCredentialsAreValid()
        {
            var context = GetInMemoryContext();
            var controller = new AuthController(context, GetJwtConfig());

            await controller.Register(new RegisterDto
            {
                Name = "Test User",
                Email = "login@example.com",
                Password = "password123",
                Phone = "0000000000",
                Role = "Client"
            });

            var result = await controller.Login(new LoginDto
            {
                Email = "login@example.com",
                Password = "password123"
            });

            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(ok.Value);
        }

        [Fact]
        public async Task Login_ReturnsUnauthorized_WhenPasswordIsWrong()
        {
            var context = GetInMemoryContext();
            var controller = new AuthController(context, GetJwtConfig());

            await controller.Register(new RegisterDto
            {
                Name = "Test User",
                Email = "wrong@example.com",
                Password = "correctpassword",
                Phone = "0000000000",
                Role = "Client"
            });

            var result = await controller.Login(new LoginDto
            {
                Email = "wrong@example.com",
                Password = "wrongpassword"
            });

            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        [Fact]
        public async Task UpdateProfile_UpdatesUser_WhenUserExists()
        {
            var context = GetInMemoryContext();
            var controller = new AuthController(context, GetJwtConfig());

            await controller.Register(new RegisterDto
            {
                Name = "Old Name",
                Email = "update@example.com",
                Password = "password123",
                Phone = "0000000000",
                Role = "Client"
            });

            var user = await context.Users.FirstAsync();

            var result = await controller.UpdateProfile(new UpdateProfileDto
            {
                Id = user.Id,
                Name = "New Name",
                Email = "new@example.com",
                Phone = "1111111111"
            });

            Assert.IsType<OkObjectResult>(result);
            var updated = await context.Users.FindAsync(user.Id);
            Assert.Equal("New Name", updated!.Name);
            Assert.Equal("new@example.com", updated.Email);
        }

        [Fact]
        public async Task UpdateProfile_ReturnsNotFound_WhenUserDoesNotExist()
        {
            var context = GetInMemoryContext();
            var controller = new AuthController(context, GetJwtConfig());

            var result = await controller.UpdateProfile(new UpdateProfileDto
            {
                Id = 999,
                Name = "Ghost",
                Email = "ghost@example.com",
                Phone = "0000000000"
            });

            Assert.IsType<NotFoundResult>(result);
        }
    }
}