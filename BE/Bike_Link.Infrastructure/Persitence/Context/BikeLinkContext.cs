using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace Bike_Link.Domain.Models;

public partial class BikeLinkContext : DbContext
{
    public BikeLinkContext()
    {
    }

    public BikeLinkContext(DbContextOptions<BikeLinkContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Admin> Admins { get; set; }
    public virtual DbSet<Brand> Brands { get; set; }
    public virtual DbSet<Category> Categories { get; set; }
    public virtual DbSet<Dispute> Disputes { get; set; }
    public virtual DbSet<InspectionReport> InspectionReports { get; set; }
    public virtual DbSet<Inspector> Inspectors { get; set; }
    public virtual DbSet<Order> Orders { get; set; }
    public virtual DbSet<OrderDetail> OrderDetails { get; set; }
    public virtual DbSet<Payment> Payments { get; set; }
    public virtual DbSet<Report> Reports { get; set; }
    public virtual DbSet<Review> Reviews { get; set; }
    public virtual DbSet<Role> Roles { get; set; }

    // Chỉ còn một thực thể trung tâm
    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<Vehicle> Vehicles { get; set; }
    public virtual DbSet<VehicleMedium> VehicleMedia { get; set; }
    public virtual DbSet<Wishlist> Wishlists { get; set; }
    public virtual DbSet<WishlistItem> WishlistItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Admin 1-1 User
        modelBuilder.Entity<Admin>(entity =>
        {
            entity.HasKey(a => a.UserId);

            entity.HasOne(a => a.User)
                .WithOne(u => u.Admin)
                .HasForeignKey<Admin>(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Inspector 1-1 User
        modelBuilder.Entity<Inspector>(entity =>
        {
            entity.HasKey(i => i.UserId);

            entity.HasOne(i => i.User)
                .WithOne(u => u.Inspector)
                .HasForeignKey<Inspector>(i => i.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Order: Buyer & Seller đều trỏ về Users
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasOne(o => o.Buyer)
                .WithMany(u => u.BuyOrders)
                .HasForeignKey(o => o.BuyerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(o => o.Seller)
                .WithMany(u => u.SellOrders)
                .HasForeignKey(o => o.SellerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Vehicle -> User (Seller)
        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.HasOne(v => v.Seller)
                .WithMany(u => u.Vehicles)
                .HasForeignKey(v => v.SellerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Wishlist -> User
        modelBuilder.Entity<Wishlist>(entity =>
        {
            entity.HasOne(w => w.User)
                .WithOne(u => u.Wishlist)
                .HasForeignKey<User>(w => w.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // WishlistItem composite key
        modelBuilder.Entity<WishlistItem>(entity =>
        {
            entity.HasKey(x => new { x.WishlistId, x.VehicleId });

            entity.HasOne(x => x.Wishlist)
                .WithMany(w => w.WishlistItems)
                .HasForeignKey(x => x.WishlistId);

            entity.HasOne(x => x.Vehicle)
                .WithMany(v => v.WishlistItems)
                .HasForeignKey(x => x.VehicleId);
        });

        // Review: 2 FK -> User
        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasOne(r => r.Order)
                .WithMany(o => o.Reviews)
                .HasForeignKey(r => r.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.Reviewer)
                .WithMany(u => u.ReviewReviewers)
                .HasForeignKey(r => r.ReviewerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(r => r.TargetUser)
                .WithMany(u => u.ReviewTargetUsers)
                .HasForeignKey(r => r.TargetUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Dispute
        modelBuilder.Entity<Dispute>(entity =>
        {
            entity.HasOne(d => d.Order)
                .WithMany(o => o.Disputes)
                .HasForeignKey(d => d.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.OpenedByUser)
                .WithMany(u => u.Disputes)
                .HasForeignKey(d => d.OpenedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Report
        modelBuilder.Entity<Report>(entity =>
        {
            entity.HasOne(r => r.Reporter)
                .WithMany(u => u.Reports)
                .HasForeignKey(r => r.ReporterId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // OrderDetail
        modelBuilder.Entity<OrderDetail>(entity =>
        {
            entity.HasOne(od => od.Order)
                .WithMany(o => o.OrderDetails)
                .HasForeignKey(od => od.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(od => od.Vehicle)
                .WithMany(v => v.OrderDetails)
                .HasForeignKey(od => od.VehicleId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Payment
        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasOne(p => p.Order)
                .WithMany(o => o.Payments)
                .HasForeignKey(p => p.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // InspectionReport
        modelBuilder.Entity<InspectionReport>(entity =>
        {
            entity.HasKey(r => r.ReportId);

            entity.HasOne(r => r.Inspector)
                .WithMany(i => i.InspectionReports)
                .HasForeignKey(r => r.InspectorId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(r => r.Vehicle)
                .WithMany(v => v.InspectionReports)
                .HasForeignKey(r => r.VehicleId)
                .OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<VehicleMedium>(entity =>
        {
            entity.HasOne(m => m.Vehicle)
                .WithMany(v => v.VehicleMedia)
                .HasForeignKey(m => m.VehicleId)
                .OnDelete(DeleteBehavior.Cascade);
        });
        base.OnModelCreating(modelBuilder);
    }
}
