using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Moq;
using System.Text;
using Xunit;

namespace sweetVenomServer.Tests
{
    public class UploadsControllerTests
    {
        private UploadsController GetController(string webRootPath)
        {
            var mockEnv = new Mock<IWebHostEnvironment>();
            mockEnv.Setup(e => e.WebRootPath).Returns(webRootPath);

            var controller = new UploadsController(mockEnv.Object);

            // Set up a fake HttpContext with scheme and host
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Scheme = "https";
            httpContext.Request.Host = new HostString("localhost");
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = httpContext
            };

            return controller;
        }

        private IFormFile MakeFakeFile(string fileName, string contentType, string content = "fake image bytes")
        {
            var bytes = Encoding.UTF8.GetBytes(content);
            var stream = new MemoryStream(bytes);
            return new FormFile(stream, 0, bytes.Length, "file", fileName)
            {
                Headers = new HeaderDictionary(),
                ContentType = contentType
            };
        }

        [Fact]
        public async Task Upload_ReturnsUrl_WhenFileIsValid()
        {
            var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
            var controller = GetController(tempDir);
            var file = MakeFakeFile("photo.jpg", "image/jpeg");

            var result = await controller.UploadImage(file);

            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(ok.Value);

            // Cleanup
            Directory.Delete(tempDir, recursive: true);
        }

        [Fact]
        public async Task Upload_ReturnsBadRequest_WhenNoFile()
        {
            var controller = GetController(Path.GetTempPath());

            var result = await controller.UploadImage(null!);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Upload_ReturnsBadRequest_WhenFileTypeIsNotAllowed()
        {
            var controller = GetController(Path.GetTempPath());
            var file = MakeFakeFile("doc.pdf", "application/pdf");

            var result = await controller.UploadImage(file);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Upload_AcceptsPngFile()
        {
            var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
            var controller = GetController(tempDir);
            var file = MakeFakeFile("image.png", "image/png");

            var result = await controller.UploadImage(file);

            Assert.IsType<OkObjectResult>(result);

            // Cleanup
            Directory.Delete(tempDir, recursive: true);
        }

        [Fact]
        public async Task Upload_AcceptsWebpFile()
        {
            var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
            var controller = GetController(tempDir);
            var file = MakeFakeFile("image.webp", "image/webp");

            var result = await controller.UploadImage(file);

            Assert.IsType<OkObjectResult>(result);

            // Cleanup
            Directory.Delete(tempDir, recursive: true);
        }
    }
}