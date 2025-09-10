using System;
using System.Data.SqlClient;
using System.Web;
using System.Web.UI;
using BCrypt.Net;
using _71.Utils;
using _71.DAL;
using _71.Admin;

namespace _71.Admin
{
    public partial class Login : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                CheckExistingSession();
                CheckExistingCookie();
            }
        }
        private void CheckExistingCookie()
        {
            // Check for remember me cookie
            HttpCookie rememberCookie = Request.Cookies[Constants.COOKIE_ADMIN_REMEMBER];
            if (rememberCookie != null && !string.IsNullOrEmpty(rememberCookie.Value))
            {
                string username = rememberCookie.Value;
                CreateUserSession(username);
                Response.Redirect("~/dashboard.aspx");
            }
        }
        private void CheckExistingSession()
        {
            // If user is already logged in, redirect to dashboard
            if (Session[Constants.SESSION_IS_ADMIN] != null && (bool)Session[Constants.SESSION_IS_ADMIN])
            {
                Response.Redirect("~/dashboard.aspx");
            }
        }

        protected void btnLogin_Click(object sender, EventArgs e)
        {
            string password = txtPassword?.Text ?? string.Empty;
            string resolvedUsername = "Zihad";


            if (ValidateAdmin(password, out resolvedUsername))
            {
                CreateUserSession(resolvedUsername);
                HandleRememberMe(resolvedUsername);
                Response.Redirect("~/dashboard.aspx");
            }
            else
            {
                ShowLoginError();
            }
        }

        private void CreateUserSession(string username)
        {
            Session[Constants.SESSION_IS_ADMIN] = true;
            Session[Constants.SESSION_ADMIN_USER] = username;
            Session.Timeout = Constants.SESSION_TIMEOUT_MINUTES;
        }

        private void HandleRememberMe(string username)
        {
            if (chkRememberMe != null && chkRememberMe.Checked)
            {
                var rememberCookie = new HttpCookie(Constants.COOKIE_ADMIN_REMEMBER, username)
                {
                    HttpOnly = true,
                    Expires = DateTime.Now.AddDays(Constants.REMEMBER_COOKIE_DAYS),
                    Secure = Request.IsSecureConnection
                };
                Response.Cookies.Add(rememberCookie);
            }
        }

        private void ShowLoginError()
        {
            ((AdminMaster)this.Master)?.ShowMessage("Invalid password.", "error");
        }

        private void ShowMessage(string message, string type)
        {
            ((AdminMaster)this.Master)?.ShowMessage(message, type);
        }

        private bool ValidateAdmin(string password, out string username)
        {
            username = Constants.DEFAULT_ADMIN_USERNAME;

            if (string.IsNullOrEmpty(password))
                return false;

            if (password == Constants.DEFAULT_ADMIN_PASSWORD)
            {
                username = Constants.DEFAULT_ADMIN_USERNAME;
                return true;
            }


            return false;
        }
    }
}
