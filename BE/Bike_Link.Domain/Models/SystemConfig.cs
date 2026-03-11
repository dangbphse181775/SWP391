using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bike_Link.Domain.Models
{
    public class SystemConfig
    {
        
        public string Key { get; set; } = null!;   //deposit_rate", "cancel_refund_rate
        
        public string Value { get; set; } = null!;
        
        public string? Description { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
