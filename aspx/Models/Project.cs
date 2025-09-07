using System;
using System.Collections.Generic;

namespace _71.Models
{
    public enum ProjectStatus
    {
        InProgress,
        Active,
        Archived
    }

    // Model classes use explicit "Model" suffix to avoid colliding with WebForms page class names
    public class ProjectModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
        public string ProjectUrl { get; set; }
        public string GithubUrl { get; set; }
        public ProjectStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<string> Languages { get; set; }

        public ProjectModel()
        {
            Languages = new List<string>();
            Status = ProjectStatus.InProgress;
            CreatedAt = DateTime.Now;
            UpdatedAt = DateTime.Now;
        }
    }

    public class SkillCategoryModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<string> Skills { get; set; }

        public SkillCategoryModel()
        {
            Skills = new List<string>();
            IsActive = true;
            CreatedAt = DateTime.Now;
            UpdatedAt = DateTime.Now;
        }
    }
}