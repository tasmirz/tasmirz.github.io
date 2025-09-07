using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Data;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Newtonsoft.Json;
using System.Configuration;

namespace _71.Admin
{
    public partial class Profile : Page
    {

        private readonly string connectionString = ConfigurationManager.ConnectionStrings["PortfolioDB"]?.ConnectionString ?? "";
        private List<string> typewriterTexts = new List<string>();
        // Global connection for this Page instance (opened/closed per operation)
        private SqlConnection dbConn;

        protected void Page_Load(object sender, EventArgs e)
        {
            // Check if user is logged in
            if (Session["IsAdmin"] == null || !(bool)Session["IsAdmin"])
            {
                // Response.Redirect("Admin.aspx");
                return;
            }

            if (!IsPostBack)
            {
                LoadProfileData();
            }
            else
            {
                // Restore typewriter texts from ViewState
                if (ViewState["TypewriterTexts"] != null)
                {
                    typewriterTexts = (List<string>)ViewState["TypewriterTexts"];
                }
            }
        }

        private void LoadProfileData()
        {
            try
            {
                // Try to load from database first, then fall back to JSON
                LoadFromDatabase();
                BindTypewriterTexts();
            }
            catch (Exception ex)
            {
                System.Console.WriteLine("Error loading profile data: " + ex.ToString());
                ShowMessage("Error loading profile data: " + ex.Message, "error");
            }
        }

        private bool LoadFromDatabase()
        {
            try
            {
                if (dbConn == null) dbConn = new SqlConnection(connectionString);
                if (dbConn.State != ConnectionState.Open) dbConn.Open();

                string query = @"SELECT TOP 1 * FROM Profile ORDER BY LastUpdated DESC";

                bool found = false;
                using (SqlCommand cmd = new SqlCommand(query, dbConn))
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        txtName.Text = reader["Name"]?.ToString() ?? "";
                        txtTitle.Text = reader["Title"]?.ToString() ?? "";
                        var emailVal = reader["Email"]?.ToString() ?? "";
                        txtEmail.Text = emailVal;
                        txtLocation.Text = reader["Location"]?.ToString() ?? "";
                        txtBio.Text = reader["Bio"]?.ToString() ?? "";
                        txtAboutDescription.Text = reader["AboutDescription"]?.ToString() ?? "";
                        txtGithub.Text = reader["GithubUrl"]?.ToString() ?? "";
                        txtLinkedin.Text = reader["LinkedinUrl"]?.ToString() ?? "";



                        found = true;
                    }
                }

                if (found)
                {
                    // Load typewriter texts after reader is closed to avoid multiple open readers on the same connection
                    typewriterTexts = LoadTypewriterTexts();
                    return true;
                }
            }
            catch (Exception ex)
            {
                System.Console.WriteLine("Database load error: " + ex.ToString());
                System.Diagnostics.Debug.WriteLine("Database load error: " + ex.Message);
            }
            finally
            {
                try { if (dbConn != null && dbConn.State != ConnectionState.Closed) dbConn.Close(); } catch { }
            }

