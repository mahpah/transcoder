using JetBrains.Annotations;
using MediaCatalog.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace MediaCatalog.Models
{
    public class MediaDbContext : DbContext
    {
        public DbSet<MediaFile> MediaFiles { get; set; }

        public MediaDbContext(DbContextOptions options) : base(options)
        {
        }
    }
}
