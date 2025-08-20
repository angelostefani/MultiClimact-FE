using System;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace MultiClimact.Services
{
    public class RetryHandler : DelegatingHandler
    {
        private readonly ILogger<RetryHandler> _logger;
        private const int MaxRetries = 3;

        public RetryHandler(ILogger<RetryHandler> logger)
        {
            _logger = logger;
        }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            for (int attempt = 0; attempt <= MaxRetries; attempt++)
            {
                HttpResponseMessage? response = null;
                try
                {
                    response = await base.SendAsync(request, cancellationToken);

                    if (!ShouldRetry(response) || attempt == MaxRetries)
                    {
                        return response;
                    }
                }
                catch (HttpRequestException ex) when (attempt < MaxRetries)
                {
                    _logger.LogWarning(ex, "Transient HTTP error on attempt {Attempt} for {Method} {Url}", attempt + 1, request.Method, request.RequestUri);
                }

                // Dispose response before retrying to avoid socket exhaustion
                response?.Dispose();

                var delay = ComputeDelay(attempt);
                _logger.LogInformation("Retrying request ({Attempt}/{Max}) after {Delay}ms: {Method} {Url}", attempt + 1, MaxRetries, delay.TotalMilliseconds, request.Method, request.RequestUri);
                await Task.Delay(delay, cancellationToken);
            }

            // Should not reach here due to returns in loop
            return await base.SendAsync(request, cancellationToken);
        }

        private static bool ShouldRetry(HttpResponseMessage response)
        {
            // Retry on common transient statuses
            return response.StatusCode == HttpStatusCode.RequestTimeout
                   || (int)response.StatusCode == 429
                   || (int)response.StatusCode >= 500;
        }

        private static TimeSpan ComputeDelay(int attempt)
        {
            // Exponential backoff with jitter (200ms, 400ms, 800ms) +/- up to 100ms
            var baseMs = Math.Min(800, (int)(200 * Math.Pow(2, attempt)));
            var jitter = Random.Shared.Next(0, 100);
            return TimeSpan.FromMilliseconds(baseMs + jitter);
        }
    }
}

