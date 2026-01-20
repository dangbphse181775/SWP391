using System;
using System.Collections.Generic;

namespace Bike_Link.Domain.Models;

public partial class Inspector
{
    public int UserId { get; set; }

    public string? CertificateInfo { get; set; }

    public virtual User User { get; set; } = null!;
}
