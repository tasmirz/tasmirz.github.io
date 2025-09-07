using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using _71.Models;

namespace _71.DAL
{
    public class ProjectRepository
    {
        public List<ProjectModel> GetAllProjects()
        {
            var projects = new List<ProjectModel>();

            try
            {
                using (var connection = DatabaseHelper.GetConnection())
                {
                    connection.Open();

                    const string query = @"
                        SELECT Id, Name, Description, ImageUrl, ProjectUrl, GithubUrl, Status, CreatedAt, UpdatedAt
                        FROM Projects 
                        ORDER BY UpdatedAt DESC";

                    using (var command = new SqlCommand(query, connection))
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            var project = new ProjectModel
                            {
                                Id = Convert.ToInt32(reader["Id"]),
                                Name = reader["Name"].ToString(),
                                Description = reader["Description"].ToString(),
                                ImageUrl = reader["ImageUrl"]?.ToString(),
                                ProjectUrl = reader["ProjectUrl"]?.ToString(),
                                GithubUrl = reader["GithubUrl"]?.ToString(),
                                Status = ParseProjectStatus(reader["Status"].ToString()),
                                CreatedAt = Convert.ToDateTime(reader["CreatedAt"]),
                                UpdatedAt = Convert.ToDateTime(reader["UpdatedAt"])
                            };

                            projects.Add(project);
                        }
                    }

                    // Load languages for each project
                    foreach (var project in projects)
                    {
                        project.Languages = GetProjectLanguages(connection, project.Id);
                    }
                }
            }
            catch (Exception ex)
            {
                // Log error and return empty list
                System.Diagnostics.Debug.WriteLine($"Error loading projects: {ex.Message}");
                return new List<ProjectModel>();
            }

