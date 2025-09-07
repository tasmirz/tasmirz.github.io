using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using _71.Models;

namespace _71.DAL
{
    public class SkillsRepository
    {
        public List<SkillCategoryModel> GetAllSkillCategories()
        {
            var categories = new List<SkillCategoryModel>();

            try
            {
                using (var connection = DatabaseHelper.GetConnection())
                {
                    connection.Open();

                    // Check if Skills table exists and has required columns
                    bool hasSkillsTable = TableExists(connection, "Skills");
                    bool hasSkillCategoriesTable = TableExists(connection, "SkillCategories");

                    if (hasSkillCategoriesTable)
                    {
                        categories = LoadFromSkillCategoriesTable(connection);
                    }
                    else if (hasSkillsTable)
                    {
                        categories = LoadFromSkillsTable(connection);
                    }
                }
            }
            catch (Exception)
            {
                // Return empty list on error - fallback will handle this
                return new List<SkillCategoryModel>();
            }

            return categories;
        }

        private bool TableExists(SqlConnection connection, string tableName)
        {
            const string query = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = @tableName";
            using (var command = new SqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@tableName", tableName);
                return Convert.ToInt32(command.ExecuteScalar()) > 0;
            }
        }

        private List<SkillCategoryModel> LoadFromSkillCategoriesTable(SqlConnection connection)
        {
            var categories = new List<SkillCategoryModel>();

            const string query = @"
          SELECT sc.Id, sc.Name, sc.Description, sc.IsActive,
              STUFF((SELECT ', ' + s.Name 
                  FROM Skills s 
                  WHERE s.CategoryId = sc.Id
                  FOR XML PATH('')), 1, 2, '') AS Skills
          FROM SkillCategories sc
          WHERE sc.IsActive = 1";

            using (var command = new SqlCommand(query, connection))
            using (var reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    var category = new SkillCategoryModel
                    {
                        Id = Convert.ToInt32(reader["Id"]),
                        Name = reader["Name"].ToString(),
                        Description = reader["Description"]?.ToString() ?? "",
                        IsActive = Convert.ToBoolean(reader["IsActive"])
                    };

                    var skillsString = reader["Skills"]?.ToString();
                    if (!string.IsNullOrEmpty(skillsString))
                    {
                        category.Skills = new List<string>(skillsString.Split(new[] { ", " }, StringSplitOptions.RemoveEmptyEntries));
                    }

                    categories.Add(category);
                }
            }

            return categories;
        }

        private List<SkillCategoryModel> LoadFromSkillsTable(SqlConnection connection)
        {
            var categories = new List<SkillCategoryModel>();

            // Simple skills table - group by category
            // Older schema may not have IsActive on Skills; do not assume its presence.
            const string query = "SELECT Category, Skill FROM Skills ORDER BY Category";

            using (var command = new SqlCommand(query, connection))
            using (var reader = command.ExecuteReader())
            {
                var categoryDict = new Dictionary<string, SkillCategoryModel>();

                while (reader.Read())
                {
                    string categoryName = reader["Category"]?.ToString() ?? "Other";
                    string skillName = reader["Skill"]?.ToString();

                    if (!string.IsNullOrEmpty(skillName))
                    {
                        if (!categoryDict.ContainsKey(categoryName))
                        {
                            categoryDict[categoryName] = new SkillCategoryModel
                            {
                                Name = categoryName,
                                Skills = new List<string>()
                            };
                        }

                        categoryDict[categoryName].Skills.Add(skillName);
                    }
                }

                categories.AddRange(categoryDict.Values);
            }

            return categories;
        }

        public bool AddSkillCategory(SkillCategoryModel category)
        {
            try
            {
                using (var connection = DatabaseHelper.GetConnection())
                {
                    connection.Open();

                    const string query = @"
                        INSERT INTO SkillCategories (Name, Description, IsActive, CreatedAt, UpdatedAt)
                        VALUES (@name, @description, @isActive, @createdAt, @updatedAt)";

                    using (var command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@name", category.Name ?? "");
                        command.Parameters.AddWithValue("@description", category.Description ?? "");
                        command.Parameters.AddWithValue("@isActive", category.IsActive);
                        command.Parameters.AddWithValue("@createdAt", category.CreatedAt);
                        command.Parameters.AddWithValue("@updatedAt", category.UpdatedAt);

                        command.ExecuteNonQuery();
                    }
                }
                return true;
            }
            catch
            {
                return false;
            }
        }

        public bool UpdateSkillCategory(SkillCategoryModel category)
        {
            try
            {
                using (var connection = DatabaseHelper.GetConnection())
                {
                    connection.Open();

                    const string query = @"
                        UPDATE SkillCategories 
                        SET Name = @name, Description = @description, UpdatedAt = @updatedAt
                        WHERE Id = @id";

                    using (var command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@id", category.Id);
                        command.Parameters.AddWithValue("@name", category.Name ?? "");
                        command.Parameters.AddWithValue("@description", category.Description ?? "");
                        command.Parameters.AddWithValue("@updatedAt", DateTime.Now);

                        command.ExecuteNonQuery();
                    }
                }
                return true;
            }
            catch
            {
                return false;
            }
        }

        public bool DeleteSkillCategory(int categoryId)
        {
            try
            {
                using (var connection = DatabaseHelper.GetConnection())
                {
                    connection.Open();

                    // Soft delete
                    const string query = "UPDATE SkillCategories SET IsActive = 0 WHERE Id = @id";
                    using (var command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@id", categoryId);
                        command.ExecuteNonQuery();
                    }
                }
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
