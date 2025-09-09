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
            string resolvedUsername = "Me";

            Logger.LogInfo("Login attempt (password-only)");

            if (ValidateAdmin(password, out resolvedUsername))
            {
                CreateUserSession(resolvedUsername);
                HandleRememberMe(resolvedUsername);
                Logger.LogActivity("Login", resolvedUsername, "Successful login");
                Response.Redirect("~/dashboard.aspx");
            }
            else
            {
                ShowLoginError();
                Logger.LogActivity("Login Failed", resolvedUsername, "Invalid password");
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

            // Check default admin password first
            if (password == Constants.DEFAULT_ADMIN_PASSWORD)
            {
                username = Constants.DEFAULT_ADMIN_USERNAME;
                return true;
            }

            try
            {
                using (var connection = DatabaseHelper.GetConnection())
                {
                    connection.Open();

                    // Find the primary active admin (or first active) and verify the password hash
                    const string query = @"SELECT TOP 1 Username, PasswordHash FROM AdminUsers WHERE IsActive = 1 ORDER BY IsPrimary DESC, Id ASC";
                    using (var command = new SqlCommand(query, connection))
                    using (var reader = command.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            var dbUsername = reader["Username"] as string;
                            var storedHash = reader["PasswordHash"] as string;

                            if (!string.IsNullOrEmpty(storedHash) && BCrypt.Net.BCrypt.Verify(password, storedHash))
                            {
                                username = !string.IsNullOrEmpty(dbUsername) ? dbUsername : Constants.DEFAULT_ADMIN_USERNAME;
                                return true;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Logger.LogError("Database validation error", ex);
            }

            return false;
        }
    }
}
