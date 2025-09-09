<%@ Page Language="C#" MasterPageFile="~/Admin.Master" AutoEventWireup="true" CodeBehind="profile.aspx.cs" Inherits="_71.Admin.Profile" %>

<asp:Content ID="TitleContent" ContentPlaceHolderID="TitleContent" runat="server">Profile Management</asp:Content>

<asp:Content ID="HeaderContent" ContentPlaceHolderID="HeaderContent" runat="server">
    <div>
        <h1 class="text-2xl font-bold">Profile Management</h1>
        <p class="text-sm text-secondary">Manage my personal information and social links</p>
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
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        .typewriter-list {
            margin-top: 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        .typewriter-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: var(--surface);
            padding: 0.75rem;
            border-radius: 6px;
            border: 1px solid var(--border);
        }
        .remove-item {
            color: var(--color-text-secondary);
            text-decoration: none;
            font-size: 1.2rem;
            line-height: 1;
            padding: 0 4px;
        }
        .remove-item:hover {
            background: rgba(220, 53, 69, 0.1);
            color: #dc3545;
            border-radius: 50%;
        }
    </style>
</asp:Content>

<asp:Content ID="MainContent" ContentPlaceHolderID="MainContent" runat="server">
    <div class="card">
        <h2>Personal Information</h2>
        
        <div class="form-group">
            <label for="<%= txtName.ClientID %>">Full Name</label>
            <asp:TextBox ID="txtName" runat="server" CssClass="form-control" placeholder="Enter your full name"></asp:TextBox>
        </div>

        <div class="form-group">
            <label for="<%= txtTitle.ClientID %>">Professional Title</label>
            <asp:TextBox ID="txtTitle" runat="server" CssClass="form-control" placeholder="e.g., Full-Stack Developer"></asp:TextBox>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="<%= txtEmail.ClientID %>">Email</label>
                <asp:TextBox ID="txtEmail" runat="server" type="email" CssClass="form-control" placeholder="your@email.com"></asp:TextBox>
            </div>
            <div class="form-group">
                <label for="<%= txtLocation.ClientID %>">Location</label>
                <asp:TextBox ID="txtLocation" runat="server" CssClass="form-control" placeholder="City, Country"></asp:TextBox>
            </div>
        </div>

        <div class="form-group">
            <label for="<%= txtBio.ClientID %>">Bio</label>
            <asp:TextBox ID="txtBio" runat="server" TextMode="MultiLine" CssClass="form-control" placeholder="Brief description about yourself" Rows="3"></asp:TextBox>
        </div>

        <div class="form-group">
            <label for="<%= txtAboutDescription.ClientID %>">About Description</label>
            <asp:TextBox ID="txtAboutDescription" runat="server" TextMode="MultiLine" CssClass="form-control" placeholder="Detailed description for about section" Rows="4"></asp:TextBox>
        </div>
    </div>

    <div class="card">
        <h2>Social Links</h2>
        
        <div class="form-row">
            <div class="form-group">
                <label for="<%= txtGithub.ClientID %>">GitHub URL</label>
                <asp:TextBox ID="txtGithub" runat="server" CssClass="form-control" placeholder="https://github.com/username"></asp:TextBox>
            </div>
            <div class="form-group">
                <label for="<%= txtLinkedin.ClientID %>">LinkedIn URL</label>
                <asp:TextBox ID="txtLinkedin" runat="server" CssClass="form-control" placeholder="https://linkedin.com/in/username"></asp:TextBox>
            </div>
        </div>
    </div>

    <div class="card">
        <h2>Typewriter Texts</h2>
        <p style="color: var(--color-text-secondary); margin-bottom: 1rem;">These texts will be displayed in the typewriter animation on my homepage.</p>
        
        <div class="form-group">
            <label for="<%= txtNewTypewriterText.ClientID %>">Add New Text</label>
            <div style="display: flex; gap: 0.5rem;">
                <asp:TextBox ID="txtNewTypewriterText" runat="server" CssClass="form-control" placeholder="Enter text for typewriter animation" style="flex: 1;"></asp:TextBox>
                <asp:Button ID="btnAddTypewriterText" runat="server" Text="Add" CssClass="btn" OnClick="btnAddTypewriterText_Click" />
            </div>
        </div>

        <div class="typewriter-list">
            <asp:Repeater ID="rptTypewriterTexts" runat="server" OnItemCommand="rptTypewriterTexts_ItemCommand">
                <ItemTemplate>
                    <div class="typewriter-item">
                        <span><%# Container.DataItem %></span>
                        <asp:LinkButton ID="lnkRemove" runat="server" CssClass="remove-item" CommandName="Remove" CommandArgument='<%# Container.ItemIndex %>' Text="×" ToolTip="Remove text" />
                    </div>
                </ItemTemplate>
            </asp:Repeater>
        </div>
    </div>

    <div class="card">
        <asp:Button ID="btnSave" runat="server" Text="Save Changes" CssClass="btn" OnClick="btnSave_Click" />
    </div>
</asp:Content>
