using System;
using System.Diagnostics;

namespace _71.Utils
{
    public static class Logger
    {
        public static void LogError(string message, Exception exception = null)
        {
            try
            {
                string logMessage = $"[ERROR] {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} - {message}";
                if (exception != null)
                {
                    logMessage += $" - Exception: {exception.Message}";
                }

                Debug.WriteLine(logMessage);

                // In production, you might want to log to a file, database, or logging service
                // For now, we'll use Debug.WriteLine which is visible in Visual Studio Output
            }
            catch
            {
                // Ignore logging errors
            }
        }

        public static void LogInfo(string message)
        {
            try
            {
                string logMessage = $"[INFO] {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} - {message}";
                Debug.WriteLine(logMessage);
            }
            catch
            {
                // Ignore logging errors
            }
        }

        public static void LogActivity(string action, string username = null, string details = null)
        {
            try
            {
                string logMessage = $"[ACTIVITY] {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} - Action: {action}";
                if (!string.IsNullOrEmpty(username))
                {
                    logMessage += $", User: {username}";
                }
                if (!string.IsNullOrEmpty(details))
                {
                    logMessage += $", Details: {details}";
                }

                Debug.WriteLine(logMessage);
            }
            catch
            {
                // Ignore logging errors
            }
        }
    }
}
