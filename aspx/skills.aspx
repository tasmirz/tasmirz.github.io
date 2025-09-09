<%@ Page Language="C#" MasterPageFile="~/Admin.Master" AutoEventWireup="true" CodeBehind="skills.aspx.cs" Inherits="_71.Admin.Skills" %>

<asp:Content ID="TitleContent" ContentPlaceHolderID="TitleContent" runat="server">Skills Management</asp:Content>

<asp:Content ID="HeaderContent" ContentPlaceHolderID="HeaderContent" runat="server">
    <div>
        <h1 class="text-2xl font-bold">Skills Management</h1>
        <p class="text-sm text-secondary">Organize my skill categories and skills</p>
    </div>
    <div class="flex align-center gap-4">
        <a href="<%= ResolveUrl("~/dashboard.aspx") %>" class="btn btn-outline">
            <i class="material-icons">arrow_back</i>
            Back to Dashboard
        </a>
    </div>
</asp:Content>

<asp:Content ID="MainContent" ContentPlaceHolderID="MainContent" runat="server">
    <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h2 style="margin-bottom: 0;">Skill Categories</h2>
            <div>
                <button type="button" onclick="toggleAddForm()" class="btn">
                    <i class="material-icons">add</i>
                    Add Category
                </button>
            </div>
        </div>

        <div id="addCategoryForm" class="add-category-form">
            <h3 style="margin-bottom: 1rem;">Add New Category</h3>
            
            <div class="form-group">
                <label for="<%= txtNewCategoryName.ClientID %>">Category Name</label>
                <asp:TextBox ID="txtNewCategoryName" runat="server" CssClass="form-control" placeholder="Enter category name (e.g., Programming Languages, Frameworks)"></asp:TextBox>
            </div>

            <div style="display: flex; gap: 0.75rem;">
                <asp:Button ID="btnAddCategory" runat="server" Text="Add Category" CssClass="btn" OnClick="btnAddCategory_Click" />
                <button type="button" onclick="toggleAddForm()" class="btn btn-secondary">Cancel</button>
            </div>
        </div>

        <div class="skills-grid">
            <asp:Repeater ID="rptCategories" runat="server" OnItemCommand="rptCategories_ItemCommand">
                <ItemTemplate>
                    <div class="category-card">
                        <div class="category-header">
                            <h3 class="category-title"><%# Eval("Name") %></h3>
                            <div class="category-actions">
                                <asp:LinkButton ID="lnkDeleteCategory" runat="server" CssClass="btn-small btn-delete" 
                                    CommandName="DeleteCategory" CommandArgument='<%# Eval("Id") %>' 
                                    OnClientClick="return confirm('Are you sure you want to delete this category and all its skills?');"
                                    ToolTip="Delete Category">
                                    <i class="material-icons" style="font-size: 16px;">delete</i>
                                </asp:LinkButton>
                            </div>
                        </div>
                        
                        <div class="skills-list">
                            <asp:Repeater ID="rptSkills" runat="server" DataSource='<%# Eval("Skills") %>' OnItemCommand="rptSkills_ItemCommand">
                                <ItemTemplate>
                                    <div class="skill-tag">
                                        <span><%# Eval("Name") %></span>
                                        <asp:LinkButton ID="lnkRemoveSkill" runat="server" CssClass="remove-skill" 
                                            CommandName="RemoveSkill" CommandArgument='<%# Eval("Id") %>' 
                                            OnClientClick="return confirm('Are you sure you want to remove this skill?');"
                                            ToolTip="Remove Skill">×</asp:LinkButton>
                                    </div>
                                </ItemTemplate>
                            </asp:Repeater>
                        </div>

                        <div class="add-skill-form">
                            <asp:TextBox ID="txtNewSkill" runat="server" CssClass="form-control" placeholder="Add new skill..." />
                            <asp:Button ID="btnAddSkill" runat="server" Text="Add" CssClass="btn-small btn-edit" 
                                CommandName="AddSkill" CommandArgument='<%# Eval("Id") %>' OnCommand="btnAddSkill_Command" />
                        </div>
                    </div>
                </ItemTemplate>
            </asp:Repeater>
        </div>

        <div id="emptyState" runat="server" visible="false" style="text-align: center; padding: 3rem 1rem; color: var(--color-text-secondary);">
            <i class="material-icons" style="font-size: 64px; margin-bottom: 1rem; opacity: 0.5;">code</i>
            <h3 style="margin-bottom: 0.5rem;">No skill categories yet</h3>
            <p>Create my first skill category to get started organizing my skills.</p>
        </div>
    </div>

    <script type="text/javascript">
        function toggleAddForm() {
            const form = document.getElementById('addCategoryForm');
            const isVisible = form.style.display === 'block';
            form.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible) {
                // Focus on the input when showing the form
                const input = form.querySelector('input[type="text"]');
                if (input) {
                    setTimeout(() => input.focus(), 100);
                }
            }
        }

        // Handle Enter key in skill input fields
        document.addEventListener('DOMContentLoaded', function() {
            const skillInputs = document.querySelectorAll('.add-skill-form input[type="text"]');
            skillInputs.forEach(input => {
                input.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        const button = this.parentNode.querySelector('input[type="submit"]');
                        if (button && this.value.trim()) {
                            button.click();
                        }
                    }
                });
            });

            // Handle Enter key in category input field
            const categoryInput = document.getElementById('<%= txtNewCategoryName.ClientID %>');
            if (categoryInput) {
                categoryInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        const button = document.getElementById('<%= btnAddCategory.ClientID %>');
                        if (button && this.value.trim()) {
                            button.click();
                        }
                    }
                });
            }
        });
    </script>
</asp:Content>