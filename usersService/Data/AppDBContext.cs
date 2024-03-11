using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using usersService.Models;

namespace usersService.Data
{
    public class AppDBContext : DbContext
    {
        public AppDBContext(DbContextOptions<AppDBContext> options) : base(options)
        {
        }

        public DbSet<UserModel> Users { get; set; }
        public DbSet<KidModel> Kids { get; set; }

        public DbSet<ChatModel> Chats { get; set; }
        public DbSet<MessageModel> Messages { get; set; }

        public DbSet<LanguageModel> Languages { get; set; }
        public DbSet<LocationModel> Locations { get; set; }
        public DbSet<UsersLocationsModel> UsersLocations { get; set; }
        public DbSet<UsersChatsModel> UsersChats { get; set; }
        public DbSet<UsersLanguagesModel> UsersLanguages { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<UserModel>()
                .HasMany(u => u.Kids)
                .WithOne(k => k.User)
                .HasForeignKey(k => k.UserId);


            modelBuilder.Entity<UsersLocationsModel>()
                .HasKey(ul => new { ul.UserId, ul.LocationId });

            modelBuilder.Entity<UsersLocationsModel>()
                .HasOne(ul => ul.User)
                .WithMany(u => u.UserLocations)
                .HasForeignKey(ul => ul.UserId);

            modelBuilder.Entity<UsersLocationsModel>()
                .HasOne(ul => ul.Location)
                .WithMany(l => l.UserLocations)
                .HasForeignKey(ul => ul.LocationId);

            //many2many for users-chats

            modelBuilder.Entity<UsersChatsModel>()
                .HasKey(uc => new { uc.UserId, uc.ChatId });

            modelBuilder.Entity<UsersChatsModel>()
                .HasOne(uc => uc.User)
                .WithMany(u => u.UserChats)
                .HasForeignKey(ul => ul.UserId);

            modelBuilder.Entity<UsersChatsModel>()
                .HasOne(uc => uc.Chat)
                .WithMany(c => c.UserChats)
                .HasForeignKey(uc => uc.ChatId);

            //many2many for users-languages
            modelBuilder.Entity<UsersLanguagesModel>()
                .HasKey(ul => new { ul.UserId, ul.LanguageId });

            modelBuilder.Entity<UsersLanguagesModel>()
                .HasOne(ul => ul.User)
                .WithMany(u => u.UserLanguages)
                .HasForeignKey(ul => ul.UserId);

            modelBuilder.Entity<UsersLanguagesModel>()
                .HasOne(ul => ul.Language)
                .WithMany(u => u.UserLanguages)
                .HasForeignKey(ul => ul.LanguageId);

            modelBuilder.Entity<ChatModel>()
                .HasMany(c => c.Messages)
                .WithOne(m => m.Chat)
                .HasForeignKey(m => m.ChatId);
        }
    }
}