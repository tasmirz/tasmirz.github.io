<%@ Page Language="C#" MasterPageFile="~/admin/Admin.Master" AutoEventWireup="true" CodeBehind="dashboard.aspx.cs" Inherits="_71.Admin.Dashboard" %>

<asp:Content ID="TitleContent" ContentPlaceHolderID="TitleContent" runat="server">
    Dashboard
</asp:Content>

<asp:Content ID="HeaderContent" ContentPlaceHolderID="HeaderContent" runat="server">
    <div>
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <p class="text-sm text-secondary">Overview of your portfolio</p>
    </div>
    <div class="flex align-center gap-4">
        <span class="text-sm">Welcome, <asp:Label ID="lblUsername" runat="server" CssClass="font-semibold"></asp:Label></span>
    </div>
</asp:Content>

<asp:Content ID="MainContent" ContentPlaceHolderID="MainContent" runat="server">
    <!-- Stats Cards -->
    <div class="grid grid-4 mb-6">
        <div class="card">
            <div class="flex align-center justify-between">
                <div>
                    <div class="text-2xl font-bold">
                        <asp:Label ID="lblProjectCount" runat="server">0</asp:Label>
                    </div>
                    <div class="text-sm text-secondary">Total Projects</div>
                </div>
                <div class="text-primary">
                    <i class="ri-folder-line text-xl"></i>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="flex align-center justify-between">
                <div>
                    <div class="text-2xl font-bold">
                        <asp:Label ID="lblSkillCount" runat="server">0</asp:Label>
                    </div>
                    <div class="text-sm text-secondary">Skills</div>
                </div>
                <div class="text-primary">
                    <i class="ri-code-box-line text-xl"></i>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="flex align-center justify-between">
                <div>
                    <div class="text-2xl font-bold">
                        <asp:Label ID="lblCategoryCount" runat="server">0</asp:Label>
                    </div>
                    <div class="text-sm text-secondary">Skill Categories</div>
                </div>
                <div class="text-primary">
                    <i class="ri-archive-line text-xl"></i>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="flex align-center justify-between">
                <div>
                    <div class="text-2xl font-bold">
                        <asp:Label ID="lblMessageCount" runat="server">0</asp:Label>
                    </div>
                    <div class="text-sm text-secondary">Messages</div>
                </div>
                <div class="text-primary">
                    <i class="ri-mail-line text-xl"></i>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Activity -->
    <div class="grid grid-2 gap-6">
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Recent Projects</h3>
                <a href="<%= ResolveUrl("~/admin/projects.aspx") %>" class="btn btn-sm btn-outline">
                    <i class="ri-add-line"></i>
                    Add Project
                </a>
            </div>
            <div class="space-y-3">
                <asp:Repeater ID="rptRecentProjects" runat="server">
                    <ItemTemplate>
                        <div class="flex justify-between align-center py-2 border-b border-color-border">
                            <div>
                                <div class="font-medium"><%# Eval("Name") %></div>
                                <div class="text-sm text-secondary"><%# Eval("Technology") %></div>
                            </div>
                            <span class="status-badge <%# GetStatusClass(Eval("Status").ToString()) %>">
                                <%# Eval("Status") %>
                            </span>
                        </div>
                    </ItemTemplate>
                </asp:Repeater>
                <asp:Panel ID="pnlNoProjects" runat="server" Visible="false" CssClass="text-center py-4 text-secondary">
                    No projects yet. <a href="<%= ResolveUrl("~/admin/projects.aspx") %>">Add your first project</a>
                </asp:Panel>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Recent Messages</h3>
                <a href="<%= ResolveUrl("~/admin/messages.aspx") %>" class="btn btn-sm btn-outline">
                    <i class="ri-eye-line"></i>
                    View All
                </a>
            </div>
            <div class="space-y-3">
                <asp:Repeater ID="rptRecentMessages" runat="server">
                    <ItemTemplate>
                        <div class="py-2 border-b border-color-border">
                            <div class="flex justify-between align-center">
                                <div class="font-medium"><%# Eval("Name") %></div>
                                <div class="text-sm text-secondary"><%# Eval("CreatedAt", "{0:MMM dd}") %></div>
                            </div>
                            <div class="text-sm text-secondary"><%# Eval("Subject") %></div>
                        </div>
                    </ItemTemplate>
                </asp:Repeater>
                <asp:Panel ID="pnlNoMessages" runat="server" Visible="false" CssClass="text-center py-4 text-secondary">
                    No messages yet.
                </asp:Panel>
            </div>
        </div>
    </div>

    <!-- Quick Actions -->
    <div class="card mt-6">
        <div class="card-header">
            <h3 class="card-title">Quick Actions</h3>
        </div>
        <div class="grid grid-3 gap-4">
            <a href="<%= ResolveUrl("~/admin/projects.aspx") %>" class="btn btn-outline">
                <i class="ri-folder-add-line"></i>
                Add New Project
            </a>
            <a href="<%= ResolveUrl("~/admin/skills.aspx") %>" class="btn btn-outline">
                <i class="ri-code-box-line"></i>
                Manage Skills
            </a>
            <a href="<%= ResolveUrl("~/admin/profile.aspx") %>" class="btn btn-outline">
                <i class="ri-user-settings-line"></i>
                Update Profile
            </a>
        </div>
    </div>
</asp:Content>
