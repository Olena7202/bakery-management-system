using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sweetVenomServer.Data;
using sweetVenomServer.Models;
using Xunit;

namespace sweetVenomServer.Tests
{
    public class SavedCakesControllerTests
    {
        private CakeShopContext GetInMemoryContext()
        {
            var options = new DbContextOptionsBuilder<CakeShopContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            return new CakeShopContext(options);
        }

        [Fact]
        public async Task Save_AddsSavedCake_WhenNotAlreadySaved()
        {
            var context = GetInMemoryContext();
            var controller = new SavedCakesController(context);

            var result = await controller.Save(new SavedCake { ClientId = 1, CakeId = 1 });

            Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(1, await context.SavedCakes.CountAsync());
        }

        [Fact]
        public async Task Save_ReturnsBadRequest_WhenAlreadySaved()
        {
            var context = GetInMemoryContext();
            context.SavedCakes.Add(new SavedCake { Id = 1, ClientId = 1, CakeId = 1, SavedAt = DateTime.UtcNow });
            await context.SaveChangesAsync();

            var controller = new SavedCakesController(context);
            var result = await controller.Save(new SavedCake { ClientId = 1, CakeId = 1 });

            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetByClient_ReturnsOnlyClientSavedCakes()
        {
            var context = GetInMemoryContext();
            context.SavedCakes.AddRange(
                new SavedCake { Id = 1, ClientId = 1, CakeId = 1, SavedAt = DateTime.UtcNow },
                new SavedCake { Id = 2, ClientId = 2, CakeId = 2, SavedAt = DateTime.UtcNow }
            );
            await context.SaveChangesAsync();

            var controller = new SavedCakesController(context);
            var result = await controller.GetByClient(1);

            var saved = Assert.IsAssignableFrom<IEnumerable<SavedCake>>(result.Value);
            Assert.All(saved, s => Assert.Equal(1, s.ClientId));
        }

        [Fact]
        public async Task Delete_RemovesSavedCake_WhenExists()
        {
            var context = GetInMemoryContext();
            context.SavedCakes.Add(new SavedCake { Id = 1, ClientId = 1, CakeId = 1, SavedAt = DateTime.UtcNow });
            await context.SaveChangesAsync();

            var controller = new SavedCakesController(context);
            var result = await controller.Delete(1);

            Assert.IsType<NoContentResult>(result);
            Assert.Equal(0, await context.SavedCakes.CountAsync());
        }

        [Fact]
        public async Task Delete_ReturnsNotFound_WhenDoesNotExist()
        {
            var context = GetInMemoryContext();
            var controller = new SavedCakesController(context);

            var result = await controller.Delete(999);

            Assert.IsType<NotFoundResult>(result);
        }
    }
}