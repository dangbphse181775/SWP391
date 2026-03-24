using Microsoft.AspNetCore.Http;

namespace Bike_Link.Application.DTO
{
    public class OpenDisputeRequest
    {
        public string Description { get; set; } = null!;

        /// <summary>
        /// Ảnh bằng chứng (upload lên Cloudinary)
        /// </summary>
        public List<IFormFile>? Images { get; set; }

        /// <summary>
        /// Video bằng chứng (upload lên Cloudinary)
        /// </summary>
        public List<IFormFile>? Videos { get; set; }
    }
}
