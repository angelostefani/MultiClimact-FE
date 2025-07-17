using Newtonsoft.Json;
using System;

namespace MultiClimact.Models
{
    public class EarthquakeData
    {
        [JsonProperty("id_run")]
        public string? IdRun { get; set; }

        [JsonProperty("damage_conf")]
        public string? DamageConf { get; set; }

        [JsonProperty("magnitude")]
        public double Magnitude { get; set; }

        [JsonProperty("impact_conf")]
        public string? ImpactConf { get; set; }

        [JsonProperty("description")]
        public string? Description { get; set; }

        [JsonProperty("event_date")]
        public DateTime EventDate { get; set; }

        [JsonProperty("status")]
        public string? Status { get; set; }
    }
}


