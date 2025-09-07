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
        context.Response.ContentType = "application/json";
        var repo = new MessagesRepository();

        if (context.Request.HttpMethod == "POST")
        {
            var body = new System.IO.StreamReader(context.Request.InputStream).ReadToEnd();
            var js = new JavaScriptSerializer();
            try
            {
                var data = js.Deserialize<MessageModel>(body);
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
