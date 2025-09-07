using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Configuration;

namespace _71.Admin
{
    public partial class Skills : Page
    {
        private readonly string connectionString = ConfigurationManager.ConnectionStrings["PortfolioDB"]?.ConnectionString ?? "";

        protected void Page_Load(object sender, EventArgs e)
        {
            // Check if user is logged in
            if (Session["IsAdmin"] == null || !(bool)Session["IsAdmin"])
            {
                Response.Redirect("Admin.aspx");
                return;
            }

            if (!IsPostBack)
            {
                LoadSkillCategories();
            }
        }

        private void LoadSkillCategories()
        {
            try
            {
                List<SkillCategoryOld> categories = new List<SkillCategoryOld>();

                // Try loading from database
                LoadCategoriesFromDatabase(categories);

                rptCategories.DataSource = categories;
                rptCategories.DataBind();
            }
            catch (Exception ex)
            {
                ShowMessage("Error loading skill categories: " + ex.Message, "error");
            }
        }

        private bool LoadCategoriesFromDatabase(List<SkillCategoryOld> categories)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();

                    // Load categories
                    string categoryQuery = @"SELECT Id, Name, SortOrder FROM SkillCategories 
                                          ORDER BY SortOrder, Name";

                    using (SqlCommand cmd = new SqlCommand(categoryQuery, conn))
                    {
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                var category = new SkillCategoryOld
                                {
                                    Id = (int)reader["Id"],
                                    Name = reader["Name"].ToString(),
                                    SortOrder = (int)reader["SortOrder"],
                                    Skills = new List<SkillOld>()
                                };
                                categories.Add(category);
                            }
                        }
                    }

                    // Load skills for each category
                    string skillQuery = @"SELECT Id, Name,CategoryId FROM Skills 
                                            WHERE CategoryId = @categoryId
                                            ORDER BY SortOrder, Name";

                    foreach (var category in categories)
                    {
                        using (SqlCommand cmd = new SqlCommand(skillQuery, conn))
                        {
                            cmd.Parameters.AddWithValue("@categoryId", category.Id);
                            using (SqlDataReader reader = cmd.ExecuteReader())
                            {
                                while (reader.Read())
                                {
                                    var skill = new SkillOld
                                    {
                                        Id = (int)reader["Id"],
                                        Name = reader["Name"].ToString(),
                                        CategoryId = category.Id
                                    };
                                    category.Skills.Add(skill);
                                }
                            }
                        }
                    }
                }

                return categories.Count > 0;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Database load error: " + ex.Message);
                return false;
            }
        }

        protected void btnAddCategory_Click(object sender, EventArgs e)
        {
            try
            {
                string categoryName = txtNewCategoryName.Text.Trim();
                if (string.IsNullOrEmpty(categoryName))
                {
                    ShowMessage("Category name is required.", "error");
                    return;
                }

                AddCategoryToDatabase(categoryName);
                txtNewCategoryName.Text = "";
                LoadSkillCategories();
                Utils.Logger.LogActivity("AddSkillCategory", Session["Username"]?.ToString(), $"Added new skill category: {categoryName}");
                ShowMessage("Category added successfully!", "success");
            }
            catch (Exception ex)
            {
                ShowMessage("Error adding category: " + ex.Message, "error");
            }
        }

        private void AddCategoryToDatabase(string categoryName)
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                string query = @"INSERT INTO SkillCategories (Name, SortOrder) 
                               VALUES (@name, @sortOrder)";

                // Get next sort order
                string sortQuery = "SELECT ISNULL(MAX(SortOrder), 0) + 1 FROM SkillCategories";
                int sortOrder;
                using (SqlCommand sortCmd = new SqlCommand(sortQuery, conn))
                {
                    sortOrder = (int)sortCmd.ExecuteScalar();
                }

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@name", categoryName);
                    cmd.Parameters.AddWithValue("@sortOrder", sortOrder);
                    cmd.ExecuteNonQuery();
                }
            }
        }

        protected void rptCategories_ItemCommand(object source, RepeaterCommandEventArgs e)
        {
            int categoryId = Convert.ToInt32(e.CommandArgument);

            try
            {
                switch (e.CommandName)
                {
                    case "DeleteCategory":
                        DeleteCategory(categoryId);
                        Utils.Logger.LogActivity("DeleteSkillCategory", Session["Username"]?.ToString(), $"Deleted skill category ID: {categoryId}");
                        ShowMessage("Category deleted successfully!", "success");
                        break;
                }

                LoadSkillCategories();
            }
            catch (Exception ex)
            {
                ShowMessage("Error: " + ex.Message, "error");
            }
        }

        protected void btnAddSkill_Command(object sender, CommandEventArgs e)
        {
            try
            {
                int categoryId = Convert.ToInt32(e.CommandArgument);

                // Find the textbox in the repeater item
                Button btn = (Button)sender;
                RepeaterItem item = (RepeaterItem)btn.NamingContainer;
                TextBox txtNewSkill = (TextBox)item.FindControl("txtNewSkill");

                string skillName = txtNewSkill.Text.Trim();
                if (string.IsNullOrEmpty(skillName))
                {
                    ShowMessage("Skill name is required.", "error");
                    return;
                }

                AddSkillToDatabase(categoryId, skillName);
                txtNewSkill.Text = "";
                LoadSkillCategories();
                Utils.Logger.LogActivity("AddSkill", Session["Username"]?.ToString(), $"Added new skill: {skillName}");
                ShowMessage("Skill added successfully!", "success");
            }
            catch (Exception ex)
            {
                ShowMessage("Error adding skill: " + ex.Message, "error");
            }
        }

        protected void rptSkills_ItemCommand(object source, RepeaterCommandEventArgs e)
        {
            if (e.CommandName == "RemoveSkill")
            {
                try
                {
                    int skillId = Convert.ToInt32(e.CommandArgument);
                    DeleteSkill(skillId);
                    LoadSkillCategories();
                    Utils.Logger.LogActivity("RemoveSkill", Session["Username"]?.ToString(), $"Removed skill ID: {skillId}");
                    ShowMessage("Skill removed successfully!", "success");
                }
                catch (Exception ex)
                {
                    ShowMessage("Error removing skill: " + ex.Message, "error");
                }
            }
        }

        private void AddSkillToDatabase(int categoryId, string skillName)
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                string query = @"INSERT INTO Skills (CategoryId, Name, SortOrder) 
                               VALUES (@categoryId, @name, @sortOrder)";

                // Get next sort order for this category
                string sortQuery = "SELECT ISNULL(MAX(SortOrder), 0) + 1 FROM Skills WHERE CategoryId = @categoryId";
                int sortOrder;
                using (SqlCommand sortCmd = new SqlCommand(sortQuery, conn))
                {
                    sortCmd.Parameters.AddWithValue("@categoryId", categoryId);
                    sortOrder = (int)sortCmd.ExecuteScalar();
                }

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@categoryId", categoryId);
                    cmd.Parameters.AddWithValue("@name", skillName);
                    cmd.Parameters.AddWithValue("@sortOrder", sortOrder);
                    cmd.ExecuteNonQuery();
                }
            }
        }

        private void DeleteCategory(int categoryId)
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();

                // Delete skills first (due to foreign key constraint)
                string deleteSkillsQuery = "DELETE FROM Skills WHERE CategoryId = @categoryId";
                using (SqlCommand cmd = new SqlCommand(deleteSkillsQuery, conn))
                {
                    cmd.Parameters.AddWithValue("@categoryId", categoryId);
                    cmd.ExecuteNonQuery();
                }

                // Then delete category
                string deleteCategoryQuery = "DELETE FROM SkillCategories WHERE Id = @categoryId";
                using (SqlCommand cmd = new SqlCommand(deleteCategoryQuery, conn))
                {
                    cmd.Parameters.AddWithValue("@categoryId", categoryId);
                    cmd.ExecuteNonQuery();
                }
            }
        }

        private void DeleteSkill(int skillId)
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                string query = "DELETE FROM Skills WHERE Id = @skillId";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@skillId", skillId);
                    cmd.ExecuteNonQuery();
                }
            }
        }

        private void ToggleCategoryStatus(int categoryId)
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                string query = "UPDATE SkillCategories SET IsActive = CASE WHEN IsActive = 1 THEN 0 ELSE 1 END WHERE Id = @categoryId";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@categoryId", categoryId);
                    cmd.ExecuteNonQuery();
                }
            }
        }

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

    public class SkillCategoryOld
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool IsActive { get; set; }
        public int SortOrder { get; set; }
        public List<SkillOld> Skills { get; set; }
    }

    public class SkillOld
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool IsActive { get; set; }
        public int CategoryId { get; set; }
    }
}
