<%@ Page Language="C#" MasterPageFile="~/Admin.Master" AutoEventWireup="true" CodeBehind="dashboard.aspx.cs" Inherits="_71.Admin.Dashboard" %>

<asp:Content ID="TitleContent" ContentPlaceHolderID="TitleContent" runat="server">
    Dashboard
</asp:Content>

<asp:Content ID="HeaderContent" ContentPlaceHolderID="HeaderContent" runat="server">
    <div>
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <p class="text-sm text-secondary">Overview of my portfolio</p>
    </div>

</asp:Content>

<asp:Content ID="MainContent" ContentPlaceHolderID="MainContent" runat="server">
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
                    <i class="material-icons text-xl">folder_open</i>
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
                    <i class="material-icons text-xl">code</i>
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
                    <i class="material-icons text-xl">archive</i>
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
                    <i class="material-icons text-xl">mail</i>
                </div>
            </div>
        </div>
    </div>

    <div class="grid grid-1 gap-6">

        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Recent Messages</h3>
                <a href="<%= ResolveUrl("~/messages.aspx") %>" class="btn btn-sm btn-outline">
                    <i class="material-icons">visibility</i>
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


</asp:Content>
