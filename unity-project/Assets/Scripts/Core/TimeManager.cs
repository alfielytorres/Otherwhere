using UnityEngine;
using System;

namespace BagongLupa.Core
{
    /// <summary>
    /// Game clock — 1 real second = configurable game minutes.
    /// Starts at 22:00 for that late-night neon city feel.
    /// </summary>
    public class TimeManager : MonoBehaviour
    {
        public static TimeManager Instance { get; private set; }

        [Header("Time Settings")]
        [SerializeField] float realSecondsPerGameHour = 60f;
        [SerializeField] int startHour = 22;
        [SerializeField] int startMinute = 0;

        public float GameHour { get; private set; }
        public int Hours => Mathf.FloorToInt(GameHour) % 24;
        public int Minutes => Mathf.FloorToInt((GameHour % 1f) * 60f);
        public int Day { get; private set; } = 1;

        public event Action<int> OnNewDay;
        public event Action<int> OnHourChanged;

        float _secondsPerGameMinute;
        int _lastHour;

        void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            _secondsPerGameMinute = realSecondsPerGameHour / 60f;
            GameHour = startHour + startMinute / 60f;
            _lastHour = startHour;
        }

        void Update()
        {
            GameHour += Time.deltaTime / realSecondsPerGameHour;

            if (Hours != _lastHour)
            {
                OnHourChanged?.Invoke(Hours);
                _lastHour = Hours;
            }

            if (GameHour >= 24f)
            {
                GameHour -= 24f;
                Day++;
                OnNewDay?.Invoke(Day);
            }
        }

        public void AdvanceMinutes(float minutes)
        {
            GameHour += minutes / 60f;
        }

        public string GetTimeString() => $"{Hours:D2}:{Minutes:D2}";

        // 0 at midnight, 1 at noon — drives lighting blend
        public float GetNormalizedDayProgress() => GameHour / 24f;

        public bool IsNight => Hours >= 20 || Hours < 6;
    }
}
