using System.Net.Http;

namespace MultiClimact.Services
{
    public class HeatwaveServiceClient
    {
        public HttpClient HttpClient { get; }
        public HeatwaveServiceClient(HttpClient httpClient)
        {
            HttpClient = httpClient;
        }
    }
}
