using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sweetVenomServer.Data;
using sweetVenomServer.Models;
using Xunit;

namespace sweetVenomServer.Tests
{
    public class BiscuitsControllerTests
    {
        private CakeShopContext GetInMemoryContext()
        {
            var options = new DbContextOptionsBuilder<CakeShopContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            return new CakeShopContext(options);
        }

        [Fact]
        public async Task GetAll_ReturnsAllBiscuits()
        {
            var context = GetInMemoryContext();
            context.Biscuits.AddRange(
                new Biscuit { Id = 1, Name = "Бісквіт 1" },
                new Biscuit { Id = 2, Name = "Бісквіт 2" }
            );
            await context.SaveChangesAsync();

            var controller = new BiscuitsController(context);
            var result = await controller.GetAll();

            var biscuits = Assert.IsAssignableFrom<IEnumerable<Biscuit>>(result.Value);
            Assert.Equal(2, biscuits.Count());
        }

        [Fact]
        public async Task GetById_ReturnsBiscuit_WhenExists()
        {
            var context = GetInMemoryContext();
            context.Biscuits.Add(new Biscuit { Id = 1, Name = "Бісквіт 1" });
            await context.SaveChangesAsync();

            var controller = new BiscuitsController(context);
            var result = await controller.GetById(1);

            Assert.Equal("Бісквіт 1", result.Value!.Name);
        }

        [Fact]
        public async Task GetById_ReturnsNotFound_WhenDoesNotExist()
        {
            var context = GetInMemoryContext();
            var controller = new BiscuitsController(context);

            var result = await controller.GetById(999);

            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task Create_AddsBiscuit()
        {
            var context = GetInMemoryContext();
            var controller = new BiscuitsController(context);

            await controller.Create(new Biscuit { Name = "Новий бісквіт" });

            Assert.Equal(1, await context.Biscuits.CountAsync());
        }

        [Fact]
        public async Task Delete_RemovesBiscuit_WhenExists()
        {
            var context = GetInMemoryContext();
            context.Biscuits.Add(new Biscuit { Id = 1, Name = "Бісквіт" });
            await context.SaveChangesAsync();

            var controller = new BiscuitsController(context);
            var result = await controller.Delete(1);

            Assert.IsType<NoContentResult>(result);
            Assert.Equal(0, await context.Biscuits.CountAsync());
        }

        [Fact]
        public async Task Delete_ReturnsNotFound_WhenDoesNotExist()
        {
            var context = GetInMemoryContext();
            var controller = new BiscuitsController(context);

            var result = await controller.Delete(999);

            Assert.IsType<NotFoundResult>(result);
        }
    }
}