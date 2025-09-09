using System;
using System.Collections.Generic;

namespace _71.Models
{
    public class SkillModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int CategoryId { get; set; }
        public bool IsActive { get; set; }
        public int SortOrder { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public SkillModel()
        {
            IsActive = true;
            CreatedAt = DateTime.Now;
            UpdatedAt = DateTime.Now;
        }
    }

    public class SkillCategoryWithSkills
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public int SortOrder { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<SkillModel> Skills { get; set; }

        public SkillCategoryWithSkills()
        {
            Skills = new List<SkillModel>();
            IsActive = true;
            CreatedAt = DateTime.Now;
            UpdatedAt = DateTime.Now;
        }
    }
}
