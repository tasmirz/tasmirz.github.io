<%@ WebHandler Language="C#" Class="Api_Messages" %>
using System;
using System.Web;
using System.Web.Script.Serialization;
using _71.DAL;
using _71.Models;

public class Api_Messages : IHttpHandler
{
    public void ProcessRequest(HttpContext context)
    {
        // Allow CORS for local dev and API usage from the same origin
        context.Response.AddHeader("Access-Control-Allow-Origin", "*");
        context.Response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        context.Response.AddHeader("Access-Control-Allow-Headers", "Content-Type");
        context.Response.ContentType = "application/json";

        var repo = new MessagesRepository();

        // Handle CORS preflight
        if (context.Request.HttpMethod == "OPTIONS")
        {
            context.Response.StatusCode = 204; // No Content
            context.Response.End();
            return;
        }

        if (context.Request.HttpMethod == "POST")
        {
            var js = new JavaScriptSerializer();
            try
            {
                MessageModel data = null;

                // If form-encoded (from a normal <form> POST), read from Request.Form
                var contentType = context.Request.ContentType ?? string.Empty;
                if (contentType.IndexOf("application/x-www-form-urlencoded", StringComparison.OrdinalIgnoreCase) >= 0 ||
                    contentType.IndexOf("multipart/form-data", StringComparison.OrdinalIgnoreCase) >= 0)
                {
                    data = new MessageModel
                    {
                        Name = context.Request.Form["Name"] ?? context.Request.Form["name"],
                        Email = context.Request.Form["Email"] ?? context.Request.Form["email"],
                        Subject = context.Request.Form["Subject"] ?? context.Request.Form["subject"],
                        Content = context.Request.Form["Content"] ?? context.Request.Form["message"]
                    };
                }
                else
                {
                    var body = new System.IO.StreamReader(context.Request.InputStream).ReadToEnd();
                    data = js.Deserialize<MessageModel>(body);
                }

                if (data == null)
                    throw new ArgumentException("Invalid message payload");

                data.CreatedAt = DateTime.Now;
                var id = repo.Create(data);
                context.Response.StatusCode = 201;
                context.Response.Write(js.Serialize(new { success = true, id = id }));
            }
            catch (Exception ex)
            {
                context.Response.StatusCode = 400;
                context.Response.Write(js.Serialize(new { success = false, error = ex.Message }));
            }
            return;
        }

        // Default: GET => list messages
        var list = repo.ListAll();
        var serializer = new JavaScriptSerializer();
        context.Response.Write(serializer.Serialize(list));
    }

    public bool IsReusable { get { return false; } }
}
