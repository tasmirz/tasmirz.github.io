using System;
using System.Web.UI;
using _71.DAL;
using _71.Utils;

namespace _71.Admin
{
    public partial class Messages : Page
    {
        private readonly MessagesRepository _messagesRepository = new MessagesRepository();

        protected void Page_Load(object sender, EventArgs e)
        {
            // Authentication is handled by the master page
            if (!IsPostBack)
            {
                LoadMessages();
            }
        }

        private void LoadMessages()
        {
            try
            {
                var messages = _messagesRepository.ListAll();
                gvMessages.DataSource = messages;
                gvMessages.DataBind();
            }
            catch (Exception ex)
            {
                Logger.LogError("Failed to load messages", ex);
                ((AdminMaster)this.Master)?.ShowMessage("Error loading messages: " + ex.Message, "error");
            }
        }

        protected void gvMessages_RowCommand(object sender, System.Web.UI.WebControls.GridViewCommandEventArgs e)
        {
            if (e.CommandName == "DeleteMessage")
            {
                try
                {
                    int messageId = Convert.ToInt32(e.CommandArgument);
                    bool success = _messagesRepository.Delete(messageId);

                    if (success)
                    {
                        ShowMessage("Message deleted successfully!", "success");
                        LoadMessages(); // Refresh the grid
                    }
                    else
                    {
                        ShowMessage("Failed to delete message.", "error");
                    }
                }
                catch (Exception ex)
                {
                    Logger.LogError("Failed to delete message", ex);
                    ShowMessage("Error deleting message: " + ex.Message, "error");
                }
            }
        }

        private void ShowMessage(string message, string type)
        {
            // Get the master page and call its ShowMessage method
            var master = this.Master as AdminMaster;
            master?.ShowMessage(message, type);
        }
    }
}
