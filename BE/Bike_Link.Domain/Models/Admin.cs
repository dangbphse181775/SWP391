using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Bike_Link.Domain.Models;

public partial class Admin
{
    [Key]
    public int UserId { get; set; }

    public virtual User User { get; set; } = null!;
}
