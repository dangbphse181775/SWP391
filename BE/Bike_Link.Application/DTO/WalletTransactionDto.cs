using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bike_Link.Application.DTO
{
    public class WalletTransactionDto
    {
        public decimal Amount { get; set; }

        public string Type { get; set; } = null!;

        public string Status { get; set; } = null!;

        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