            return false;
        }


        private void BindTypewriterTexts()
        {
            ViewState["TypewriterTexts"] = typewriterTexts;
            rptTypewriterTexts.DataSource = typewriterTexts;
            rptTypewriterTexts.DataBind();
        }

        protected void btnAddTypewriterText_Click(object sender, EventArgs e)
        {
            string newText = txtNewTypewriterText.Text.Trim();
            if (!string.IsNullOrEmpty(newText) && !typewriterTexts.Contains(newText))
            {
                typewriterTexts.Add(newText);
                txtNewTypewriterText.Text = "";
                BindTypewriterTexts();
            }
        }

        protected void rptTypewriterTexts_ItemCommand(object source, RepeaterCommandEventArgs e)
        {
            if (e.CommandName == "Remove")
            {
                int index = Convert.ToInt32(e.CommandArgument);
                if (index >= 0 && index < typewriterTexts.Count)
                {
                    typewriterTexts.RemoveAt(index);
                    BindTypewriterTexts();
                }
            }
        }

        protected void btnSave_Click(object sender, EventArgs e)
        {
            try
            {
                SaveToDatabase();
                // LogActivity("Profile updated");
                ShowMessage("Profile saved successfully!", "success");
            }
            catch (Exception ex)
            {
                System.Console.WriteLine("Error saving profile: " + ex.ToString());
                ShowMessage("Error saving profile: " + ex.Message, "error");
            }
        }

        private void SaveToDatabase()
        {
            try
            {
                if (dbConn == null) dbConn = new SqlConnection(connectionString);
                if (dbConn.State != ConnectionState.Open) dbConn.Open();

                // Clear existing profile data
                string deleteQuery = "DELETE FROM Profile";
                using (SqlCommand deleteCmd = new SqlCommand(deleteQuery, dbConn))
                {
                    deleteCmd.ExecuteNonQuery();
                }

                // Insert new profile data
                string insertQuery = @"
                    INSERT INTO Profile (Name, Title, Email, Location, Bio, GithubUrl, LinkedinUrl, AboutDescription)
                    VALUES (@name, @title, @email, @location, @bio, @github, @linkedin, @aboutDescription)";

                using (SqlCommand cmd = new SqlCommand(insertQuery, dbConn))
                {
                    cmd.Parameters.AddWithValue("@name", txtName.Text.Trim());
                    cmd.Parameters.AddWithValue("@title", txtTitle.Text.Trim());
                    cmd.Parameters.AddWithValue("@email", txtEmail.Text.Trim());
                    cmd.Parameters.AddWithValue("@location", txtLocation.Text.Trim());
                    cmd.Parameters.AddWithValue("@bio", txtBio.Text.Trim());
                    cmd.Parameters.AddWithValue("@github", txtGithub.Text.Trim());
                    cmd.Parameters.AddWithValue("@linkedin", txtLinkedin.Text.Trim());
                    cmd.Parameters.AddWithValue("@aboutDescription", txtAboutDescription.Text.Trim());

                    cmd.ExecuteNonQuery();
                }

                // Save typewriter texts into TypewriterTexts table (clear previous)
                SaveTypewriterTexts();
            }
            catch (Exception ex)
            {
                System.Console.WriteLine("SaveToDatabase error: " + ex.ToString());
                throw;
            }
            finally
            {
                try { if (dbConn != null && dbConn.State != ConnectionState.Closed) dbConn.Close(); } catch { }
            }
        }

        private List<string> LoadTypewriterTexts()
        {
            var list = new List<string>();
            try
            {
                const string q = "SELECT Text FROM TypewriterTexts WHERE ProfileId = (SELECT TOP 1 Id FROM Profile ORDER BY LastUpdated DESC) ORDER BY DisplayOrder";
                if (dbConn == null) dbConn = new SqlConnection(connectionString);
                if (dbConn.State != ConnectionState.Open) dbConn.Open();

                using (var cmd = new SqlCommand(q, dbConn))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        list.Add(reader["Text"]?.ToString() ?? "");
                    }
                }
            }
            catch (Exception ex)
            {
                System.Console.WriteLine("LoadTypewriterTexts error: " + ex.ToString());
            }
            finally
            {
                try { if (dbConn != null && dbConn.State != ConnectionState.Closed) dbConn.Close(); } catch { }
            }
            return list;
        }

        private void SaveTypewriterTexts()
        {
            try
            {
                // Find latest profile id
                int profileId = 0;
                if (dbConn == null) dbConn = new SqlConnection(connectionString);
                if (dbConn.State != ConnectionState.Open) dbConn.Open();

                using (var cmd = new SqlCommand("SELECT TOP 1 Id FROM Profile ORDER BY LastUpdated DESC", dbConn))
                {
                    var res = cmd.ExecuteScalar();
                    profileId = res != null ? Convert.ToInt32(res) : 0;
                }

                if (profileId == 0) return;

                using (var del = new SqlCommand("DELETE FROM TypewriterTexts WHERE ProfileId = @profileId", dbConn))
                {
                    del.Parameters.AddWithValue("@profileId", profileId);
                    del.ExecuteNonQuery();
                }

                int order = 0;
                foreach (var t in typewriterTexts)
                {
                    using (var ins = new SqlCommand("INSERT INTO TypewriterTexts (ProfileId, Text, DisplayOrder) VALUES (@profileId, @text, @order)", dbConn))
                    {
                        ins.Parameters.AddWithValue("@profileId", profileId);
                        ins.Parameters.AddWithValue("@text", t);
                        ins.Parameters.AddWithValue("@order", order++);
                        ins.ExecuteNonQuery();
                    }
                }
            }
            catch (Exception ex)
            {
                System.Console.WriteLine("SaveTypewriterTexts error: " + ex.ToString());
            }
            finally
            {
                try { if (dbConn != null && dbConn.State != ConnectionState.Closed) dbConn.Close(); } catch { }
            }
        }

        // JSON export/load removed from profile management

        protected void lnkLogout_Click(object sender, EventArgs e)
        {
            Session.Clear();
            Session.Abandon();
            Response.Redirect("Admin.aspx");
        }

        private void ShowMessage(string message, string type)
        {
            var master = this.Master as AdminMaster;
            master?.ShowMessage(message, type);
        }
    }
}
