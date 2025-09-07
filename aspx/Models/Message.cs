using System;

namespace _71.Models
{
    public class MessageModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Subject { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }

        public MessageModel()
        {
            CreatedAt = DateTime.Now;
        }
    }
}
