<%@ Page Language="C#" MasterPageFile="~/admin/Admin.Master" AutoEventWireup="true" CodeBehind="profile.aspx.cs" Inherits="_71.Admin.Profile" %>

<asp:Content ID="TitleContent" ContentPlaceHolderID="TitleContent" runat="server">Profile</asp:Content>

<asp:Content ID="HeaderContent" ContentPlaceHolderID="HeaderContent" runat="server">
    <div>
        <h1 class="text-2xl font-bold">Profile Management</h1>
        <p class="text-sm text-secondary">Update your personal information</p>
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
        <h2>Personal Information</h2>

        <div class="form-group">
            <label for="txtName">Full Name</label>
            <asp:TextBox ID="txtName" runat="server" CssClass="form-control" placeholder="Enter your full name"></asp:TextBox>
        </div>

        <div class="form-group">
            <label for="txtTitle">Professional Title</label>
            <asp:TextBox ID="txtTitle" runat="server" CssClass="form-control" placeholder="e.g., Full-Stack Developer"></asp:TextBox>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="txtEmail">Email</label>
                <asp:TextBox ID="txtEmail" runat="server" type="email" CssClass="form-control" placeholder="your@email.com"></asp:TextBox>
            </div>
            <div class="form-group">
                <label for="txtLocation">Location</label>
                <asp:TextBox ID="txtLocation" runat="server" CssClass="form-control" placeholder="City, Country"></asp:TextBox>
            </div>
        </div>

        <div class="form-group">
            <label for="txtBio">Bio</label>
            <asp:TextBox ID="txtBio" runat="server" TextMode="MultiLine" CssClass="form-control textarea" placeholder="Brief description about yourself"></asp:TextBox>
        </div>

        <div class="form-group">
            <label for="txtAboutDescription">About Description</label>
            <asp:TextBox ID="txtAboutDescription" runat="server" TextMode="MultiLine" CssClass="form-control textarea" placeholder="Detailed description for about section"></asp:TextBox>
        </div>
    </div>

    <div class="card">
        <h2>Social Links</h2>
        <div class="form-row">
            <div class="form-group">
                <label for="txtGithub">GitHub URL</label>
                <asp:TextBox ID="txtGithub" runat="server" CssClass="form-control" placeholder="https://github.com/username"></asp:TextBox>
            </div>
            <div class="form-group">
                <label for="txtLinkedin">LinkedIn URL</label>
                <asp:TextBox ID="txtLinkedin" runat="server" CssClass="form-control" placeholder="https://linkedin.com/in/username"></asp:TextBox>
            </div>
        </div>
    </div>

    <div class="card">
        <h2>Typewriter Texts</h2>
        <p style="color: #666; margin-bottom: 1rem;">These texts will be displayed in the typewriter animation on your homepage.</p>

        <div class="form-group">
            <label for="txtNewTypewriterText">Add New Text</label>
            <div style="display: flex; gap: 0.5rem;">
                <asp:TextBox ID="txtNewTypewriterText" runat="server" CssClass="form-control" placeholder="Enter text for typewriter animation" style="flex: 1;"></asp:TextBox>
                <asp:Button ID="btnAddTypewriterText" runat="server" Text="Add" CssClass="btn" OnClick="btnAddTypewriterText_Click" />
            </div>
        </div>

        <div class="typewriter-list">
            <asp:Repeater ID="rptTypewriterTexts" runat="server" OnItemCommand="rptTypewriterTexts_ItemCommand">
                <ItemTemplate>
                    <div class="typewriter-item">
                        <%# Container.DataItem %>
                        <asp:LinkButton ID="lnkRemove" runat="server" CssClass="remove-item" CommandName="Remove" CommandArgument='<%# Container.ItemIndex %>' Text="×" />
                    </div>
                </ItemTemplate>
            </asp:Repeater>
        </div>
    </div>

    <div class="card">
        <asp:Button ID="btnSave" runat="server" Text="Save Changes" CssClass="btn" OnClick="btnSave_Click" />
    </div>
</asp:Content>
