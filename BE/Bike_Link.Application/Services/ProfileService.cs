using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using Bike_Link.Domain.IRepository;
using Bike_Link.Domain.Models;

namespace Bike_Link.Application.Services
{
    public class ProfileService : IProfileService
    {
        private readonly IProfileRepository _profileRepository;

        public ProfileService(IProfileRepository profileRepository)
        {
            _profileRepository = profileRepository;
        }

        public async Task<ProfileDto> GetProfileAsync(int userId)
        {
            // Lấy người dùng từ kho lưu trữ
            User user = await _profileRepository.GetUserByIdAsync(userId);
            if (user == null) // Nếu không tìm thấy, trả về thông báo lỗi
                throw new KeyNotFoundException("Không tìm thấy người dùng");
            // Mapping User sang ProfileDTO và trả về
            return new ProfileDto
            {
                UserId = user.UserId,
                Email = user.Email,
                FullName = user.FullName,
                Phone = user.Phone,
                AvatarUrl = user.AvatarUrl,
                Status = user.Status,
                Role = user.Role?.RoleName,
                CreatedAt = user.CreatedAt
            };
        }

        public async Task<ProfileDto> UpdateProfileAsync(int userId, UpdateProfileRequest request)
        {
            // Lấy người dùng từ kho lưu trữ
            User user = await _profileRepository.GetUserByIdAsync(userId);
            if (user == null) // Nếu không tìm thấy, trả về thông báo lỗi
                throw new KeyNotFoundException("Không tìm thấy người dùng");

            // Cập nhật thông tin, chỉ cập nhật những trường không null hoặc không rỗng
            if (!string.IsNullOrWhiteSpace(request.FullName))
                user.FullName = request.FullName;

            if (!string.IsNullOrWhiteSpace(request.Phone))
                user.Phone = request.Phone;
            // Lưu thay đổi vào kho lưu trữ
            await _profileRepository.UpdateUserAsync(user);
            // Trả về thông tin hồ sơ đã cập nhật
            return await GetProfileAsync(userId);
        }

        public async Task<ProfileDto> UpdateAvatarAsync(int userId, UpdateAvatarRequest request)
        {
            // Cập nhật avatar người dùng trong kho lưu trữ
            bool success = await _profileRepository.UpdateAvatarAsync(userId, request.AvatarUrl);
            if (!success) // Nếu không thành công, trả về thông báo lỗi
                throw new KeyNotFoundException("Không tìm thấy người dùng");
            // Trả về thông tin hồ sơ đã cập nhật
            return await GetProfileAsync(userId);
        }
    }
}