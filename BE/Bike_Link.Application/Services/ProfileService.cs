
using Bike_Link.Application.DTO;
using Bike_Link.Application.IService;
using Bike_Link.Domain.IRepository;
using Bike_Link.Domain.Models;
using System.Text.RegularExpressions;

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

        public async Task<List<UserListDto>> GetAllUsersAsync()
        {
            // Lấy tất cả người dùng từ DB
            List<User> users = await _profileRepository.GetAllUsersAsync();
            // Mapping danh sách User sang danh sách UserListDTO và trả về
            return users.Select(user => new UserListDto
            {
                UserId = user.UserId,
                Email = user.Email,
                FullName = user.FullName,
                Phone = user.Phone,
                AvatarUrl = user.AvatarUrl,
                Status = user.Status,
                Role = user.Role.RoleName,
                TotalPurchases = user.TotalPurchases,
                BuyerRatingAvg = user.BuyerRatingAvg,
                TotalSales = user.TotalSales,
                SellerRatingAvg = user.SellerRatingAvg,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            }).ToList();
        }

        public async Task<ProfileDto> UpdateProfileAsync(int userId, UpdateProfileRequest request)
        {
            // Lấy người dùng từ kho lưu trữ
            User user = await _profileRepository.GetUserByIdAsync(userId);
            if (user == null) // Nếu không tìm thấy, trả về thông báo lỗi
                throw new KeyNotFoundException("Không tìm thấy người dùng");

            // Cập nhật thông tin, chỉ cập nhật những trường không null hoặc không rỗng
            // Validate và cập nhật FullName
            if (!string.IsNullOrWhiteSpace(request.FullName))
            {
                // Kiểm tra độ dài tối thiểu 2 ký tự
                if (request.FullName.Trim().Length < 2)
                    throw new ArgumentException("Tên phải có ít nhất 2 ký tự");

                if (request.FullName.Length > 100)
                    throw new ArgumentException("Tên không được vượt quá 100 ký tự");

                user.FullName = request.FullName.Trim();
            }
            else
            {
                user.FullName = user.FullName; // giữ nguyên giá trị hiện tại nếu không có cập nhật
            }

            // Validate và cập nhật Phone
            if (!string.IsNullOrWhiteSpace(request.Phone))
            {
                // Kiểm tra số điện thoại: 10 chữ số, bắt đầu bằng 0
                string phonePattern = @"^0\d{9}$";
                if (!Regex.IsMatch(request.Phone, phonePattern))
                    throw new ArgumentException("Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0");

                user.Phone = request.Phone;
            }
            else
            {
                user.Phone = user.Phone; // giữ nguyên giá trị hiện tại nếu không có cập nhật
            }
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

        public async Task<ProfileDto> UpdateStatusAsync(int userId, UpdateStatusRequest request)
        {
            // Cập nhật status người dùng trong kho lưu trữ
            bool success = await _profileRepository.UpdateStatusAsync(userId, request.Status);
            if (!success) // Nếu không thành công, trả về thông báo lỗi
                throw new KeyNotFoundException("Không tìm thấy người dùng");
            // Trả về thông tin hồ sơ đã cập nhật
            return await GetProfileAsync(userId);
        }
    }
}