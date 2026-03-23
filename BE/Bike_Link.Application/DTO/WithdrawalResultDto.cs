using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bike_Link.Application.DTO
{
    public class WithdrawalResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = null!;
        public int? TransactionId { get; set; }
        public decimal? RemainingBalance { get; set; }
    }
}
