using System;
using System.Collections.Generic;
using System.Web.UI;
using System.Web.UI.WebControls;
using _71.Models;
using _71.DAL;

namespace _71.Admin
{
    public partial class Skills : Page
    {
        private readonly SkillsRepository _skillsRepository = new SkillsRepository();

        protected void Page_Load(object sender, EventArgs e)
        {
            // Check if user is logged in
            if (Session["IsAdmin"] == null || !(bool)Session["IsAdmin"])
            {
                Response.Redirect("login.aspx");
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
                var categories = _skillsRepository.GetAllSkillCategoriesWithSkills();
                rptCategories.DataSource = categories;
                rptCategories.DataBind();
            }
            catch (Exception ex)
            {
                ShowMessage("Error loading skill categories: " + ex.Message, "error");
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

                if (_skillsRepository.AddSkillCategory(categoryName))
                {
                    txtNewCategoryName.Text = "";
                    LoadSkillCategories();
                    ShowMessage("Category added successfully!", "success");
                }
                else
                {
                    ShowMessage("Failed to add category. Please try again.", "error");
                }
            }
            catch (Exception ex)
            {
                ShowMessage("Error adding category: " + ex.Message, "error");
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
                        if (_skillsRepository.DeleteSkillCategoryAndSkills(categoryId))
                        {
                            ShowMessage("Category deleted successfully!", "success");
                        }
                        else
                        {
                            ShowMessage("Failed to delete category. Please try again.", "error");
                        }
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

                if (_skillsRepository.AddSkill(categoryId, skillName))
                {
                    txtNewSkill.Text = "";
                    LoadSkillCategories();
                    ShowMessage("Skill added successfully!", "success");
                }
                else
                {
                    ShowMessage("Failed to add skill. Please try again.", "error");
                }
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
                    if (_skillsRepository.DeleteSkill(skillId))
                    {
                        LoadSkillCategories();
                        ShowMessage("Skill removed successfully!", "success");
                    }
                    else
                    {
                        ShowMessage("Failed to remove skill. Please try again.", "error");
                    }
                }
                catch (Exception ex)
                {
                    ShowMessage("Error removing skill: " + ex.Message, "error");
                }
            }
        }

        protected void lnkLogout_Click(object sender, EventArgs e)
        {
            Session.Clear();
            Session.Abandon();
            Response.Redirect("login.aspx");
        }

        private void ShowMessage(string message, string type)
        {
            var master = this.Master as AdminMaster;
            master?.ShowMessage(message, type);
        }
    }
}