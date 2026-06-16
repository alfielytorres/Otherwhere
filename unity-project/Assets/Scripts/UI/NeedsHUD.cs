using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections.Generic;
using BagongLupa.Player;
using BagongLupa.Core;

namespace BagongLupa.UI
{
    public class NeedsHUD : MonoBehaviour
    {
        public static NeedsHUD Instance { get; private set; }

        [Header("Needs Bars")]
        [SerializeField] NeedBarUI[] needBars; // one per NeedType in order

        [Header("Money & Time")]
        [SerializeField] TextMeshProUGUI moneyText;
        [SerializeField] TextMeshProUGUI timeText;
        [SerializeField] TextMeshProUGUI dayText;

        [Header("Critical Flash")]
        [SerializeField] Image flashOverlay;
        [SerializeField] float flashDuration = 0.3f;

        // Miles Morales palette
        static readonly Color ColorHealthy = new Color(0.18f, 0.82f, 0.44f);   // neon green
        static readonly Color ColorWarning = new Color(1f, 0.55f, 0f);         // orange
        static readonly Color ColorCritical = new Color(0.9f, 0.1f, 0.2f);     // red

        void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
        }

        void OnEnable()
        {
            if (PlayerNeeds.Instance != null)
                PlayerNeeds.Instance.OnNeedChanged += OnNeedChanged;
            EventBus.Subscribe<MoneyChangedEvent>(OnMoneyChanged);
            EventBus.Subscribe<NeedCriticalEvent>(OnNeedCritical);
        }

        void OnDisable()
        {
            if (PlayerNeeds.Instance != null)
                PlayerNeeds.Instance.OnNeedChanged -= OnNeedChanged;
            EventBus.Unsubscribe<MoneyChangedEvent>(OnMoneyChanged);
            EventBus.Unsubscribe<NeedCriticalEvent>(OnNeedCritical);
        }

        void Update()
        {
            if (TimeManager.Instance != null)
            {
                timeText.text = TimeManager.Instance.GetTimeString();
                dayText.text = $"Araw {TimeManager.Instance.Day}";
            }
        }

        void OnNeedChanged(NeedType need, float value)
        {
            int idx = (int)need;
            if (idx >= needBars.Length) return;

            needBars[idx].Fill(value / 100f);
            needBars[idx].SetColor(value > 50f ? ColorHealthy : value > 20f ? ColorWarning : ColorCritical);
        }

        void OnMoneyChanged(MoneyChangedEvent evt)
        {
            moneyText.text = $"₱{evt.NewAmount:N0}";
            // Flash green for earn, red for spend
            Color flash = evt.Delta > 0 ? new Color(0.2f, 1f, 0.4f, 0.4f) : new Color(1f, 0.2f, 0.2f, 0.4f);
            StartCoroutine(FlashColor(flash));
        }

        void OnNeedCritical(NeedCriticalEvent evt)
        {
            StartCoroutine(FlashColor(new Color(1f, 0f, 0f, 0.3f)));
        }

        System.Collections.IEnumerator FlashColor(Color color)
        {
            flashOverlay.color = color;
            yield return new WaitForSecondsRealtime(flashDuration);
            flashOverlay.color = Color.clear;
        }

        public void ShowNotification(string msg)
        {
            // Implemented by NotificationToast component on canvas
        }
    }

    [System.Serializable]
    public class NeedBarUI
    {
        public string label;
        public Slider slider;
        public Image fill;
        public TextMeshProUGUI labelText;

        public void Fill(float normalized) => slider.value = normalized;
        public void SetColor(Color c) { if (fill != null) fill.color = c; }
    }
}
