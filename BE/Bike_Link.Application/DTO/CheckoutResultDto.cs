using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bike_Link.Application.DTO
{
    public class CheckoutResultDto
    {
        public bool Success { get; set; }

        /// <summary>
        /// Danh sách OrderId đã tạo (1 order / seller)
        /// </summary>
        public List<int> OrderIds { get; set; } = new List<int>();

        public decimal TotalAmount { get; set; }

        public decimal WalletBalance { get; set; }

        /// <summary>
        /// Số tiền thiếu (nếu ví không đủ)
        /// </summary>
        public decimal? AmountShort { get; set; }

        public string Message { get; set; } = null!;
    }
}
