using System;
using System.Collections.Generic;

namespace BagongLupa.Core
{
    public static class EventBus
    {
        static readonly Dictionary<Type, Delegate> _handlers = new();

        public static void Subscribe<T>(Action<T> handler)
        {
            var type = typeof(T);
            if (_handlers.TryGetValue(type, out var existing))
                _handlers[type] = Delegate.Combine(existing, handler);
            else
                _handlers[type] = handler;
        }

        public static void Unsubscribe<T>(Action<T> handler)
        {
            var type = typeof(T);
            if (_handlers.TryGetValue(type, out var existing))
            {
                var updated = Delegate.Remove(existing, handler);
                if (updated == null) _handlers.Remove(type);
                else _handlers[type] = updated;
            }
        }

        public static void Publish<T>(T evt)
        {
            if (_handlers.TryGetValue(typeof(T), out var handler))
                (handler as Action<T>)?.Invoke(evt);
        }
    }

    // Events
    public struct ActivityStartedEvent { public ActivityData Activity; }
    public struct ActivityCompletedEvent { public ActivityData Activity; public float MoneyEarned; }
    public struct NeedCriticalEvent { public NeedType Need; public float Value; }
    public struct PlayerEnteredBuildingEvent { public string BuildingId; }
    public struct PlayerExitedBuildingEvent { public string BuildingId; }
    public struct DialogueStartedEvent { public string NpcId; }
    public struct MoneyChangedEvent { public float NewAmount; public float Delta; }
}
