<%@ WebHandler Language="C#" Class="Api_Skills" %>
using System;
using System.Web;
using _71.DAL;
using _71.Utils;

public class Api_Skills : IHttpHandler
{
    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "application/json";
        try
        {
            var repo = new SkillsRepository();
            var categories = repo.GetAllSkillCategories();
            JsonHelper.WriteJsonResponse(context.Response, new { categories = categories });
        }
        catch (Exception ex)
        {
            JsonHelper.WriteJsonResponse(context.Response, new { error = ex.Message });
        }
    }

    public bool IsReusable { get { return false; } }
}
