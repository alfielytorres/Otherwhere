using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections.Generic;
using BagongLupa.Core;
using BagongLupa.World;

namespace BagongLupa.UI
{
    public class ActivityMenuUI : MonoBehaviour
    {
        public static ActivityMenuUI Instance { get; private set; }

        [Header("Menu Panel")]
        [SerializeField] GameObject menuPanel;
        [SerializeField] TextMeshProUGUI zoneTitleText;
        [SerializeField] Transform activityButtonContainer;
        [SerializeField] GameObject activityButtonPrefab;

        [Header("Progress Panel")]
        [SerializeField] GameObject progressPanel;
        [SerializeField] TextMeshProUGUI activityNameText;
        [SerializeField] TextMeshProUGUI activityFlavorText;
        [SerializeField] Slider progressBar;
        [SerializeField] Image progressFill;

        [Header("Notification")]
        [SerializeField] TextMeshProUGUI notificationText;
        [SerializeField] GameObject notificationPanel;

        ActivityZone _currentZone;
        List<GameObject> _spawnedButtons = new();

        void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            menuPanel.SetActive(false);
            progressPanel.SetActive(false);
            notificationPanel.SetActive(false);
        }

        public void ShowMenu(string zoneName, List<ActivityData> activities)
        {
            zoneTitleText.text = zoneName.ToUpper();
            menuPanel.SetActive(true);

            foreach (var btn in _spawnedButtons) Destroy(btn);
            _spawnedButtons.Clear();

            foreach (var activity in activities)
            {
                var btnGo = Instantiate(activityButtonPrefab, activityButtonContainer);
                var btn = btnGo.GetComponent<ActivityButtonUI>();
                btn?.Setup(activity, () => _currentZone?.StartActivity(activity));
                _spawnedButtons.Add(btnGo);
            }

            GameManager.Instance.SetState(GameState.InMenu);
        }

        public void HideMenu()
        {
            menuPanel.SetActive(false);
            if (GameManager.Instance.CurrentState == GameState.InMenu)
                GameManager.Instance.SetState(GameState.Exploring);
        }

        public void ShowActivityProgress(ActivityData activity)
        {
            menuPanel.SetActive(false);
            progressPanel.SetActive(true);
            activityNameText.text = activity.displayName.ToUpper();
            activityFlavorText.text = activity.flavorText;
            progressBar.value = 0f;
            progressFill.color = activity.accentColor;
        }

        public void UpdateProgress(float normalized)
        {
            progressBar.value = normalized;
        }

        public void HideProgress()
        {
            progressPanel.SetActive(false);
        }

        public void ShowNotification(string msg)
        {
            notificationText.text = msg;
            notificationPanel.SetActive(true);
            Invoke(nameof(HideNotification), 2.5f);
        }

        void HideNotification() => notificationPanel.SetActive(false);

        public void SetCurrentZone(ActivityZone zone) => _currentZone = zone;
    }
}
