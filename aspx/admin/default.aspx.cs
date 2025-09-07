using System;
using System.Web.UI;

namespace _71.Admin
{
    public partial class Default : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            try
            {
                if (Session["IsAdmin"] != null && (bool)Session["IsAdmin"])
                {
                    Response.Redirect("dashboard.aspx");
                    return;
                }
            }
            catch { }

            Response.Redirect("login.aspx");
        }
    }
}
