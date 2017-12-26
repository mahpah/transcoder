using System;

namespace MediaCatalog.Models.Entities
{
    public class MediaFile : IAuditable
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Path { get; set; }

        #region IAuditable
            public DateTime CreatedAt { get; set; }
            public DateTime UpdatedAt { get; set; }
        #endregion
    }
}
