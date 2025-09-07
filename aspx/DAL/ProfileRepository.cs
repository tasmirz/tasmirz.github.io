using System;
using System.Data.SqlClient;
using _71.Models;

namespace _71.DAL
{
    public class ProfileRepository
    {
        public ProfileModel GetLatestProfile()
        {
            try
            {
                using (var connection = DatabaseHelper.GetConnection())
                {
                    connection.Open();

                    const string query = "SELECT TOP 1 * FROM Profile ORDER BY LastUpdated DESC";

                    using (var command = new SqlCommand(query, connection))
                    using (var reader = command.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            return new ProfileModel
                            {
                                Id = reader["Id"] != DBNull.Value ? Convert.ToInt32(reader["Id"]) : 0,
                                Name = reader["Name"]?.ToString() ?? "",
                                Title = reader["Title"]?.ToString() ?? "",
                                Email = reader["Email"]?.ToString() ?? "",
                                Location = reader["Location"]?.ToString() ?? "",
                                Bio = reader["Bio"]?.ToString() ?? "",
                                AboutDescription = reader["AboutDescription"]?.ToString() ?? "",
                                GithubUrl = reader["GithubUrl"]?.ToString() ?? "",
                                // DB column is 'LinkedinUrl' in the refactored schema
                                LinkedInUrl = reader["LinkedinUrl"]?.ToString() ?? "",
                                // Profile table uses LastUpdated in the refactored schema - map to UpdatedAt
                                CreatedAt = DateTime.Now,
                                UpdatedAt = reader["LastUpdated"] != DBNull.Value ? Convert.ToDateTime(reader["LastUpdated"]) : DateTime.Now
                            };
                        }
                    }
                }
            }
            catch
            {
                // Return null on error - fallback will handle this
            }

            return null;
        }

        public string GetAboutDescription()
        {
            try
            {
                using (var connection = DatabaseHelper.GetConnection())
                {
                    connection.Open();

                    const string query = "SELECT TOP 1 AboutDescription FROM Profile ORDER BY UpdatedAt DESC";

                    using (var command = new SqlCommand(query, connection))
                    {
                        var result = command.ExecuteScalar();
                        return result?.ToString() ?? "";
                    }
                }
            }
            catch
            {
                return "";
            }
        }

        public bool UpdateProfile(ProfileModel profile)
        {
            try
            {
                using (var connection = DatabaseHelper.GetConnection())
                {
                    connection.Open();

                    const string query = @"
                        UPDATE Profile 
                        SET Name = @name, Title = @title, Email = @email, Location = @location, 
                            Bio = @bio, AboutDescription = @aboutDescription, GithubUrl = @githubUrl, 
                            LinkedinUrl = @linkedInUrl, LastUpdated = @updatedAt
                        WHERE Id = @id";

                    using (var command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@id", profile.Id);
                        command.Parameters.AddWithValue("@name", profile.Name ?? "");
                        command.Parameters.AddWithValue("@title", profile.Title ?? "");
                        command.Parameters.AddWithValue("@email", profile.Email ?? "");
                        command.Parameters.AddWithValue("@location", profile.Location ?? "");
                        command.Parameters.AddWithValue("@bio", profile.Bio ?? "");
                        command.Parameters.AddWithValue("@aboutDescription", profile.AboutDescription ?? "");
                        command.Parameters.AddWithValue("@githubUrl", profile.GithubUrl ?? "");
                        command.Parameters.AddWithValue("@linkedInUrl", profile.LinkedInUrl ?? "");
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
    }
}
