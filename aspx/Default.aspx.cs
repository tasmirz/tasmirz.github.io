using System;
using System.Web.UI;
using _71.DAL;
using _71.Utils;

namespace _71
{
    public partial class DefaultPage : Page
    {
        private readonly ProfileRepository _profileRepository = new ProfileRepository();

        protected void Page_Load(object sender, EventArgs e)
        {
            LoadProfileDescription();
        }

        private void LoadProfileDescription()
        {
            try
            {
                string description = _profileRepository.GetAboutDescription();

                if (!string.IsNullOrEmpty(description))
                {
                    litProfile.Text = description;
                }
                else
                {
                    litProfile.Text = GetDefaultProfileText();
                }
            }
            catch (Exception ex)
            {
                Logger.LogError("Failed to load profile description", ex);
                litProfile.Text = GetDefaultProfileText();
            }
        }

        private static string GetDefaultProfileText()
        {
            return "<p>Welcome to my portfolio. Profile information will be available soon.</p>";
        }
    }
}
