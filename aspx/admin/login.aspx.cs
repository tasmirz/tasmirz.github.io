using System;
using System.Data.SqlClient;
using System.Web;
using System.Web.UI;
using BCrypt.Net;
using _71.Utils;
using _71.DAL;

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
                Response.Redirect("~/admin/dashboard.aspx");
            }
        }

        protected void btnLogin_Click(object sender, EventArgs e)
        {
            string username = txtUsername?.Text?.Trim() ?? string.Empty;
            string password = txtPassword?.Text ?? string.Empty;

            Logger.LogInfo($"Login attempt for user: {username}");

            if (ValidateAdmin(username, password))
            {
                CreateUserSession(username);
                HandleRememberMe(username);
                Logger.LogActivity("Login", username, "Successful login");
                Response.Redirect("~/admin/dashboard.aspx");
            }
            else
            {
                ShowLoginError();
                Logger.LogActivity("Login Failed", username, "Invalid credentials");
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
            ShowMessage("Invalid username or password.", "error");
        }

        private void ShowMessage(string message, string type)
        {
            lblMessage.Text = message;
            pnlMessage.CssClass = $"message {type}";
            pnlMessage.Visible = true;
        }

        private bool ValidateAdmin(string username, string password)
        {
            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
                return false;

            // Check default admin credentials
            if (username == Constants.DEFAULT_ADMIN_USERNAME && password == Constants.DEFAULT_ADMIN_PASSWORD)
            {
                return true;
            }

            try
            {
                using (var connection = DatabaseHelper.GetConnection())
                {
                    connection.Open();

                    const string query = @"SELECT PasswordHash FROM AdminUsers WHERE Username = @username AND IsActive = 1";
                    using (var command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@username", username);
                        var storedHash = command.ExecuteScalar() as string;

                        if (!string.IsNullOrEmpty(storedHash))
                        {
                            return BCrypt.Net.BCrypt.Verify(password, storedHash);
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
