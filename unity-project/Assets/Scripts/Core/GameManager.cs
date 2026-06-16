using UnityEngine;
using System;

namespace BagongLupa.Core
{
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        [Header("Game State")]
        public GameState CurrentState { get; private set; } = GameState.Exploring;

        public event Action<GameState> OnStateChanged;

        void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        void Start()
        {
            SetState(GameState.Exploring);
        }

        public void SetState(GameState newState)
        {
            if (CurrentState == newState) return;
            CurrentState = newState;
            OnStateChanged?.Invoke(newState);

            switch (newState)
            {
                case GameState.InActivity:
                    Time.timeScale = 2f; // Activities fast-forward time
                    break;
                case GameState.InDialogue:
                case GameState.InMenu:
                    Time.timeScale = 0f;
                    break;
                default:
                    Time.timeScale = 1f;
                    break;
            }
        }

        public bool IsPlayable => CurrentState == GameState.Exploring || CurrentState == GameState.InActivity;
    }

    public enum GameState
    {
        Exploring,
        InActivity,
        InDialogue,
        InMenu,
        Cutscene
    }
}
