<%@ Page Language="C#" MasterPageFile="~/Admin.Master" AutoEventWireup="true" CodeBehind="projects.aspx.cs" Inherits="_71.AdminProjects" %>

<asp:Content ID="TitleContent" ContentPlaceHolderID="TitleContent" runat="server">Projects Management</asp:Content>

<asp:Content ID="HeaderContent" ContentPlaceHolderID="HeaderContent" runat="server">
    <div>
        <h1 class="text-2xl font-bold">Projects Management</h1>
        <p class="text-sm text-secondary">Manage my portfolio projects</p>
    </div>
    <div class="flex align-center gap-4">
        <a href="<%= ResolveUrl("~/dashboard.aspx") %>" class="btn btn-outline">
            <i class="material-icons">arrow_back</i>
            Back to Dashboard
        </a>
    </div>
</asp:Content>

<asp:Content ID="HeadContent" ContentPlaceHolderID="HeadContent" runat="server">
    <style>
        /* Projects page specific styles */
        .projects-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); 
            gap: 1.5rem; 
        }
        .project-card { 
            background: var(--card-bg); 
            border: 1px solid var(--border); 
            border-radius: 12px; 
            padding: 1.5rem; 
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .project-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
        }
        .project-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid var(--border);
        }
        .project-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: var(--text);
        }
        .project-actions {
            display: flex;
            gap: 0.5rem;
        }
        .project-image { 
            width: 100%; 
            height: 160px; 
            object-fit: cover; 
            border-radius: 8px; 
            margin-bottom: 1rem; 
        }
        .project-description {
            color: var(--color-text-secondary);
            margin-bottom: 1rem;
            line-height: 1.5;
        }
        .project-languages {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }
        .language-tag {
            background: rgba(var(--color-primary-rgb), 0.1);
            color: var(--primary);
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            font-size: 0.8rem;
            border: 1px solid rgba(var(--color-primary-rgb), 0.2);
        }
        .add-project-form {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            display: none;
        }
        .add-project-form.show {
            display: block;
        }
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        .languages-input {
            margin-top: 0.5rem;
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        .language-item {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(var(--color-primary-rgb), 0.1);
            color: var(--primary);
            padding: 0.3rem 0.6rem;
            border-radius: 15px;
            font-size: 0.85rem;
        }
        .remove-item {
            color: var(--color-text-secondary);
            text-decoration: none;
            font-size: 1rem;
            line-height: 1;
        }
        .project-links {
            display: flex;
            gap: 0.75rem;
            margin-top: 1rem;
        }
        .project-link {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            color: var(--primary);
            text-decoration: none;
            font-size: 0.9rem;
        }
        .project-link:hover {
            text-decoration: underline;
        }
    </style>
    <script>
        function toggleAddForm() {
            var form = document.getElementById('addProjectForm');
            form.classList.toggle('show');
        }

        function confirmDelete(projectName) {
            return confirm('Are you sure you want to delete the project "' + projectName + '"?');
        }
    </script>
</asp:Content>

<asp:Content ID="MainContent" ContentPlaceHolderID="MainContent" runat="server">
    <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h2 style="margin-bottom: 0;">Your Projects</h2>
            <div>
                <button type="button" onclick="toggleAddForm()" class="btn">
                    <i class="material-icons">add</i>
                    Add New Project
                </button>
            </div>
        </div>

        <div id="addProjectForm" class="add-project-form">
            <h3 id="formTitle" style="margin-bottom: 1rem;">Add New Project</h3>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="<%= txtNewName.ClientID %>">Project Name</label>
                    <asp:TextBox ID="txtNewName" runat="server" CssClass="form-control" placeholder="Enter project name"></asp:TextBox>
                </div>
                <div class="form-group">
                    <label for="<%= ddlNewStatus.ClientID %>">Project Status</label>
                    <asp:DropDownList ID="ddlNewStatus" runat="server" CssClass="form-control">
                        <asp:ListItem Value="InProgress" Text="In Progress" Selected="true"></asp:ListItem>
                        <asp:ListItem Value="Active" Text="Active"></asp:ListItem>
                        <asp:ListItem Value="Archived" Text="Archived"></asp:ListItem>
                    </asp:DropDownList>
                </div>
            </div>

            <div class="form-group">
                <label for="<%= txtNewDescription.ClientID %>">Description</label>
                <asp:TextBox ID="txtNewDescription" runat="server" TextMode="MultiLine" CssClass="form-control" placeholder="Enter project description" Rows="3"></asp:TextBox>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="<%= txtNewProjectUrl.ClientID %>">Project URL (optional)</label>
                    <asp:TextBox ID="txtNewProjectUrl" runat="server" CssClass="form-control" placeholder="https://project-demo.com"></asp:TextBox>
                </div>
                <div class="form-group">
                    <label for="<%= txtNewImageUrl.ClientID %>">Image URL</label>
                    <asp:TextBox ID="txtNewImageUrl" runat="server" CssClass="form-control" placeholder="Enter image URL"></asp:TextBox>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="<%= txtNewGithubUrl.ClientID %>">GitHub URL (optional)</label>
                    <asp:TextBox ID="txtNewGithubUrl" runat="server" CssClass="form-control" placeholder="https://github.com/user/repo"></asp:TextBox>
                </div>
            </div>

            <div class="form-group">
                <label for="<%= txtNewLanguage.ClientID %>">Languages/Technologies</label>
                <div style="display: flex; gap: 0.5rem;">
                    <asp:TextBox ID="txtNewLanguage" runat="server" CssClass="form-control" placeholder="Enter language/technology" style="flex: 1;"></asp:TextBox>
                    <asp:Button ID="btnAddLanguage" runat="server" Text="Add" CssClass="btn-small" OnClick="btnAddLanguage_Click" />
                </div>
                <div class="languages-input">
                    <asp:Repeater ID="rptNewLanguages" runat="server" OnItemCommand="rptNewLanguages_ItemCommand">
                        <ItemTemplate>
                            <div class="language-item">
                                <%# Container.DataItem %>
                                <asp:LinkButton ID="lnkRemove" runat="server" CssClass="remove-item" CommandName="Remove" CommandArgument='<%# Container.ItemIndex %>' Text="×" />
                            </div>
                        </ItemTemplate>
                    </asp:Repeater>
                </div>
            </div>

            <div style="display: flex; gap: 0.75rem;">
                <asp:HiddenField ID="hfEditProjectId" runat="server" />
                <asp:Button ID="btnAddProject" runat="server" Text="Add Project" CssClass="btn" OnClick="btnAddProject_Click" />
                <asp:Button ID="btnUpdateProject" runat="server" Text="Update Project" CssClass="btn" OnClick="btnUpdateProject_Click" Visible="false" />
                <asp:Button ID="btnCancelEdit" runat="server" Text="Cancel" CssClass="btn btn-secondary" OnClick="btnCancelEdit_Click" Visible="false" />
            </div>
        </div>

        <div class="projects-grid">
            <asp:Repeater ID="rptProjects" runat="server" OnItemCommand="rptProjects_ItemCommand">
                <ItemTemplate>
                    <div class="project-card">
                        <div class="project-header">
                            <div class="project-title"><%# Eval("Name") %></div>
                            <div class="project-actions">
                                <asp:LinkButton ID="lnkEdit" runat="server" CssClass="btn-small btn-edit" CommandName="Edit" CommandArgument='<%# Eval("Id") %>' ToolTip="Edit Project">
                                    <i class="material-icons" style="font-size: 16px;">edit</i>
                                </asp:LinkButton>
                                <asp:LinkButton ID="lnkDelete" runat="server" CssClass="btn-small btn-delete" CommandName="Delete" CommandArgument='<%# Eval("Id") %>' OnClientClick="return confirm('Are you sure you want to delete this project?');" ToolTip="Delete Project">
                                    <i class="material-icons" style="font-size: 16px;">delete</i>
                                </asp:LinkButton>
                            </div>
                        </div>
                        
                        <%# !string.IsNullOrEmpty(Eval("ImageUrl")?.ToString()) ? 
                            "<img src=\"" + Eval("ImageUrl") + "\" alt=\"" + Eval("Name") + "\" class=\"project-image\" onerror=\"this.style.display='none'\" />" : "" %>
                        
                        <div class="project-description"><%# Eval("Description") %></div>
                        
                        <div class="project-languages">
                            <%# GetLanguageTags(Eval("Languages")?.ToString() ?? String.Empty) %>
                        </div>

                        <%# GetProjectLinks(Eval("ProjectUrl")?.ToString(), Eval("GithubUrl")?.ToString()) %>
                    </div>
                </ItemTemplate>
            </asp:Repeater>
        </div>

        <div id="emptyState" runat="server" visible="false" style="text-align: center; padding: 3rem 1rem; color: var(--color-text-secondary);">
            <i class="material-icons" style="font-size: 64px; margin-bottom: 1rem; opacity: 0.5;">folder_open</i>
            <h3 style="margin-bottom: 0.5rem;">No projects yet</h3>
            <p>Create my first project to showcase my work.</p>
        </div>
    </div>
</asp:Content>
