namespace _71.Utils
{
    public static class Constants
    {
        // Session Keys
        public const string SESSION_IS_ADMIN = "IsAdmin";
        public const string SESSION_ADMIN_USER = "Zihad";

        // Cookie Names
        public const string COOKIE_ADMIN_REMEMBER = "AdminRemember";

        // Default Values
        public const string DEFAULT_ADMIN_USERNAME = "admin";
        public const string DEFAULT_ADMIN_PASSWORD = "admin";

        // Messages
        public const string MESSAGE_INVALID_CREDENTIALS = "Invalid username or password.";
        public const string MESSAGE_LOGIN_SUCCESS = "Login successful.";
        public const string MESSAGE_LOGOUT_SUCCESS = "Logged out successfully.";
        public const string MESSAGE_UNAUTHORIZED = "You must be logged in to access this page.";

        // Admin Pages
        public const string PAGE_ADMIN_LOGIN = "~/admin/login.aspx";
        public const string PAGE_ADMIN_DASHBOARD = "~/admin/dashboard.aspx";

        // Session Timeout
        public const int SESSION_TIMEOUT_MINUTES = 30;
        public const int REMEMBER_COOKIE_DAYS = 30;
    }
}
