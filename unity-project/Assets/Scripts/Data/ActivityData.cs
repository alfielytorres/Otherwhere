using UnityEngine;
using System;
using BagongLupa.Player;

namespace BagongLupa.Core
{
    [CreateAssetMenu(fileName = "Activity", menuName = "BagongLupa/Activity")]
    public class ActivityData : ScriptableObject
    {
        [Header("Identity")]
        public string activityId;
        public string displayName;
        [TextArea] public string flavorText;

        [Header("Requirements")]
        public float cost;
        public float durationMinutes = 60f;
        public NeedType[] requiredBuilding; // empty = anywhere

        [Header("Need Effects")]
        public NeedEffect[] needEffects;

        [Header("Money")]
        public float moneyReward; // positive = earn, negative = spend (redundant with cost)

        [Header("Visual")]
        public Sprite activityIcon;
        public Color accentColor = new Color(0.5f, 0f, 1f); // default purple
    }

    [Serializable]
    public struct NeedEffect
    {
        public NeedType need;
        public float delta; // positive = restore
    }
}
