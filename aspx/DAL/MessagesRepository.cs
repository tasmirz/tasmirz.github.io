using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using _71.Models;

namespace _71.DAL
{
    public class MessagesRepository
    {
        public int Create(MessageModel m)
        {
            using (var conn = DatabaseHelper.GetConnection())
            {
                conn.Open();
                var sql = "INSERT INTO Messages (Name, Email, Subject, Content, CreatedAt) OUTPUT INSERTED.Id VALUES (@Name,@Email,@Subject,@Content,@CreatedAt)";
                using (var cmd = new SqlCommand(sql, conn))
                {
                    cmd.Parameters.AddWithValue("@Name", m.Name ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@Email", m.Email ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@Subject", m.Subject ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@Content", m.Content ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@CreatedAt", m.CreatedAt);
                    return Convert.ToInt32(cmd.ExecuteScalar());
                }
            }
        }

        public List<MessageModel> ListAll()
        {
            var list = new List<MessageModel>();
            using (var conn = DatabaseHelper.GetConnection())
            {
                conn.Open();
                var sql = "SELECT Id, Name, Email, Subject, Content, CreatedAt FROM Messages ORDER BY CreatedAt DESC";
                using (var cmd = new SqlCommand(sql, conn))
                using (var rdr = cmd.ExecuteReader())
                {
                    while (rdr.Read())
                    {
                        list.Add(new MessageModel
                        {
                            Id = rdr.GetInt32(0),
                            Name = rdr.IsDBNull(1) ? null : rdr.GetString(1),
                            Email = rdr.IsDBNull(2) ? null : rdr.GetString(2),
                            Subject = rdr.IsDBNull(3) ? null : rdr.GetString(3),
                            Content = rdr.IsDBNull(4) ? null : rdr.GetString(4),
                            CreatedAt = rdr.GetDateTime(5)
                        });
                    }
                }
            }
            return list;
        }
    }
}
