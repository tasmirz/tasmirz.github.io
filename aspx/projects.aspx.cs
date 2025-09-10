using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using _71.DAL;
using _71.Models;
using _71.Admin;

namespace _71
{
    public partial class AdminProjects : System.Web.UI.Page
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
            if (rptProjects != null)
            {
                rptProjects.DataSource = projects;
                rptProjects.DataBind();
            }
            // reset new languages list
            NewLanguages = new List<string>();
            BindNewLanguages();
        }

        protected void btnAddLanguage_Click(object sender, EventArgs e)
        {
            if (txtNewLanguage != null)
            {
                var text = txtNewLanguage.Text?.Trim();
                if (!string.IsNullOrEmpty(text))
                {
                    var list = NewLanguages;
                    if (!list.Contains(text)) list.Add(text);
                    NewLanguages = list;
                    txtNewLanguage.Text = string.Empty;
                    BindNewLanguages();

                    // Determine add vs edit mode and set button visibility
                    var isEdit = hfEditProjectId != null && !string.IsNullOrEmpty(hfEditProjectId.Value);
                    if (isEdit)
                    {
                        if (btnAddProject != null) btnAddProject.Visible = false;
                        if (btnUpdateProject != null) btnUpdateProject.Visible = true;
                        if (btnCancelEdit != null) btnCancelEdit.Visible = true;
                    }
                    else
                    {
                        if (btnAddProject != null) btnAddProject.Visible = true;
                        if (btnUpdateProject != null) btnUpdateProject.Visible = false;
                        if (btnCancelEdit != null) btnCancelEdit.Visible = false;
                    }

                    // Always re-show the form after a postback caused by language add/remove so the user doesn't lose the form state.
                    var title = isEdit ? "Edit Project" : "Add New Project";
                    if (hfKeepFormOpen != null) hfKeepFormOpen.Value = "1";
                    ClientScript.RegisterStartupScript(this.GetType(), "ShowEditForm", $"document.getElementById('addProjectForm').classList.add('show'); document.getElementById('formTitle').textContent = '{title}';", true);
                }
            }
        }

        private void BindNewLanguages()
        {
            if (rptNewLanguages != null)
            {
                rptNewLanguages.DataSource = NewLanguages;
                rptNewLanguages.DataBind();
            }
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

                    // Determine add vs edit mode and set button visibility
                    var isEdit = hfEditProjectId != null && !string.IsNullOrEmpty(hfEditProjectId.Value);
                    if (isEdit)
                    {
                        if (btnAddProject != null) btnAddProject.Visible = false;
                        if (btnUpdateProject != null) btnUpdateProject.Visible = true;
                        if (btnCancelEdit != null) btnCancelEdit.Visible = true;
                    }
                    else
                    {
                        if (btnAddProject != null) btnAddProject.Visible = true;
                        if (btnUpdateProject != null) btnUpdateProject.Visible = false;
                        if (btnCancelEdit != null) btnCancelEdit.Visible = false;
                    }

                    // Always re-show the form after a postback caused by language add/remove so the user doesn't lose the form state.
                    var title = isEdit ? "Edit Project" : "Add New Project";
                    if (hfKeepFormOpen != null) hfKeepFormOpen.Value = "1";
                    ClientScript.RegisterStartupScript(this.GetType(), "ShowEditForm", $"document.getElementById('addProjectForm').classList.add('show'); document.getElementById('formTitle').textContent = '{title}';", true);
                }
            }
        }

        protected void btnAddProject_Click(object sender, EventArgs e)
        {
            // Parse the status from dropdown
            ProjectStatus status = ProjectStatus.InProgress;
            if (ddlNewStatus != null && Enum.TryParse<ProjectStatus>(ddlNewStatus.SelectedValue, out var parsedStatus))
            {
                status = parsedStatus;
            }

            var project = new ProjectModel
            {
                Name = txtNewName?.Text?.Trim() ?? string.Empty,
                Description = txtNewDescription?.Text?.Trim() ?? string.Empty,
                ImageUrl = txtNewImageUrl?.Text?.Trim(),
                ProjectUrl = txtNewProjectUrl?.Text?.Trim(),
                GithubUrl = txtNewGithubUrl?.Text?.Trim(),
                Languages = NewLanguages ?? new List<string>(),
                Status = status,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            var ok = repo.AddProject(project);
            if (ok)
            {
                ((AdminMaster)this.Master)?.ShowMessage("Project added successfully!", "success");
                ClearForm();
                LoadProjects();
            }
            else
            {
                ((AdminMaster)this.Master)?.ShowMessage("Failed to add project.", "error");
            }
        }

        protected void rptProjects_ItemCommand(object source, RepeaterCommandEventArgs e)
        {
            try
            {
                if (e?.CommandArgument == null) return;

                if (!int.TryParse(e.CommandArgument.ToString(), out int id)) return;

                switch (e.CommandName)
                {
                    case "Edit":
                        var p = repo.GetProjectById(id);
                        if (p != null)
                        {
                            // Check all controls for null before accessing
                            if (hfEditProjectId != null) hfEditProjectId.Value = p.Id.ToString();
                            if (txtNewName != null) txtNewName.Text = p.Name ?? "";
                            if (txtNewDescription != null) txtNewDescription.Text = p.Description ?? "";
                            if (txtNewImageUrl != null) txtNewImageUrl.Text = p.ImageUrl ?? "";
                            if (txtNewProjectUrl != null) txtNewProjectUrl.Text = p.ProjectUrl ?? "";
                            if (txtNewGithubUrl != null) txtNewGithubUrl.Text = p.GithubUrl ?? "";

                            // Check if ddlNewStatus is not null before setting value
                            if (ddlNewStatus != null)
                            {
                                ddlNewStatus.SelectedValue = p.Status.ToString();
                            }

                            NewLanguages = p.Languages ?? new List<string>();
                            BindNewLanguages();

                            if (btnAddProject != null) btnAddProject.Visible = false;
                            if (btnUpdateProject != null) btnUpdateProject.Visible = true;
                            if (btnCancelEdit != null) btnCancelEdit.Visible = true;

                            // Show the form using JavaScript
                            ClientScript.RegisterStartupScript(this.GetType(), "ShowEditForm", "document.getElementById('addProjectForm').classList.add('show'); document.getElementById('formTitle').textContent = 'Edit Project';", true);
                        }
                        break;
                    case "Delete":
                        if (repo.DeleteProject(id))
                        {
                            ((AdminMaster)this.Master)?.ShowMessage("Project deleted.", "success");
                            LoadProjects();
                        }
                        else ((AdminMaster)this.Master)?.ShowMessage("Failed to delete project.", "error");
                        break;
                }
            }
            catch (Exception ex)
            {
                ((AdminMaster)this.Master)?.ShowMessage("Error processing command: " + ex.Message, "error");
            }
        }

        protected void btnUpdateProject_Click(object sender, EventArgs e)
        {
            if (hfEditProjectId?.Value == null || !int.TryParse(hfEditProjectId.Value, out int id)) return;
            var existing = repo.GetProjectById(id);
            if (existing == null) { ((AdminMaster)this.Master)?.ShowMessage("Project not found.", "error"); return; }

            // Parse the status from dropdown
            ProjectStatus status = existing.Status;
            if (ddlNewStatus != null && Enum.TryParse<ProjectStatus>(ddlNewStatus.SelectedValue, out var parsedStatus))
            {
                status = parsedStatus;
            }

            existing.Name = txtNewName?.Text?.Trim() ?? string.Empty;
            existing.Description = txtNewDescription?.Text?.Trim() ?? string.Empty;
            existing.ImageUrl = txtNewImageUrl?.Text?.Trim();
            existing.ProjectUrl = txtNewProjectUrl?.Text?.Trim();
            existing.GithubUrl = txtNewGithubUrl?.Text?.Trim();
            existing.Languages = NewLanguages ?? new List<string>();
            existing.Status = status;
            existing.UpdatedAt = DateTime.Now;

            if (repo.UpdateProject(existing))
            {
                ((AdminMaster)this.Master)?.ShowMessage("Project updated.", "success");
                ClearForm();
                LoadProjects();
                btnAddProject.Visible = true;
                btnUpdateProject.Visible = false;
                btnCancelEdit.Visible = false;
                // Hide the form and reset title
                if (hfKeepFormOpen != null) hfKeepFormOpen.Value = string.Empty;
                ClientScript.RegisterStartupScript(this.GetType(), "HideEditForm", "document.getElementById('addProjectForm').classList.remove('show'); document.getElementById('formTitle').textContent = 'Add New Project';", true);
            }
            else ((AdminMaster)this.Master)?.ShowMessage("Failed to update project.", "error");
        }

        protected void btnCancelEdit_Click(object sender, EventArgs e)
        {
            ClearForm();
            btnAddProject.Visible = true;
            btnUpdateProject.Visible = false;
            btnCancelEdit.Visible = false;
            // Hide the form and reset title
            if (hfKeepFormOpen != null) hfKeepFormOpen.Value = string.Empty;
            ClientScript.RegisterStartupScript(this.GetType(), "HideEditForm", "document.getElementById('addProjectForm').classList.remove('show'); document.getElementById('formTitle').textContent = 'Add New Project';", true);
        }

        private void ClearForm()
        {
            if (txtNewName != null) txtNewName.Text = string.Empty;
            if (txtNewDescription != null) txtNewDescription.Text = string.Empty;
            if (txtNewImageUrl != null) txtNewImageUrl.Text = string.Empty;
            if (txtNewProjectUrl != null) txtNewProjectUrl.Text = string.Empty;
            if (txtNewGithubUrl != null) txtNewGithubUrl.Text = string.Empty;

            if (ddlNewStatus != null)
            {
                ddlNewStatus.SelectedValue = "InProgress";
            }

            if (hfEditProjectId != null) hfEditProjectId.Value = string.Empty;
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
            Response.Redirect("login.aspx");
        }
    }
}
