using Bike_Link.Application.DTO;

namespace Bike_Link.Application.IService
{
    public interface IProfileService
    {
        Task<ProfileDto> GetProfileAsync(int userId);
        Task<ProfileDto> UpdateProfileAsync(int userId, UpdateProfileRequest request);
        Task<ProfileDto> UpdateAvatarAsync(int userId, UpdateAvatarRequest request);
    }
}