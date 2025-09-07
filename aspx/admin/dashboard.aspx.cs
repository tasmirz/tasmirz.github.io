using System;
using System.Collections.Generic;
using System.Linq;
using System.Data.SqlClient;
using System.Web.UI;
using System.Web.UI.WebControls;
using _71.DAL;
using _71.Utils;

namespace _71.Admin
{
    public partial class Dashboard : Page
    {
        private readonly ProjectRepository _projectRepository = new ProjectRepository();
        private readonly SkillsRepository _skillsRepository = new SkillsRepository();
        private readonly MessagesRepository _messagesRepository = new MessagesRepository();

        protected void Page_Load(object sender, EventArgs e)
        {
            // Authentication is handled by the master page
            if (!IsPostBack)
            {
                LoadDashboardData();
            }
        }

        private void LoadDashboardData()
        {
            LoadUserInfo();
            LoadStatistics();
            LoadRecentProjects();
            LoadRecentMessages();
        }

        private void LoadUserInfo()
        {
            lblUsername.Text = GetCurrentUsername();
        }

        private string GetCurrentUsername()
        {
            return Session[Constants.SESSION_ADMIN_USER]?.ToString() ?? "Admin";
        }

        private void LoadStatistics()
        {
            try
            {
                LoadProjectStatistics();
                LoadSkillStatistics();
                LoadMessageStatistics();
            }
            catch (Exception ex)
            {
                Logger.LogError("Failed to load dashboard statistics", ex);
                SetDefaultStatistics();
            }
        }

        private void LoadProjectStatistics()
        {
            try
            {
                var projects = _projectRepository.GetAllProjects();
                lblProjectCount.Text = projects?.Count.ToString() ?? "0";
            }
            catch
            {
                lblProjectCount.Text = "0";
            }
        }

        private void LoadSkillStatistics()
        {
            try
            {
                var categories = _skillsRepository.GetAllSkillCategories();
                int totalSkills = 0;

                if (categories != null)
                {
                    foreach (var category in categories)
                    {
                        if (category.Skills != null)
                            totalSkills += category.Skills.Count;
                    }
                }

                lblSkillCount.Text = totalSkills.ToString();
                lblCategoryCount.Text = categories?.Count.ToString() ?? "0";
            }
            catch
            {
                lblSkillCount.Text = "0";
                lblCategoryCount.Text = "0";
            }
        }

        private void LoadMessageStatistics()
        {
            try
            {
                var messages = _messagesRepository.ListAll();
                lblMessageCount.Text = messages?.Count.ToString() ?? "0";
            }
            catch
            {
                lblMessageCount.Text = "0";
            }
        }

        private void LoadRecentProjects()
        {
            try
            {
                var projects = _projectRepository.GetAllProjects();
                if (projects != null && projects.Count > 0)
                {
                    // Take only the most recent 5 projects
                    var recentProjects = projects.Take(5).ToList();
                    rptRecentProjects.DataSource = recentProjects;
                    rptRecentProjects.DataBind();
                    pnlNoProjects.Visible = false;
                }
                else
                {
                    pnlNoProjects.Visible = true;
                }
            }
            catch (Exception ex)
            {
                Logger.LogError("Failed to load recent projects", ex);
                pnlNoProjects.Visible = true;
            }
        }

        private void LoadRecentMessages()
        {
            try
            {
                var messages = _messagesRepository.ListAll();
                if (messages != null && messages.Count > 0)
                {
                    // Take only the most recent 5 messages
                    var recentMessages = messages.Take(5).ToList();
                    rptRecentMessages.DataSource = recentMessages;
                    rptRecentMessages.DataBind();
                    pnlNoMessages.Visible = false;
                }
                else
                {
                    pnlNoMessages.Visible = true;
                }
            }
            catch (Exception ex)
            {
                Logger.LogError("Failed to load recent messages", ex);
                pnlNoMessages.Visible = true;
            }
        }

        protected string GetStatusClass(string status)
        {
            if (string.IsNullOrEmpty(status))
                return string.Empty;

            var s = status.ToLowerInvariant();
            switch (s)
            {
                case "active":
                    return "status-active";
                case "inprogress":
                    return "status-inprogress";
                case "archived":
                    return "status-archived";
                default:
                    return string.Empty;
            }
        }

        private void SetDefaultStatistics()
        {
            lblProjectCount.Text = "0";
            lblSkillCount.Text = "0";
            lblCategoryCount.Text = "0";
            lblMessageCount.Text = "0";
        }
    }
}
