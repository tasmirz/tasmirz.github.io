using System;
using System.Web.UI;

namespace _71
{
    public partial class DefaultPage : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            string currentPage = System.IO.Path.GetFileName(Request.Url.AbsolutePath).ToLower();

            bool isAuthenticated = Context.User != null && Context.User.Identity.IsAuthenticated;

            if (!isAuthenticated && currentPage != "login.aspx")
            {
                Response.Redirect("~/login.aspx");
            }
            else if (isAuthenticated && currentPage == "login.aspx")
            {
                Response.Redirect("~/dashboard.aspx");
            }
        }
    }
}
