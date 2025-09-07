<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="login.aspx.cs" Inherits="_71.Admin.Login" %>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta charset="utf-8" />
    <title>Portfolio Admin - Login</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="<%= ResolveUrl("~/css/gruvbox.css") %>" />
    <style>
        /* Page-specific styling for login */
        body { 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            min-height: 100vh; 
            margin: 0;
        }
        .login-container {
            max-width: 420px;
            width: 100%;
            padding: 2rem;
        }
        .login-header h1 {
            margin: 0 0 0.5rem;
            color: var(--color-primary);
            font-size: 1.75rem;
        }
        .login-header p {
            color: var(--color-text-secondary);
            margin: 0 0 2rem;
        }
        .form-group {
            margin-bottom: 1rem;
        }
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            color: var(--color-text);
            font-weight: 500;
        }
        .checkbox-group {
            margin: 1rem 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .btn {
            width: 100%;
            margin-top: 1rem;
        }
        .btn:hover {
            background: var(--color-button-hover);
        }
    </style>
</head>
<body>
    <form id="form1" runat="server">
        <div class="login-container">
            <div class="login-header">
                <h1>Portfolio Admin</h1>
                <p>Sign in to manage your portfolio</p>
            </div>

            <asp:Panel ID="pnlMessage" runat="server" Visible="false" CssClass="message">
                <asp:Label ID="lblMessage" runat="server"></asp:Label>
            </asp:Panel>

            <div class="form-group">
                <label for="txtUsername">Username</label>
                <asp:TextBox ID="txtUsername" runat="server" CssClass="form-control" placeholder="Enter username"></asp:TextBox>
            </div>

            <div class="form-group">
                <label for="txtPassword">Password</label>
                <asp:TextBox ID="txtPassword" runat="server" TextMode="Password" CssClass="form-control" placeholder="Enter password"></asp:TextBox>
            </div>

            <div class="checkbox-group">
                <asp:CheckBox ID="chkRememberMe" runat="server" />
                <label for="chkRememberMe">Remember me</label>
            </div>

            <asp:Button ID="btnLogin" runat="server" Text="Sign In" CssClass="btn" OnClick="btnLogin_Click" />

            <asp:Panel ID="pnlError" runat="server" Visible="false" CssClass="error-message">
                <asp:Label ID="lblError" runat="server"></asp:Label>
            </asp:Panel>
        </div>
    </form>
</body>
</html>
