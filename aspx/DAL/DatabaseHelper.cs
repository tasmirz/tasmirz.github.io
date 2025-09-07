using System;
using System.Configuration;
using System.Data.SqlClient;

namespace _71.DAL
{
    public static class DatabaseHelper
    {
        public static string ConnectionString
        {
            get
            {
                return ConfigurationManager.ConnectionStrings["PortfolioDB"]?.ConnectionString ?? "";
            }
        }

        public static bool ColumnExists(SqlConnection connection, string tableName, string columnName)
        {
            const string query = "SELECT COUNT(*) FROM sys.columns WHERE object_id = OBJECT_ID(@tableName) AND name = @columnName";

            using (var command = new SqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@tableName", tableName);
                command.Parameters.AddWithValue("@columnName", columnName);
                return Convert.ToInt32(command.ExecuteScalar()) > 0;
            }
        }

        public static bool TryAddColumn(SqlConnection connection, string tableName, string columnDefinition)
        {
            try
            {
                var parts = columnDefinition.Split(new[] { ' ' }, 2);
                if (parts.Length < 2) return false;

                string columnName = parts[0];
                if (!ColumnExists(connection, tableName, columnName))
                {
                    string alterQuery = $"ALTER TABLE {tableName} ADD {columnDefinition}";
                    using (var command = new SqlCommand(alterQuery, connection))
                    {
                        command.ExecuteNonQuery();
                    }
                    return true;
                }
                return true; // Column already exists
            }
            catch
            {
                return false; // Failed to add column
            }
        }

        public static SqlConnection GetConnection()
        {
            return new SqlConnection(ConnectionString);
        }
    }
}
