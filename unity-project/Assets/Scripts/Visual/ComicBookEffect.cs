using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace BagongLupa.Visual
{
    /// <summary>
    /// Applies Miles Morales-style comic book overlays:
    ///   - Speed lines when moving fast
    ///   - Halftone vignette during activity transitions
    ///   - Impact frames on collisions / critical need alerts
    /// </summary>
    public class ComicBookEffect : MonoBehaviour
    {
        [Header("Materials")]
        [SerializeField] Material speedLinesMaterial;
        [SerializeField] Material halftoneMaterial;
        [SerializeField] Material impactFrameMaterial;

        [Header("Speed Lines")]
        [SerializeField] float speedThreshold = 7f;
        [SerializeField] float speedLineFadeSpeed = 3f;

        [Header("References")]
        [SerializeField] UnityEngine.CharacterController playerCC;

        Volume _postProcessVolume;
        float _speedLineAlpha;

        void Awake()
        {
            _postProcessVolume = GetComponent<Volume>();
            BagongLupa.Core.EventBus.Subscribe<BagongLupa.Core.NeedCriticalEvent>(OnNeedCritical);
            BagongLupa.Core.EventBus.Subscribe<BagongLupa.Core.ActivityStartedEvent>(OnActivityStarted);
        }

        void OnDestroy()
        {
            BagongLupa.Core.EventBus.Unsubscribe<BagongLupa.Core.NeedCriticalEvent>(OnNeedCritical);
            BagongLupa.Core.EventBus.Unsubscribe<BagongLupa.Core.ActivityStartedEvent>(OnActivityStarted);
        }

        void Update()
        {
            if (playerCC == null) return;

            float speed = playerCC.velocity.magnitude;
            float targetAlpha = speed > speedThreshold ? 1f : 0f;
            _speedLineAlpha = Mathf.MoveTowards(_speedLineAlpha, targetAlpha, Time.deltaTime * speedLineFadeSpeed);
            speedLinesMaterial.SetFloat("_Alpha", _speedLineAlpha);
        }

        void OnRenderImage(RenderTexture src, RenderTexture dst)
        {
            if (_speedLineAlpha > 0.01f)
            {
                RenderTexture temp = RenderTexture.GetTemporary(src.descriptor);
                Graphics.Blit(src, temp, speedLinesMaterial);
                Graphics.Blit(temp, dst);
                RenderTexture.ReleaseTemporary(temp);
            }
            else
            {
                Graphics.Blit(src, dst);
            }
        }

        void OnNeedCritical(BagongLupa.Core.NeedCriticalEvent evt)
        {
            StartCoroutine(ImpactFrame(0.12f));
        }

        void OnActivityStarted(BagongLupa.Core.ActivityStartedEvent evt)
        {
            StartCoroutine(HalftoneTransition(0.5f, evt.Activity.accentColor));
        }

        System.Collections.IEnumerator ImpactFrame(float duration)
        {
            impactFrameMaterial.SetFloat("_Strength", 1f);
            yield return new WaitForSecondsRealtime(duration);
            impactFrameMaterial.SetFloat("_Strength", 0f);
        }

        System.Collections.IEnumerator HalftoneTransition(float duration, Color color)
        {
            halftoneMaterial.SetColor("_Color", color);
            float t = 0f;
            while (t < duration)
            {
                halftoneMaterial.SetFloat("_Progress", t / duration);
                t += Time.unscaledDeltaTime;
                yield return null;
            }
        }
    }
}
