using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using _71.Utils;

namespace _71
{
    // Minimal base page for admin pages. Provides a ShowMessage helper and
    // small authentication helper used throughout the admin pages.
    public class AdminBasePage : Page
    {
        protected bool IsAdminAuthenticated()
        {
            try
            {
                var master = this.Master as _71.Admin.AdminMaster;
                if (master != null) return master.IsAdminAuthenticated();
                return Session != null && Session[Constants.SESSION_IS_ADMIN] != null && (bool)Session[Constants.SESSION_IS_ADMIN];
            }
            catch { return false; }
        }

        // Delegate showing messages to the master page. This keeps the behavior centralized on the master page
        // while maintaining the AdminBasePage API used by many pages.
        public virtual void ShowMessage(string message, string type)
        {
            try
            {
                var master = this.Master as _71.Admin.AdminMaster;
                if (master != null)
                {
                    master.ShowMessage(message, type);
                    return;
                }

                // Fallback: try to find pnlMessage and lblMessage on the page
                var pnl = this.FindControl("pnlMessage") as Panel;
                var lbl = this.FindControl("lblMessage") as Label;
                if (pnl != null && lbl != null)
                {
                    lbl.Text = message;
                    pnl.CssClass = $"message {type}";
                    pnl.Visible = true;
                }
            }
            catch
            {
                // non-critical
            }
        }
    }
}
