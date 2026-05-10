using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sweetVenomServer.Data;
using sweetVenomServer.Models;
using Xunit;

namespace sweetVenomServer.Tests
{

    public class CakesControllerTests
    {
        private CakeShopContext GetInMemoryContext()
        {
            var options = new DbContextOptionsBuilder<CakeShopContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new CakeShopContext(options);
        }

        [Fact]
        public async Task GetAll_ReturnsAllCakes()
        {
            // Arrange
            var context = GetInMemoryContext();
            context.Cakes.AddRange(
                new Cake { Id = 1, Name = "Торт 1", BasePrice = 500 },
                new Cake { Id = 2, Name = "Торт 2", BasePrice = 700 }
            );
            await context.SaveChangesAsync();
            var controller = new CakesController(context);

            // Act
            var result = await controller.GetAll();

            // Assert
            var cakes = Assert.IsType<List<Cake>>(result.Value);
            Assert.Equal(2, cakes.Count);
        }

        [Fact]
        public async Task GetById_ReturnsNotFound_WhenCakeDoesNotExist()
        {
            // Arrange
            var context = GetInMemoryContext();
            var controller = new CakesController(context);

            // Act
            var result = await controller.GetById(999);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task Create_AddsCakeToDatabase()
        {
            // Arrange
            var context = GetInMemoryContext();
            var controller = new CakesController(context);
            var newCake = new Cake { Name = "Новий торт", BasePrice = 900 };

            // Act
            await controller.Create(newCake);

            // Assert
            Assert.Equal(1, await context.Cakes.CountAsync());
        }
    }
}
