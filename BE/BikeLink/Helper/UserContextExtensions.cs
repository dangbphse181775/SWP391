using Bike_Link.Domain.Models;
using System.Security.Claims;

namespace BikeLink.Helper
{
    public static class UserContextExtensions
    {
        public static int GetUserId(this ClaimsPrincipal user)
        {
            var value = user.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.Parse(value!);
        }

        public static string GetRole(this ClaimsPrincipal user)
        {
            return user.FindFirstValue(ClaimTypes.Role)!;
        }
    }
}
