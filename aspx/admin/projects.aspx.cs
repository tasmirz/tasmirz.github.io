using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using _71.DAL;
using _71.Models;

namespace _71.Admin
{
    public partial class Projects : Page
    {
        private readonly ProjectRepository repo = new ProjectRepository();

        private List<string> NewLanguages
        {
            get => ViewState["NewLanguages"] as List<string> ?? new List<string>();
            set => ViewState["NewLanguages"] = value;
        }

        protected void Page_Load(object sender, EventArgs e)
        {
            if (Session["IsAdmin"] == null || !(bool)Session["IsAdmin"]) return;

            if (!IsPostBack)
            {
                LoadProjects();
            }
        }

        private void LoadProjects()
        {
            var projects = repo.GetAllProjects();
            rptProjects.DataSource = projects;
            rptProjects.DataBind();
            // reset new languages list
            NewLanguages = new List<string>();
            BindNewLanguages();
        }

        protected void btnAddLanguage_Click(object sender, EventArgs e)
        {
            var text = txtNewLanguage.Text?.Trim();
            if (!string.IsNullOrEmpty(text))
            {
                var list = NewLanguages;
                if (!list.Contains(text)) list.Add(text);
                NewLanguages = list;
                txtNewLanguage.Text = string.Empty;
                BindNewLanguages();
            }
        }

        private void BindNewLanguages()
        {
            rptNewLanguages.DataSource = NewLanguages;
            rptNewLanguages.DataBind();
        }

        protected void rptNewLanguages_ItemCommand(object source, RepeaterCommandEventArgs e)
        {
            if (e.CommandName == "Remove")
            {
                int idx = Convert.ToInt32(e.CommandArgument);
                var list = NewLanguages;
                if (idx >= 0 && idx < list.Count)
                {
                    list.RemoveAt(idx);
                    NewLanguages = list;
                    BindNewLanguages();
                }
            }
        }

        protected void btnAddProject_Click(object sender, EventArgs e)
        {
            var project = new ProjectModel
            {
                Name = txtNewName.Text?.Trim() ?? string.Empty,
                Description = txtNewDescription.Text?.Trim() ?? string.Empty,
                ImageUrl = txtNewImageUrl.Text?.Trim(),
                ProjectUrl = txtNewProjectUrl.Text?.Trim(),
                GithubUrl = txtNewGithubUrl.Text?.Trim(),
                Languages = NewLanguages ?? new List<string>(),
                Status = ProjectStatus.InProgress,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            var ok = repo.AddProject(project);
            if (ok)
            {
                ShowMessage("Project added successfully!", "success");
                ClearForm();
                LoadProjects();
            }
            else
            {
                ShowMessage("Failed to add project.", "error");
            }
        }

        protected void rptProjects_ItemCommand(object source, RepeaterCommandEventArgs e)
        {
            int id = Convert.ToInt32(e.CommandArgument);
            switch (e.CommandName)
            {
                case "Edit":
                    var p = repo.GetProjectById(id);
                    if (p != null)
                    {
                        hfEditProjectId.Value = p.Id.ToString();
                        txtNewName.Text = p.Name;
                        txtNewDescription.Text = p.Description;
                        txtNewImageUrl.Text = p.ImageUrl;
                        txtNewProjectUrl.Text = p.ProjectUrl;
                        txtNewGithubUrl.Text = p.GithubUrl;
                        NewLanguages = p.Languages ?? new List<string>();
                        BindNewLanguages();
                        btnAddProject.Visible = false;
                        btnUpdateProject.Visible = true;
                    }
                    break;
                case "Delete":
                    if (repo.DeleteProject(id))
                    {
                        ShowMessage("Project deleted.", "success");
                        LoadProjects();
                    }
                    else ShowMessage("Failed to delete project.", "error");
                    break;
                case "Toggle":
                    var existing = repo.GetProjectById(id);
                    if (existing != null)
                    {
                        var newStatus = existing.Status == ProjectStatus.Active ? ProjectStatus.InProgress : ProjectStatus.Active;
                        if (repo.UpdateProjectStatus(id, newStatus))
                        {
                            ShowMessage("Project status updated.", "success");
                            LoadProjects();
                        }
                        else ShowMessage("Failed to update status.", "error");
                    }
                    break;
            }
        }

        protected void btnUpdateProject_Click(object sender, EventArgs e)
        {
            if (!int.TryParse(hfEditProjectId.Value, out int id)) return;
            var existing = repo.GetProjectById(id);
            if (existing == null) { ShowMessage("Project not found.", "error"); return; }

            existing.Name = txtNewName.Text?.Trim() ?? string.Empty;
            existing.Description = txtNewDescription.Text?.Trim() ?? string.Empty;
            existing.ImageUrl = txtNewImageUrl.Text?.Trim();
            existing.ProjectUrl = txtNewProjectUrl.Text?.Trim();
            existing.GithubUrl = txtNewGithubUrl.Text?.Trim();
            existing.Languages = NewLanguages ?? new List<string>();
            existing.UpdatedAt = DateTime.Now;

            if (repo.UpdateProject(existing))
            {
                ShowMessage("Project updated.", "success");
                ClearForm();
                LoadProjects();
                btnAddProject.Visible = true;
                btnUpdateProject.Visible = false;
            }
            else ShowMessage("Failed to update project.", "error");
        }

        protected void btnCancelEdit_Click(object sender, EventArgs e)
        {
            ClearForm();
            btnAddProject.Visible = true;
            btnUpdateProject.Visible = false;
        }

        private void ClearForm()
        {
            txtNewName.Text = string.Empty;
            txtNewDescription.Text = string.Empty;
            txtNewImageUrl.Text = string.Empty;
            txtNewProjectUrl.Text = string.Empty;
            txtNewGithubUrl.Text = string.Empty;
            hfEditProjectId.Value = string.Empty;
            NewLanguages = new List<string>();
            BindNewLanguages();
        }

        // Helper used by markup. Accepts a single string argument (may be the ToString() of a list).
        public string GetLanguageTags(string languages)
        {
            // If languages looks like a CLR type name, attempt to return empty
            if (string.IsNullOrEmpty(languages)) return string.Empty;
            if (languages.Contains("System.Collections.Generic.List")) return string.Empty;
            // Treat comma-separated
            var parts = languages.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim());
            return string.Join(" ", parts.Select(p => $"<span class=\"tag\">{HttpUtility.HtmlEncode(p)}</span>"));
        }

        public string GetProjectLinks(string projectUrl, string githubUrl)
        {
            var html = string.Empty;
            if (!string.IsNullOrEmpty(projectUrl))
            {
                html += $"<a class=\"btn-link\" href=\"{HttpUtility.HtmlEncode(projectUrl)}\" target=\"_blank\">View</a> ";
            }
            if (!string.IsNullOrEmpty(githubUrl))
            {
                html += $"<a class=\"btn-link\" href=\"{HttpUtility.HtmlEncode(githubUrl)}\" target=\"_blank\">GitHub</a>";
            }
            return html;
        }

        // Logout link on the page (markup uses OnClick="lnkLogout_Click")
        protected void lnkLogout_Click(object sender, EventArgs e)
        {
            try
            {
                Session.Clear();
                Session.Abandon();
            }
            catch { }
            // Redirect to admin login or landing page
            Response.Redirect("Admin.aspx");
        }

        private void ShowMessage(string message, string type)
        {
            var master = this.Master as AdminMaster;
            master?.ShowMessage(message, type);
        }
    }
}
