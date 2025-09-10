using System;
using System.Web;
using Newtonsoft.Json;

namespace _71.Utils
{
    public static class JsonHelper
    {
        public static string SerializeToJson(object obj)
        {
            try
            {
                return JsonConvert.SerializeObject(obj, Formatting.Indented);
            }
            catch
            {
                return "{}";
            }
        }

        public static void WriteJsonResponse(HttpResponse response, object data)
        {
            try
            {
                response.Clear();
                response.ContentType = "application/json";
                response.AddHeader("Access-Control-Allow-Origin", "*");
                response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                response.AddHeader("Access-Control-Allow-Headers", "Content-Type");

                string json = SerializeToJson(data);
                response.Write(json);
                try
                {
                    response.Flush();
                    if (HttpContext.Current != null)
                    {
                        HttpContext.Current.ApplicationInstance.CompleteRequest();
                    }
                }
                catch
                {
                    // swallow potential flush errors; response already written
                }
            }
            catch
            {
                response.StatusCode = 500;
                try
                {
                    response.Write("{\"error\":\"Internal server error\"}");
                    response.Flush();
                    if (HttpContext.Current != null)
                    {
                        HttpContext.Current.ApplicationInstance.CompleteRequest();
                    }
                }
                catch
                {
                    // nothing we can do
                }
            }
        }
    }
}