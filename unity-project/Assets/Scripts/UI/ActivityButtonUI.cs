using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System;
using BagongLupa.Core;
using BagongLupa.Player;

namespace BagongLupa.UI
{
    public class ActivityButtonUI : MonoBehaviour
    {
        [SerializeField] TextMeshProUGUI nameText;
        [SerializeField] TextMeshProUGUI costText;
        [SerializeField] TextMeshProUGUI durationText;
        [SerializeField] Image iconImage;
        [SerializeField] Image accentBar;
        [SerializeField] Button button;

        public void Setup(ActivityData data, Action onClicked)
        {
            nameText.text = data.displayName;
            costText.text = data.cost > 0 ? $"₱{data.cost}" : data.moneyReward > 0 ? $"+₱{data.moneyReward}" : "Libre";
            durationText.text = $"{data.durationMinutes:0}min";

            if (data.activityIcon != null) iconImage.sprite = data.activityIcon;
            accentBar.color = data.accentColor;

            bool canAfford = PlayerNeeds.Instance.CanAfford(data.cost);
            button.interactable = canAfford;
            if (!canAfford) nameText.color = new Color(0.5f, 0.5f, 0.5f);

            button.onClick.RemoveAllListeners();
            button.onClick.AddListener(() => onClicked());
        }
    }
}
