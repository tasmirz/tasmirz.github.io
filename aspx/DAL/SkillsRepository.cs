using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using _71.Models;

namespace _71.DAL
{
    public class SkillsRepository
    {
        public List<SkillCategoryWithSkills> GetAllSkillCategoriesWithSkills()
        {
            var categories = new List<SkillCategoryWithSkills>();

            try
            {
                using (var connection = DatabaseHelper.GetConnection())
                {
                    connection.Open();

                    // Load categories - simplified query for existing schema
                    const string categoryQuery = @"
                        SELECT Id, Name, Description, SortOrder
                        FROM SkillCategories 
                        ORDER BY SortOrder, Name";

                    using (var command = new SqlCommand(categoryQuery, connection))
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            var category = new SkillCategoryWithSkills
                            {
                                Id = Convert.ToInt32(reader["Id"]),
                                Name = reader["Name"].ToString(),
                                Description = reader["Description"]?.ToString() ?? "",
                                IsActive = true, // Default since we're selecting all
                                SortOrder = reader["SortOrder"] != DBNull.Value ? Convert.ToInt32(reader["SortOrder"]) : 0,
                                CreatedAt = DateTime.Now,
                                UpdatedAt = DateTime.Now
                            };
                            categories.Add(category);
                        }
                    }

                    // Load skills for each category - simplified query
                    const string skillQuery = @"
                        SELECT Id, Name, CategoryId, SortOrder
                        FROM Skills 
                        WHERE CategoryId = @categoryId
                        ORDER BY SortOrder, Name";

                    foreach (var category in categories)
                    {
                        using (var command = new SqlCommand(skillQuery, connection))
                        {
                            command.Parameters.AddWithValue("@categoryId", category.Id);
                            using (var reader = command.ExecuteReader())
                            {
                                while (reader.Read())
                                {
                                    var skill = new SkillModel
                                    {
                                        Id = Convert.ToInt32(reader["Id"]),
                                        Name = reader["Name"].ToString(),
                                        CategoryId = category.Id,
                                        IsActive = true, // Default since we're selecting all
                                        SortOrder = reader["SortOrder"] != DBNull.Value ? Convert.ToInt32(reader["SortOrder"]) : 0,
                                        CreatedAt = DateTime.Now,
                                        UpdatedAt = DateTime.Now
                                    };
                                    category.Skills.Add(skill);
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // Log error and return empty list
                System.Diagnostics.Debug.WriteLine($"Error loading skill categories: {ex.Message}");
                return new List<SkillCategoryWithSkills>();
            }

            return categories;
        }

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
          SELECT sc.Id, sc.Name, sc.Description,
              STUFF((SELECT ', ' + s.Name 
                  FROM Skills s 
                  WHERE s.CategoryId = sc.Id
                  FOR XML PATH('')), 1, 2, '') AS Skills
          FROM SkillCategories sc
          ORDER BY sc.SortOrder, sc.Name";

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
                        IsActive = true // Default since we're selecting all
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

        public bool AddSkill(int categoryId, string skillName)
        {
            try
            {
                using (var connection = DatabaseHelper.GetConnection())
                {
                    connection.Open();

                    // Get next sort order for this category
                    string sortQuery = "SELECT ISNULL(MAX(SortOrder), 0) + 1 FROM Skills WHERE CategoryId = @categoryId";
                    int sortOrder;
                    using (var sortCmd = new SqlCommand(sortQuery, connection))
                    {
                        sortCmd.Parameters.AddWithValue("@categoryId", categoryId);
                        sortOrder = Convert.ToInt32(sortCmd.ExecuteScalar());
                    }

                    const string query = @"
                        INSERT INTO Skills (CategoryId, Name, SortOrder, DisplayOrder)
                        VALUES (@categoryId, @name, @sortOrder, @displayOrder)";

                    using (var command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@categoryId", categoryId);
                        command.Parameters.AddWithValue("@name", skillName);
                        command.Parameters.AddWithValue("@sortOrder", sortOrder);
                        command.Parameters.AddWithValue("@displayOrder", sortOrder);

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

        public bool DeleteSkill(int skillId)
        {
            try
            {
                using (var connection = DatabaseHelper.GetConnection())
                {
                    connection.Open();

                    // Hard delete since we don't have IsActive column
                    const string query = "DELETE FROM Skills WHERE Id = @id";
                    using (var command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@id", skillId);
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

        public bool AddSkillCategory(string categoryName, string description = "")
        {
            try
            {
                using (var connection = DatabaseHelper.GetConnection())
                {
                    connection.Open();

                    // Get next sort order
                    string sortQuery = "SELECT ISNULL(MAX(SortOrder), 0) + 1 FROM SkillCategories";
                    int sortOrder;
                    using (var sortCmd = new SqlCommand(sortQuery, connection))
                    {
                        sortOrder = Convert.ToInt32(sortCmd.ExecuteScalar());
                    }

                    const string query = @"
                        INSERT INTO SkillCategories (Name, Description, SortOrder, DisplayOrder)
                        VALUES (@name, @description, @sortOrder, @displayOrder)";

                    using (var command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@name", categoryName);
                        command.Parameters.AddWithValue("@description", description);
                        command.Parameters.AddWithValue("@sortOrder", sortOrder);
                        command.Parameters.AddWithValue("@displayOrder", sortOrder);

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

        public bool DeleteSkillCategoryAndSkills(int categoryId)
        {
            try
            {
                using (var connection = DatabaseHelper.GetConnection())
                {
                    connection.Open();

                    // Delete skills first (foreign key constraint)
                    const string deleteSkillsQuery = "DELETE FROM Skills WHERE CategoryId = @categoryId";
                    using (var command = new SqlCommand(deleteSkillsQuery, connection))
                    {
                        command.Parameters.AddWithValue("@categoryId", categoryId);
                        command.ExecuteNonQuery();
                    }

                    // Then delete category
                    const string deleteCategoryQuery = "DELETE FROM SkillCategories WHERE Id = @categoryId";
                    using (var command = new SqlCommand(deleteCategoryQuery, connection))
                    {
                        command.Parameters.AddWithValue("@categoryId", categoryId);
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

        public bool AddSkillCategory(SkillCategoryModel category)
        {
            try
            {
                using (var connection = DatabaseHelper.GetConnection())
                {
                    connection.Open();

                    const string query = @"
                        INSERT INTO SkillCategories (Name, Description)
                        VALUES (@name, @description)";

                    using (var command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@name", category.Name ?? "");
                        command.Parameters.AddWithValue("@description", category.Description ?? "");

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
                        SET Name = @name, Description = @description
                        WHERE Id = @id";

                    using (var command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@id", category.Id);
                        command.Parameters.AddWithValue("@name", category.Name ?? "");
                        command.Parameters.AddWithValue("@description", category.Description ?? "");

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

                    // Hard delete
                    const string query = "DELETE FROM SkillCategories WHERE Id = @id";
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
