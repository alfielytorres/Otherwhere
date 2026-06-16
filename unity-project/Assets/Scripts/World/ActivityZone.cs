using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using BagongLupa.Core;
using BagongLupa.Player;
using BagongLupa.UI;

namespace BagongLupa.World
{
    public class ActivityZone : MonoBehaviour
    {
        [SerializeField] List<ActivityData> availableActivities;
        [SerializeField] string zoneName;
        [SerializeField] bool requiresIndoor;

        bool _playerInside;

        void OnTriggerEnter(Collider other)
        {
            if (!other.CompareTag("Player")) return;
            _playerInside = true;
            ActivityMenuUI.Instance?.ShowMenu(zoneName, availableActivities);
        }

        void OnTriggerExit(Collider other)
        {
            if (!other.CompareTag("Player")) return;
            _playerInside = false;
            ActivityMenuUI.Instance?.HideMenu();
        }

        public void StartActivity(ActivityData activity)
        {
            if (!_playerInside) return;
            if (!PlayerNeeds.Instance.CanAfford(activity.cost))
            {
                ActivityMenuUI.Instance?.ShowNotification("Kulang ang pera mo!");
                return;
            }
            StartCoroutine(RunActivity(activity));
        }

        IEnumerator RunActivity(ActivityData activity)
        {
            GameManager.Instance.SetState(GameState.InActivity);
            PlayerNeeds.Instance.ModifyMoney(-activity.cost);

            EventBus.Publish(new ActivityStartedEvent { Activity = activity });
            ActivityMenuUI.Instance?.ShowActivityProgress(activity);

            float elapsed = 0f;
            float durationSeconds = activity.durationMinutes * 60f / 60f; // scaled to game time

            while (elapsed < durationSeconds)
            {
                elapsed += Time.deltaTime;
                ActivityMenuUI.Instance?.UpdateProgress(elapsed / durationSeconds);
                yield return null;
            }

            foreach (var effect in activity.needEffects)
                PlayerNeeds.Instance.ModifyNeed(effect.need, effect.delta);

            if (activity.moneyReward > 0f)
                PlayerNeeds.Instance.ModifyMoney(activity.moneyReward);

            TimeManager.Instance?.AdvanceMinutes(activity.durationMinutes);

            EventBus.Publish(new ActivityCompletedEvent
            {
                Activity = activity,
                MoneyEarned = activity.moneyReward
            });

            GameManager.Instance.SetState(GameState.Exploring);
            ActivityMenuUI.Instance?.HideProgress();
        }
    }
}
