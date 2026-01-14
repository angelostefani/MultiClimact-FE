using System.Net.Http;

namespace MultiClimact.Services
{
    public class ExtremeprecipitationServiceClient
    {
        public HttpClient HttpClient { get; }

        public ExtremeprecipitationServiceClient(HttpClient httpClient)
        {
            HttpClient = httpClient;
        }
    }
}
