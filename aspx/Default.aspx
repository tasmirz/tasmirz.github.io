<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="_71.DefaultPage" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Portfolio</title>
    <link rel="stylesheet" href="<%= ResolveUrl("~/css/gruvbox.css") %>" />
</head>
<body>
    <h1>Portfolio</h1>
    <asp:Literal ID="litProfile" runat="server"></asp:Literal>
    <p><a href="admin/dashboard.aspx">Admin</a></p>
</body>
</html>
