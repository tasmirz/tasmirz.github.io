<%@ Page Language="C#" MasterPageFile="~/admin/Admin.Master" AutoEventWireup="true" CodeBehind="skills.aspx.cs" Inherits="_71.Admin.Skills" %>

<asp:Content ID="TitleContent" ContentPlaceHolderID="TitleContent" runat="server">Skills</asp:Content>

<asp:Content ID="HeaderContent" ContentPlaceHolderID="HeaderContent" runat="server">
    <div>
        <h1 class="text-2xl font-bold">Skills Management</h1>
        <p class="text-sm text-secondary">Organize your skill categories and skills</p>
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
            <h2 style="margin-bottom: 0;">Skill Categories</h2>
            <div>
                <button type="button" onclick="toggleAddForm()" class="btn">Add Category</button>
            </div>
        </div>

        <div id="addCategoryForm" class="add-category-form">
            <h3 style="margin-bottom: 1rem;">Add New Category</h3>
            
            <div class="form-group">
                <label for="txtNewCategoryName">Category Name</label>
                <asp:TextBox ID="txtNewCategoryName" runat="server" CssClass="form-control" placeholder="Enter category name (e.g., Programming, Technology)"></asp:TextBox>
            </div>

            <div>
                <asp:Button ID="btnAddCategory" runat="server" Text="Add Category" CssClass="btn" OnClick="btnAddCategory_Click" />
                <button type="button" onclick="toggleAddForm()" class="btn btn-secondary">Cancel</button>
            </div>
        </div>

        <div class="skills-grid">
            <asp:Repeater ID="rptCategories" runat="server" OnItemCommand="rptCategories_ItemCommand">
                <ItemTemplate>
                    <div class="category-card">
                        <div class="category-header">
                            <div class="category-title"><%# Eval("Name") %></div>
                            <div class="category-actions">
                                <asp:LinkButton ID="lnkDeleteCategory" runat="server" CssClass="btn-small btn-delete" 
                                    CommandName="DeleteCategory" CommandArgument='<%# Eval("Id") %>' Text="Delete" />
                            </div>
                        </div>
                        
                        <div class="skills-list">
                            <asp:Repeater ID="rptSkills" runat="server" DataSource='<%# Eval("Skills") %>' OnItemCommand="rptSkills_ItemCommand">
                                <ItemTemplate>
                                    <div class="skill-tag">
                                        <%# Eval("Name") %>
                                        <asp:LinkButton ID="lnkRemoveSkill" runat="server" CssClass="remove-skill" 
                                            CommandName="RemoveSkill" CommandArgument='<%# Eval("Id") %>' Text="×" />
                                    </div>
                                </ItemTemplate>
                            </asp:Repeater>
                        </div>

                        <div class="add-skill-form">
                            <asp:TextBox ID="txtNewSkill" runat="server" CssClass="form-control"  placeholder="Add new skill..." />
                            <asp:Button ID="btnAddSkill" runat="server" Text="Add" CssClass="btn-small btn-edit btn" 
                                CommandName="AddSkill" CommandArgument='<%# Eval("Id") %>' OnCommand="btnAddSkill_Command" />
                        </div>
                    </div>
                </ItemTemplate>
            </asp:Repeater>
        </div>
    </div>
</asp:Content>
