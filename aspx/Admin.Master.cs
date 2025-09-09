using System;
using System.Web.UI;
using _71.Utils;

namespace _71.Admin
{
    public partial class AdminMaster : System.Web.UI.MasterPage
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            // Check if user is authenticated
            if (!IsUserAuthenticated())
            {
                Response.Redirect("~/login.aspx");
                return;
            }
        }

        protected virtual bool IsUserAuthenticated()
        {
            return Session[Constants.SESSION_IS_ADMIN] != null &&
                   (bool)Session[Constants.SESSION_IS_ADMIN];
        }

        // Public helper so pages and other code can ask the master if the current user is an admin.
        public bool IsAdminAuthenticated()
        {
            return IsUserAuthenticated();
        }

        protected void lnkLogout_Click(object sender, EventArgs e)
        {
            string username = Session[Constants.SESSION_ADMIN_USER]?.ToString();

            // Clear session
            Session.Clear();
            Session.Abandon();

            // Clear remember me cookie
            ClearRememberMeCookie();

            // Log activity (use static Logger since we're clearing session)
            if (!string.IsNullOrEmpty(username))
            {
                Logger.LogActivity("Logout", username, "User logged out from admin");
            }

            Response.Redirect("~/login.aspx");
        }

        private void ClearRememberMeCookie()
        {
            if (Request.Cookies[Constants.COOKIE_ADMIN_REMEMBER] != null)
            {
                var cookie = new System.Web.HttpCookie(Constants.COOKIE_ADMIN_REMEMBER)
                {
                    Expires = DateTime.Now.AddDays(-1)
                };
                Response.Cookies.Add(cookie);
            }
        }

        // Helper method for pages to show messages
        public void ShowMessage(string message, string type)
        {
            var pnl = this.FindControl("pnlMessage") as System.Web.UI.WebControls.Panel;
            var lbl = this.FindControl("lblMessage") as System.Web.UI.WebControls.Label;

            if (pnl != null && lbl != null)
            {
                lbl.Text = message;
                pnl.CssClass = $"message {type}";
                pnl.Visible = true;
            }
        }
    }
}
