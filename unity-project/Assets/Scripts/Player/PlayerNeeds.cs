using UnityEngine;
using System;
using System.Collections.Generic;
using BagongLupa.Core;

namespace BagongLupa.Player
{
    public enum NeedType { Gutom, Lakas, Lipunan, Kasiyahan, Kalinisan }

    public class PlayerNeeds : MonoBehaviour
    {
        public static PlayerNeeds Instance { get; private set; }

        [Header("Initial Values (0-100)")]
        [SerializeField] float startGutom = 80f;
        [SerializeField] float startLakas = 90f;
        [SerializeField] float startLipunan = 70f;
        [SerializeField] float startKasiyahan = 75f;
        [SerializeField] float startKalinisan = 85f;

        [Header("Decay Rates (per game hour)")]
        [SerializeField] float gutomDecay = 8f;
        [SerializeField] float lakasDecay = 5f;
        [SerializeField] float lipunanDecay = 4f;
        [SerializeField] float kasiyahanDecay = 6f;
        [SerializeField] float kalinisanDecay = 3f;

        [Header("Critical Threshold")]
        [SerializeField] float criticalLevel = 20f;

        Dictionary<NeedType, float> _needs = new();
        Dictionary<NeedType, float> _decayRates = new();
        HashSet<NeedType> _alertedCritical = new();

        public float Money { get; private set; } = 500f;

        public event Action<NeedType, float> OnNeedChanged;

        void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            InitNeeds();
        }

        void InitNeeds()
        {
            _needs[NeedType.Gutom] = startGutom;
            _needs[NeedType.Lakas] = startLakas;
            _needs[NeedType.Lipunan] = startLipunan;
            _needs[NeedType.Kasiyahan] = startKasiyahan;
            _needs[NeedType.Kalinisan] = startKalinisan;

            _decayRates[NeedType.Gutom] = gutomDecay;
            _decayRates[NeedType.Lakas] = lakasDecay;
            _decayRates[NeedType.Lipunan] = lipunanDecay;
            _decayRates[NeedType.Kasiyahan] = kasiyahanDecay;
            _decayRates[NeedType.Kalinisan] = kalinisanDecay;
        }

        void Update()
        {
            if (GameManager.Instance.CurrentState == GameState.InActivity) return;

            float hoursElapsed = Time.deltaTime / TimeManager.Instance != null
                ? 60f : 1f; // fallback

            foreach (NeedType need in System.Enum.GetValues(typeof(NeedType)))
            {
                float decay = _decayRates[need] * Time.deltaTime / 3600f * 60f;
                ModifyNeed(need, -decay);
                CheckCritical(need);
            }
        }

        public float GetNeed(NeedType need) => _needs[need];

        public void ModifyNeed(NeedType need, float delta)
        {
            _needs[need] = Mathf.Clamp(_needs[need] + delta, 0f, 100f);
            OnNeedChanged?.Invoke(need, _needs[need]);

            if (_needs[need] > criticalLevel)
                _alertedCritical.Remove(need);
        }

        public void ModifyMoney(float delta)
        {
            Money = Mathf.Max(0f, Money + delta);
            EventBus.Publish(new MoneyChangedEvent { NewAmount = Money, Delta = delta });
        }

        public bool CanAfford(float cost) => Money >= cost;

        public float GetLowestNeed(out NeedType needType)
        {
            float lowest = float.MaxValue;
            needType = NeedType.Gutom;
            foreach (var kvp in _needs)
            {
                if (kvp.Value < lowest) { lowest = kvp.Value; needType = kvp.Key; }
            }
            return lowest;
        }

        void CheckCritical(NeedType need)
        {
            if (_needs[need] <= criticalLevel && !_alertedCritical.Contains(need))
            {
                _alertedCritical.Add(need);
                EventBus.Publish(new NeedCriticalEvent { Need = need, Value = _needs[need] });
            }
        }

        public string GetNeedLabel(NeedType need) => need switch
        {
            NeedType.Gutom => "Gutom",
            NeedType.Lakas => "Lakas",
            NeedType.Lipunan => "Lipunan",
            NeedType.Kasiyahan => "Kasiyahan",
            NeedType.Kalinisan => "Kalinisan",
            _ => need.ToString()
        };
    }
}
