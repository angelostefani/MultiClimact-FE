using System.Net.Http;

namespace MultiClimact.Services
{
    public class EarthquakeServiceClient
    {
        public HttpClient HttpClient { get; }
        public EarthquakeServiceClient(HttpClient httpClient)
        {
            HttpClient = httpClient;
        }
    }
}
