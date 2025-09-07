<%@ Page Language="C#" MasterPageFile="~/admin/Admin.Master" AutoEventWireup="true" CodeBehind="projects.aspx.cs" Inherits="_71.Admin.Projects" %>

<asp:Content ID="TitleContent" ContentPlaceHolderID="TitleContent" runat="server">Projects</asp:Content>

<asp:Content ID="HeaderContent" ContentPlaceHolderID="HeaderContent" runat="server">
    <div>
        <h1 class="text-2xl font-bold">Projects Management</h1>
        <p class="text-sm text-secondary">Manage your projects visible on the portfolio</p>
    </div>
    <div class="flex align-center gap-4">
        <a href="<%= ResolveUrl("~/admin/dashboard.aspx") %>" class="btn btn-outline">Back to Dashboard</a>
    </div>
</asp:Content>

<asp:Content ID="MainContent" ContentPlaceHolderID="MainContent" runat="server">
    <asp:Panel ID="pnlMessage" runat="server" Visible="false" CssClass="message">
        <asp:Label ID="lblMessage" runat="server"></asp:Label>
    </asp:Panel>

    <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h2 style="margin-bottom: 0;">Your Projects</h2>
            <div>
                <button type="button" onclick="toggleAddForm()" class="btn">Add New Project</button>
            </div>
        </div>

        <div id="addProjectForm" class="add-project-form">
            <h3 style="margin-bottom: 1rem;">Add New Project</h3>

            <div class="form-row">
                <div class="form-group">
                    <label for="txtNewName">Project Name</label>
                    <asp:TextBox ID="txtNewName" runat="server" CssClass="form-control" placeholder="Enter project name"></asp:TextBox>
                </div>
                <div class="form-group">
                    <label for="txtNewImageUrl">Image URL</label>
                    <asp:TextBox ID="txtNewImageUrl" runat="server" CssClass="form-control" placeholder="Enter image URL"></asp:TextBox>
                </div>
            </div>

            <div class="form-group">
                <label for="txtNewDescription">Description</label>
                <asp:TextBox ID="txtNewDescription" runat="server" TextMode="MultiLine" CssClass="form-control textarea" placeholder="Enter project description"></asp:TextBox>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="txtNewProjectUrl">Project URL (optional)</label>
                    <asp:TextBox ID="txtNewProjectUrl" runat="server" CssClass="form-control" placeholder="https://project-demo.com"></asp:TextBox>
                </div>
                <div class="form-group">
                    <label for="txtNewGithubUrl">GitHub URL (optional)</label>
                    <asp:TextBox ID="txtNewGithubUrl" runat="server" CssClass="form-control" placeholder="https://github.com/user/repo"></asp:TextBox>
                </div>
            </div>

            <div class="form-group">
                <label for="txtNewLanguage">Languages/Technologies</label>
                <div style="display: flex; gap: 0.5rem;">
                    <asp:TextBox ID="txtNewLanguage" runat="server" CssClass="form-control" placeholder="Enter language/technology" style="flex: 1;"></asp:TextBox>
                    <asp:Button ID="btnAddLanguage" runat="server" Text="Add" CssClass="btn" OnClick="btnAddLanguage_Click" />
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

            <div>
                <asp:HiddenField ID="hfEditProjectId" runat="server" />
                <asp:Button ID="btnAddProject" runat="server" Text="Add Project" CssClass="btn" OnClick="btnAddProject_Click" />
                <asp:Button ID="btnUpdateProject" runat="server" Text="Update Project" CssClass="btn" OnClick="btnUpdateProject_Click" Visible="false" />
                <asp:Button ID="btnCancelEdit" runat="server" Text="Cancel" CssClass="btn btn-secondary" OnClick="btnCancelEdit_Click" UseSubmitBehavior="false" />
            </div>
        </div>

        <div class="projects-grid">
            <asp:Repeater ID="rptProjects" runat="server" OnItemCommand="rptProjects_ItemCommand">
                <ItemTemplate>
                    <div class="project-card">
                        <div class="project-header">
                            <div class="project-title"><%# Eval("Name") %></div>
                            <div class="project-actions">
                                <asp:LinkButton ID="lnkEdit" runat="server" CssClass="btn-small btn-edit" CommandName="Edit" CommandArgument='<%# Eval("Id") %>' Text="Edit" />
                                <asp:LinkButton ID="lnkToggle" runat="server" 
                                    CssClass="btn-small btn-toggle" 
                                    CommandName="Toggle" CommandArgument='<%# Eval("Id") %>' 
                                    Text="Toggle" />
                                <asp:LinkButton ID="lnkDelete" runat="server" CssClass="btn-small btn-delete" 
                                    CommandName="Delete" CommandArgument='<%# Eval("Id") %>' Text="Delete" />
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
    </div>
</asp:Content>
