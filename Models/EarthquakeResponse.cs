using System.Collections.Generic;

namespace MultiClimact.Models
{
    public class EarthquakeResponse
    {
        public bool Success { get; set; }
        public List<EarthquakeData>? Data { get; set; }
    }
}

