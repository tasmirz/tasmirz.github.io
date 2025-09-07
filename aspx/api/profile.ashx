<%@ WebHandler Language="C#" Class="Api_Profile" %>
using System;
using System.Web;
using _71.DAL;
using _71.Utils;

public class Api_Profile : IHttpHandler
{
    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "application/json";
        try
        {
            var repo = new ProfileRepository();
            var profile = repo.GetLatestProfile();

            if (profile == null)
            {
                JsonHelper.WriteJsonResponse(context.Response, new { error = "Profile not found" });
                return;
            }

            var textWriterTexts = repo.GetTextWriterTexts();

            var response = new
            {
                id = profile.Id,
                name = profile.Name,
                title = profile.Title,
                email = profile.Email,
                location = profile.Location,
                bio = profile.Bio,
                about = profile.AboutDescription,
                github = profile.GithubUrl,
                linkedin = profile.LinkedInUrl,
                typewriterTexts = textWriterTexts,
                createdAt = profile.CreatedAt,
                updatedAt = profile.UpdatedAt
            };

            JsonHelper.WriteJsonResponse(context.Response, response);
        }
        catch (Exception ex)
        {
            JsonHelper.WriteJsonResponse(context.Response, new { error = ex.Message });
        }
    }

    public bool IsReusable { get { return false; } }
}
