using System;

namespace _71.Models
{
    // Model classes use explicit "Model" suffix to avoid colliding with WebForms page class names
    public class ProfileModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Title { get; set; }
        public string Email { get; set; }
        public string Location { get; set; }
        public string Bio { get; set; }
        public string AboutDescription { get; set; }
        public string GithubUrl { get; set; }
        public string LinkedInUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public ProfileModel()
        {
            CreatedAt = DateTime.Now;
            UpdatedAt = DateTime.Now;
        }
    }
}