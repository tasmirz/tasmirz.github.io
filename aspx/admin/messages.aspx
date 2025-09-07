<%@ Page Language="C#" MasterPageFile="~/admin/Admin.Master" AutoEventWireup="true" CodeBehind="messages.aspx.cs" Inherits="_71.Admin.Messages" %>

<asp:Content ID="TitleContent" ContentPlaceHolderID="TitleContent" runat="server">
    Messages
</asp:Content>

<asp:Content ID="HeaderContent" ContentPlaceHolderID="HeaderContent" runat="server">
    <div>
        <h1 class="text-2xl font-bold">Messages</h1>
        <p class="text-sm text-secondary">Messages sent via the portfolio contact form</p>
    </div>
</asp:Content>

<asp:Content ID="MainContent" ContentPlaceHolderID="MainContent" runat="server">
    <div class="card">
        <asp:GridView ID="gvMessages" runat="server" CssClass="table" AutoGenerateColumns="false" 
            EmptyDataText="No messages received yet.">
            <Columns>
                <asp:BoundField DataField="Id" HeaderText="#" ItemStyle-Width="50px" />
                <asp:BoundField DataField="Name" HeaderText="Name" ItemStyle-Width="150px" />
                <asp:BoundField DataField="Email" HeaderText="Email" ItemStyle-Width="200px" />
                <asp:BoundField DataField="Subject" HeaderText="Subject" ItemStyle-Width="200px" />
                <asp:BoundField DataField="Content" HeaderText="Message" HtmlEncode="false" />
                <asp:BoundField DataField="CreatedAt" HeaderText="Received" DataFormatString="{0:yyyy-MM-dd HH:mm}" ItemStyle-Width="150px" />
            </Columns>
        </asp:GridView>
    </div>
</asp:Content>

<asp:Content ID="ScriptContent" ContentPlaceHolderID="ScriptContent" runat="server">
    <style>
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
        }
        .table th,
        .table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid var(--color-border);
            vertical-align: top;
        }
        .table th {
            background: var(--color-bg-secondary);
            font-weight: 600;
            color: var(--color-text);
        }
        .table tr:hover {
            background: var(--color-bg-secondary);
        }
        .table td {
            color: var(--color-text);
        }
        .table td:nth-child(5) {
            max-width: 300px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    </style>
</asp:Content>
