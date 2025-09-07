<%@ WebHandler Language="C#" Class="Api_Projects" %>
using System;
using System.Web;
using _71.DAL;
using _71.Utils;

public class Api_Projects : IHttpHandler
{
    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "application/json";
        try
        {
            var repo = new ProjectRepository();
            var projects = repo.GetAllProjects();
            JsonHelper.WriteJsonResponse(context.Response, new { projects = projects });
        }
        catch (Exception ex)
        {
            JsonHelper.WriteJsonResponse(context.Response, new { error = ex.Message });
        }
    }

    public bool IsReusable { get { return false; } }
}
