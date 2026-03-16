using System.Net.Http;

namespace MultiClimact.Services
{
    public class GraphServiceClient
    {
        public HttpClient HttpClient { get; }

        public GraphServiceClient(HttpClient httpClient)
        {
            HttpClient = httpClient;
        }
    }
}
