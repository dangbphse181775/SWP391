using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bike_Link.Domain.Models
{
    public class Wallet
    {
        public int WalletId { get; set; }

        // 1 User - 1 Wallet
        public int UserId { get; set; }

        public decimal Balance { get; set; } = 0;

        public DateTime? CreatedAt { get; set; }

        // Navigation
        public virtual User User { get; set; } = null!;
        public virtual ICollection<WalletTransaction> Transactions { get; set; } = new List<WalletTransaction>();
    }
}
