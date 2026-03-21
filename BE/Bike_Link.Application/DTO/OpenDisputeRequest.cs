namespace Bike_Link.Application.DTO
{
    public class OpenDisputeRequest
    {
        public string Description { get; set; } = null!;

        /// <summary>
        /// JSON array các URL ảnh/video bằng chứng (optional)
        /// </summary>
        public string? EvidenceUrls { get; set; }
    }
}
