using UnityEngine;
using UnityEngine.AI;
using System.Collections;
using BagongLupa.Core;

namespace BagongLupa.World
{
    [RequireComponent(typeof(NavMeshAgent))]
    public class NPCController : MonoBehaviour
    {
        [Header("Identity")]
        [SerializeField] string npcId;
        [SerializeField] string npcName;

        [Header("Patrol")]
        [SerializeField] Transform[] waypoints;
        [SerializeField] float waitAtWaypointSeconds = 3f;
        [SerializeField] float wanderRadius = 10f;

        [Header("Dialogue")]
        [SerializeField] DialogueLine[] dialogueLines;

        NavMeshAgent _agent;
        int _currentWaypoint;
        bool _waiting;
        bool _inDialogue;

        void Awake() => _agent = GetComponent<NavMeshAgent>();

        void Start()
        {
            if (waypoints.Length > 0)
                StartCoroutine(PatrolRoutine());
            else
                StartCoroutine(WanderRoutine());
        }

        IEnumerator PatrolRoutine()
        {
            while (true)
            {
                if (_inDialogue) { yield return null; continue; }
                _agent.SetDestination(waypoints[_currentWaypoint].position);
                yield return new WaitUntil(() => AgentArrived() || _inDialogue);
                if (!_inDialogue)
                {
                    _waiting = true;
                    yield return new WaitForSeconds(waitAtWaypointSeconds);
                    _waiting = false;
                    _currentWaypoint = (_currentWaypoint + 1) % waypoints.Length;
                }
            }
        }

        IEnumerator WanderRoutine()
        {
            while (true)
            {
                if (_inDialogue) { yield return null; continue; }
                Vector3 target = RandomNavPoint();
                _agent.SetDestination(target);
                yield return new WaitUntil(() => AgentArrived() || _inDialogue);
                yield return new WaitForSeconds(Random.Range(2f, 5f));
            }
        }

        Vector3 RandomNavPoint()
        {
            Vector3 randomDir = Random.insideUnitSphere * wanderRadius + transform.position;
            NavMesh.SamplePosition(randomDir, out NavMeshHit hit, wanderRadius, NavMesh.AllAreas);
            return hit.position;
        }

        bool AgentArrived()
        {
            return !_agent.pathPending && _agent.remainingDistance <= _agent.stoppingDistance;
        }

        void OnTriggerEnter(Collider other)
        {
            if (!other.CompareTag("Player") || _inDialogue) return;
            // Prompt player to interact
        }

        public void StartDialogue()
        {
            if (dialogueLines.Length == 0) return;
            _inDialogue = true;
            _agent.isStopped = true;
            transform.LookAt(Camera.main.transform);
            EventBus.Publish(new DialogueStartedEvent { NpcId = npcId });
        }

        public void EndDialogue()
        {
            _inDialogue = false;
            _agent.isStopped = false;
        }
    }

    [System.Serializable]
    public struct DialogueLine
    {
        public string speaker;
        [TextArea] public string text;
        public AudioClip voiceClip;
    }
}
