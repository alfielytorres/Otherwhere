using UnityEngine;
using BagongLupa.Core;

namespace BagongLupa.Visual
{
    /// <summary>
    /// Drives directional light, ambient, and fog to match game time.
    /// At night: deep purple sky, neon bloom from city lights.
    /// At day: warm golden light, desaturated street aesthetic.
    /// </summary>
    public class DayNightCycle : MonoBehaviour
    {
        [Header("Sun")]
        [SerializeField] Light sun;
        [SerializeField] Gradient sunColor;
        [SerializeField] AnimationCurve sunIntensity;

        [Header("Ambient")]
        [SerializeField] Gradient ambientSky;
        [SerializeField] Gradient ambientEquator;
        [SerializeField] Gradient ambientGround;

        [Header("Fog")]
        [SerializeField] Gradient fogColor;
        [SerializeField] AnimationCurve fogDensity;

        [Header("Neon City Lights")]
        [SerializeField] Light[] neonLights; // point lights on buildings
        [SerializeField] float neonOnHour = 18f;
        [SerializeField] float neonOffHour = 6f;

        void Update()
        {
            if (TimeManager.Instance == null) return;

            float t = TimeManager.Instance.GetNormalizedDayProgress();
            float hour = TimeManager.Instance.GameHour;

            // Rotate sun 360° over 24 hours
            sun.transform.rotation = Quaternion.Euler((t * 360f) - 90f, 170f, 0f);
            sun.color = sunColor.Evaluate(t);
            sun.intensity = sunIntensity.Evaluate(t);

            // Ambient
            RenderSettings.ambientSkyColor = ambientSky.Evaluate(t);
            RenderSettings.ambientEquatorColor = ambientEquator.Evaluate(t);
            RenderSettings.ambientGroundColor = ambientGround.Evaluate(t);

            // Fog — denser at night for that moody city feel
            RenderSettings.fogColor = fogColor.Evaluate(t);
            RenderSettings.fogDensity = fogDensity.Evaluate(t);

            // Neon lights: on at dusk, off at dawn
            bool neonOn = hour >= neonOnHour || hour < neonOffHour;
            foreach (var light in neonLights)
                light.enabled = neonOn;
        }
    }
}