            return projects;
        }

        public List<ProjectModel> GetProjectsByStatus(ProjectStatus status)
        {
            return GetAllProjects().Where(p => p.Status == status).ToList();
        }

        public List<ProjectModel> GetActiveProjects()
        {
            return GetProjectsByStatus(ProjectStatus.Active);
        }

        private ProjectStatus ParseProjectStatus(string status)
        {
            if (Enum.TryParse<ProjectStatus>(status, out var result))
                return result;
            return ProjectStatus.InProgress; // Default fallback
        }

        private List<string> GetProjectLanguages(SqlConnection connection, int projectId)
        {
            var languages = new List<string>();

            try
            {
                const string query = "SELECT Language FROM ProjectLanguages WHERE ProjectId = @projectId";
                using (var command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@projectId", projectId);
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            languages.Add(reader["Language"].ToString());
                        }
                    }
                }
            }
            catch
            {
                // Return empty list on error
            }

            return languages;
        }

        public bool AddProject(ProjectModel project)
        {
            try
            {
                using (var connection = DatabaseHelper.GetConnection())
                {
                    connection.Open();
                    using (var transaction = connection.BeginTransaction())
                    {
                        try
                        {
                            // Insert project
                            const string projectQuery = @"
                                INSERT INTO Projects (Name, Description, ImageUrl, ProjectUrl, GithubUrl, Status, CreatedAt, UpdatedAt)
                                OUTPUT INSERTED.Id
                                VALUES (@name, @description, @imageUrl, @projectUrl, @githubUrl, @status, @createdAt, @updatedAt)";

                            int projectId;
                            using (var command = new SqlCommand(projectQuery, connection, transaction))
                            {
                                command.Parameters.AddWithValue("@name", project.Name ?? "");
                                command.Parameters.AddWithValue("@description", project.Description ?? "");
                                command.Parameters.AddWithValue("@imageUrl", (object)project.ImageUrl ?? DBNull.Value);
                                command.Parameters.AddWithValue("@projectUrl", (object)project.ProjectUrl ?? DBNull.Value);
                                command.Parameters.AddWithValue("@githubUrl", (object)project.GithubUrl ?? DBNull.Value);
                                command.Parameters.AddWithValue("@status", project.Status.ToString());
                                command.Parameters.AddWithValue("@createdAt", project.CreatedAt);
                                command.Parameters.AddWithValue("@updatedAt", project.UpdatedAt);

                                projectId = (int)command.ExecuteScalar();
                            }

                            // Insert languages
                            if (project.Languages != null && project.Languages.Any())
                            {
                                const string languageQuery = "INSERT INTO ProjectLanguages (ProjectId, Language) VALUES (@projectId, @language)";
                                using (var command = new SqlCommand(languageQuery, connection, transaction))
                                {
                                    command.Parameters.Add("@projectId", System.Data.SqlDbType.Int);
                                    command.Parameters.Add("@language", System.Data.SqlDbType.NVarChar, 100);

                                    foreach (var language in project.Languages)
                                    {
                                        command.Parameters["@projectId"].Value = projectId;
                                        command.Parameters["@language"].Value = language;
                                        command.ExecuteNonQuery();
                                    }
                                }
                            }

                            transaction.Commit();
                            return true;
                        }
                        catch
                        {
                            transaction.Rollback();
                            throw;
                        }
                    }
                }
            }
            catch
            {
                return false;
            }
        }

        public bool UpdateProject(ProjectModel project)
        {
            try
            {
                using (var connection = DatabaseHelper.GetConnection())
                {
                    connection.Open();
                    using (var transaction = connection.BeginTransaction())
                    {
                        try
                        {
                            // Update project
                            const string projectQuery = @"
                                UPDATE Projects 
                                SET Name = @name, Description = @description, ImageUrl = @imageUrl, 
                                    ProjectUrl = @projectUrl, GithubUrl = @githubUrl, Status = @status, UpdatedAt = @updatedAt
                                WHERE Id = @id";

                            using (var command = new SqlCommand(projectQuery, connection, transaction))
                            {
                                command.Parameters.AddWithValue("@id", project.Id);
                                command.Parameters.AddWithValue("@name", project.Name ?? "");
                                command.Parameters.AddWithValue("@description", project.Description ?? "");
                                command.Parameters.AddWithValue("@imageUrl", (object)project.ImageUrl ?? DBNull.Value);
                                command.Parameters.AddWithValue("@projectUrl", (object)project.ProjectUrl ?? DBNull.Value);
                                command.Parameters.AddWithValue("@githubUrl", (object)project.GithubUrl ?? DBNull.Value);
                                command.Parameters.AddWithValue("@status", project.Status.ToString());
                                command.Parameters.AddWithValue("@updatedAt", DateTime.Now);

                                command.ExecuteNonQuery();
                            }

                            // Delete existing languages
                            const string deleteLanguagesQuery = "DELETE FROM ProjectLanguages WHERE ProjectId = @projectId";
                            using (var command = new SqlCommand(deleteLanguagesQuery, connection, transaction))
                            {
                                command.Parameters.AddWithValue("@projectId", project.Id);
                                command.ExecuteNonQuery();
                            }

                            // Insert new languages
                            if (project.Languages != null && project.Languages.Any())
                            {
                                const string languageQuery = "INSERT INTO ProjectLanguages (ProjectId, Language) VALUES (@projectId, @language)";
                                using (var command = new SqlCommand(languageQuery, connection, transaction))
                                {
                                    command.Parameters.Add("@projectId", System.Data.SqlDbType.Int);
                                    command.Parameters.Add("@language", System.Data.SqlDbType.NVarChar, 100);

                                    foreach (var language in project.Languages)
                                    {
                                        command.Parameters["@projectId"].Value = project.Id;
                                        command.Parameters["@language"].Value = language;
                                        command.ExecuteNonQuery();
                                    }
                                }
                            }

                            transaction.Commit();
                            return true;
                        }
                        catch
                        {
                            transaction.Rollback();
                            throw;
                        }
                    }
                }
            }
            catch
            {
                return false;
            }
        }

        public bool DeleteProject(int projectId)
        {
            try
            {
                using (var connection = DatabaseHelper.GetConnection())
                {
                    connection.Open();
                    using (var transaction = connection.BeginTransaction())
                    {
                        try
                        {
                            // Delete languages first (due to foreign key)
                            const string deleteLanguagesQuery = "DELETE FROM ProjectLanguages WHERE ProjectId = @projectId";
                            using (var command = new SqlCommand(deleteLanguagesQuery, connection, transaction))
                            {
                                command.Parameters.AddWithValue("@projectId", projectId);
                                command.ExecuteNonQuery();
                            }

                            // Delete project
                            const string deleteProjectQuery = "DELETE FROM Projects WHERE Id = @id";
                            using (var command = new SqlCommand(deleteProjectQuery, connection, transaction))
                            {
                                command.Parameters.AddWithValue("@id", projectId);
                                command.ExecuteNonQuery();
                            }

                            transaction.Commit();
                            return true;
                        }
                        catch
                        {
                            transaction.Rollback();
                            throw;
                        }
                    }
                }
            }
            catch
            {
                return false;
            }
        }

        public bool UpdateProjectStatus(int projectId, ProjectStatus status)
        {
            try
            {
                using (var connection = DatabaseHelper.GetConnection())
                {
                    connection.Open();

                    const string query = "UPDATE Projects SET Status = @status, UpdatedAt = @updatedAt WHERE Id = @id";
                    using (var command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@id", projectId);
                        command.Parameters.AddWithValue("@status", status.ToString());
                        command.Parameters.AddWithValue("@updatedAt", DateTime.Now);

                        return command.ExecuteNonQuery() > 0;
                    }
                }
            }
            catch
            {
                return false;
            }
        }

        public ProjectModel GetProjectById(int id)
        {
            var projects = GetAllProjects();
            return projects.FirstOrDefault(p => p.Id == id);
        }
    }
}
