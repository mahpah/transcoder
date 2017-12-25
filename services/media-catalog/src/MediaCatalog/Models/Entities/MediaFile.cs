using System;

namespace MediaCatalog.Models.Entities
{
    public class MediaFile : IAuditable
    {
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
