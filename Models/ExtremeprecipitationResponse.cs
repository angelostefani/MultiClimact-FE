using System.Collections.Generic;

namespace MultiClimact.Models
{
    public class ExtremeprecipitationResponse
    {
        public bool Success { get; set; }
        public List<ExtremeprecipitationData>? Data { get; set; }
    }
}
