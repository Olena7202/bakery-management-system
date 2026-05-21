using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sweetVenomServer.Data;
using sweetVenomServer.Models;
using Xunit;

namespace sweetVenomServer.Tests
{
    public class OrdersControllerTests
    {
        private CakeShopContext GetInMemoryContext()
        {
            var options = new DbContextOptionsBuilder<CakeShopContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            return new CakeShopContext(options);
        }

        [Fact]
        public async Task Create_AddsOrder_WithDefaultStatusAndPayment()
        {
            var context = GetInMemoryContext();
            var controller = new OrdersController(context);

            var order = new Order { ClientId = 1 };
            await controller.Create(order);

            var saved = await context.Orders.FirstAsync();
            Assert.Equal("Pending", saved.Status);
            Assert.Equal("Unpaid", saved.PaymentStatus);
        }

        [Fact]
        public async Task GetById_ReturnsNotFound_WhenDoesNotExist()
        {
            var context = GetInMemoryContext();
            var controller = new OrdersController(context);

            var result = await controller.GetById(999);

            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task GetByClient_ReturnsOnlyClientOrders()
        {
            var context = GetInMemoryContext();
            context.Orders.AddRange(
                new Order { Id = 1, ClientId = 1, Status = "Pending", PaymentStatus = "Unpaid", CreatedAt = DateTime.UtcNow },
                new Order { Id = 2, ClientId = 2, Status = "Pending", PaymentStatus = "Unpaid", CreatedAt = DateTime.UtcNow }
            );
            await context.SaveChangesAsync();

            var controller = new OrdersController(context);
            var result = await controller.GetByClient(1);

            var orders = Assert.IsAssignableFrom<IEnumerable<Order>>(result.Value);
            Assert.All(orders, o => Assert.Equal(1, o.ClientId));
        }

        [Fact]
        public async Task UpdateStatus_ChangesStatus_WhenOrderExists()
        {
            var context = GetInMemoryContext();
            context.Orders.Add(new Order { Id = 1, ClientId = 1, Status = "Pending", PaymentStatus = "Unpaid", CreatedAt = DateTime.UtcNow });
            await context.SaveChangesAsync();

            var controller = new OrdersController(context);
            var result = await controller.UpdateStatus(1, "Completed");

            Assert.IsType<NoContentResult>(result);
            var updated = await context.Orders.FindAsync(1);
            Assert.Equal("Completed", updated!.Status);
        }

        [Fact]
        public async Task UpdateStatus_ReturnsNotFound_WhenOrderDoesNotExist()
        {
            var context = GetInMemoryContext();
            var controller = new OrdersController(context);

            var result = await controller.UpdateStatus(999, "Completed");

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task Delete_RemovesOrder_WhenExists()
        {
            var context = GetInMemoryContext();
            context.Orders.Add(new Order { Id = 1, ClientId = 1, Status = "Pending", PaymentStatus = "Unpaid", CreatedAt = DateTime.UtcNow });
            await context.SaveChangesAsync();

            var controller = new OrdersController(context);
            var result = await controller.Delete(1);

            Assert.IsType<NoContentResult>(result);
            Assert.Equal(0, await context.Orders.CountAsync());
        }

        [Fact]
        public async Task Delete_ReturnsNotFound_WhenDoesNotExist()
        {
            var context = GetInMemoryContext();
            var controller = new OrdersController(context);

            var result = await controller.Delete(999);

            Assert.IsType<NotFoundResult>(result);
        }
    }
}