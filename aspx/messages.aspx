<%@ Page Language="C#" MasterPageFile="~/Admin.Master" AutoEventWireup="true" CodeBehind="messages.aspx.cs" Inherits="_71.Admin.Messages" %>

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
            EmptyDataText="No messages received yet." OnRowCommand="gvMessages_RowCommand">
            <Columns>
                <asp:BoundField DataField="Id" HeaderText="#" ItemStyle-Width="50px" />
                <asp:BoundField DataField="Name" HeaderText="Name" ItemStyle-Width="150px" />
                <asp:BoundField DataField="Email" HeaderText="Email" ItemStyle-Width="200px" />
                <asp:BoundField DataField="Subject" HeaderText="Subject" ItemStyle-Width="200px" />
                <asp:BoundField DataField="Content" HeaderText="Message" HtmlEncode="false" />
                <asp:BoundField DataField="CreatedAt" HeaderText="Received" DataFormatString="{0:yyyy-MM-dd HH:mm}" ItemStyle-Width="150px" />
                <asp:TemplateField HeaderText="Actions" ItemStyle-Width="80px">
                    <ItemTemplate>
                        <asp:LinkButton ID="lnkDelete" runat="server" 
                            CommandName="DeleteMessage" 
                            CommandArgument='<%# Eval("Id") %>' 
                            CssClass="btn-delete" 
                            OnClientClick="return confirm('Are you sure you want to delete this message?');">
                            <i class="material-icons">delete</i>
                        </asp:LinkButton>
                    </ItemTemplate>
                </asp:TemplateField>
            </Columns>
        </asp:GridView>
    </div>
</asp:Content>

<asp:Content ID="ScriptContent" ContentPlaceHolderID="ScriptContent" runat="server">
    <style>
        .card {
            background: var(--color-bg);
            border: 1px solid var(--color-border);
            border-radius: 8px;
            overflow: hidden;
            box-shadow: var(--shadow-sm);
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 0;
        }
        
        .table th,
        .table td {
            padding: 1rem 0.75rem;
            text-align: left;
            border-bottom: 1px solid var(--color-border);
            vertical-align: top;
        }
        
        .table th {
            background: var(--color-bg-secondary);
            font-weight: 600;
            color: var(--color-text);
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .table tr:hover {
            background: var(--color-bg-secondary);
        }
        
        .table td {
            color: var(--color-text);
            font-size: 0.9rem;
        }
        
        .table td:nth-child(5) {
            max-width: 300px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        .btn-delete {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 6px;
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
            text-decoration: none;
            transition: all 0.2s ease;
        }
        
        .btn-delete:hover {
            background: #ef4444;
            color: white;
            transform: scale(1.05);
        }
        
        .btn-delete .material-icons {
            font-size: 18px;
        }
        
        .table tbody tr:last-child td {
            border-bottom: none;
        }
        
        .table td:first-child {
            font-weight: 600;
            color: var(--color-primary);
        }
        
        .table td:nth-child(6) {
            color: var(--color-text-secondary);
            font-size: 0.85rem;
        }
    </style>
</asp:Content>
