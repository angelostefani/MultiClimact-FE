using System.Collections.Generic;

namespace MultiClimact.Models
{
    public class HeatwaveResponse
    {
        public bool Success { get; set; }
        public List<HeatwaveData>? Data { get; set; }
    }
}

