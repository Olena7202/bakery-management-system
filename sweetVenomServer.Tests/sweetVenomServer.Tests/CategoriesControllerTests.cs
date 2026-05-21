using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sweetVenomServer.Data;
using sweetVenomServer.Models;
using Xunit;

namespace sweetVenomServer.Tests
{
    public class CategoriesControllerTests
    {
        private CakeShopContext GetInMemoryContext()
        {
            var options = new DbContextOptionsBuilder<CakeShopContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            return new CakeShopContext(options);
        }

        [Fact]
        public async Task GetAll_ReturnsAllCategories()
        {
            var context = GetInMemoryContext();
            context.Categories.AddRange(
                new Category { Id = 1, Name = "Категорія 1" },
                new Category { Id = 2, Name = "Категорія 2" }
            );
            await context.SaveChangesAsync();

            var controller = new CategoriesController(context);
            var result = await controller.GetAll();

            var categories = Assert.IsAssignableFrom<IEnumerable<Category>>(result.Value);
            Assert.Equal(2, categories.Count());
        }

        [Fact]
        public async Task GetById_ReturnsCategory_WhenExists()
        {
            var context = GetInMemoryContext();
            context.Categories.Add(new Category { Id = 1, Name = "Категорія 1" });
            await context.SaveChangesAsync();

            var controller = new CategoriesController(context);
            var result = await controller.GetById(1);

            Assert.Equal("Категорія 1", result.Value!.Name);
        }

        [Fact]
        public async Task GetById_ReturnsNotFound_WhenDoesNotExist()
        {
            var context = GetInMemoryContext();
            var controller = new CategoriesController(context);

            var result = await controller.GetById(999);

            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task Create_AddsCategory()
        {
            var context = GetInMemoryContext();
            var controller = new CategoriesController(context);

            await controller.Create(new Category { Name = "Нова категорія" });

            Assert.Equal(1, await context.Categories.CountAsync());
        }

        [Fact]
        public async Task Delete_RemovesCategory_WhenExists()
        {
            var context = GetInMemoryContext();
            context.Categories.Add(new Category { Id = 1, Name = "Категорія" });
            await context.SaveChangesAsync();

            var controller = new CategoriesController(context);
            var result = await controller.Delete(1);

            Assert.IsType<NoContentResult>(result);
            Assert.Equal(0, await context.Categories.CountAsync());
        }

        [Fact]
        public async Task Delete_ReturnsNotFound_WhenDoesNotExist()
        {
            var context = GetInMemoryContext();
            var controller = new CategoriesController(context);

            var result = await controller.Delete(999);

            Assert.IsType<NotFoundResult>(result);
        }
    }
}