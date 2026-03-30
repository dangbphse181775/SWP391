using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bike_Link.Domain.Models
{
    public class WalletTransaction
    {
        public int WalletTransactionId { get; set; }

        public int WalletId { get; set; }

        public decimal Amount { get; set; }

        // deposit / payment / refund
        public string Type { get; set; } = null!;

        public string Status { get; set; } = null!; // pending / success / failed
        public string? TxnRef { get; set; }
        public string? Description { get; set; }

        // Bank info — dùng cho withdrawal
        public string? BankName { get; set; }
        public string? BankAccountNumber { get; set; }
        public string? BankAccountName { get; set; }

        public DateTime? CreatedAt { get; set; }

        // Navigation
        public virtual Wallet Wallet { get; set; } = null!;
    }
}
