using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sweetVenomServer.Data;
using sweetVenomServer.Models;
using Xunit;

namespace sweetVenomServer.Tests
{
    public class CreamsControllerTests
    {
        private CakeShopContext GetInMemoryContext()
        {
            var options = new DbContextOptionsBuilder<CakeShopContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            return new CakeShopContext(options);
        }

        [Fact]
        public async Task GetAll_ReturnsAllCreams()
        {
            var context = GetInMemoryContext();
            context.Creams.AddRange(
                new Cream { Id = 1, Name = "Крем 1" },
                new Cream { Id = 2, Name = "Крем 2" }
            );
            await context.SaveChangesAsync();

            var controller = new CreamsController(context);
            var result = await controller.GetAll();

            var creams = Assert.IsAssignableFrom<IEnumerable<Cream>>(result.Value);
            Assert.Equal(2, creams.Count());
        }

        [Fact]
        public async Task GetById_ReturnsCream_WhenExists()
        {
            var context = GetInMemoryContext();
            context.Creams.Add(new Cream { Id = 1, Name = "Крем 1" });
            await context.SaveChangesAsync();

            var controller = new CreamsController(context);
            var result = await controller.GetById(1);

            Assert.Equal("Крем 1", result.Value!.Name);
        }

        [Fact]
        public async Task GetById_ReturnsNotFound_WhenDoesNotExist()
        {
            var context = GetInMemoryContext();
            var controller = new CreamsController(context);

            var result = await controller.GetById(999);

            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task Create_AddsCream()
        {
            var context = GetInMemoryContext();
            var controller = new CreamsController(context);

            await controller.Create(new Cream { Name = "Новий крем" });

            Assert.Equal(1, await context.Creams.CountAsync());
        }

        [Fact]
        public async Task Delete_RemovesCream_WhenExists()
        {
            var context = GetInMemoryContext();
            context.Creams.Add(new Cream { Id = 1, Name = "Крем" });
            await context.SaveChangesAsync();

            var controller = new CreamsController(context);
            var result = await controller.Delete(1);

            Assert.IsType<NoContentResult>(result);
            Assert.Equal(0, await context.Creams.CountAsync());
        }

        [Fact]
        public async Task Delete_ReturnsNotFound_WhenDoesNotExist()
        {
            var context = GetInMemoryContext();
            var controller = new CreamsController(context);

            var result = await controller.Delete(999);

            Assert.IsType<NotFoundResult>(result);
        }
    }
}