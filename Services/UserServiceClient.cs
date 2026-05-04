using System.Net.Http;

namespace MultiClimact.Services
{
    public class UserServiceClient
    {
        public HttpClient HttpClient { get; }

        public UserServiceClient(HttpClient httpClient)
        {
            HttpClient = httpClient;
        }
    }
}
