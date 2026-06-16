using UnityEngine;
using BagongLupa.Core;
using BagongLupa.Player;

namespace BagongLupa.World
{
    public class BuildingInterior : MonoBehaviour
    {
        [Header("Building Info")]
        [SerializeField] string buildingId;
        [SerializeField] string buildingName;

        [Header("References")]
        [SerializeField] GameObject exteriorMesh;
        [SerializeField] GameObject interiorMesh;
        [SerializeField] Transform playerSpawnPoint;
        [SerializeField] Transform exitPoint;

        [Header("Transition")]
        [SerializeField] float transitionFadeTime = 0.4f;

        bool _playerInside;
        Transform _playerTransform;

        void Start()
        {
            interiorMesh.SetActive(false);
        }

        void OnTriggerEnter(Collider other)
        {
            if (!other.CompareTag("Player") || _playerInside) return;
            _playerTransform = other.transform;
            Enter();
        }

        public void Enter()
        {
            _playerInside = true;
            exteriorMesh.SetActive(false);
            interiorMesh.SetActive(true);

            if (playerSpawnPoint != null)
                _playerTransform.position = playerSpawnPoint.position;

            EventBus.Publish(new PlayerEnteredBuildingEvent { BuildingId = buildingId });
        }

        public void Exit()
        {
            _playerInside = false;
            exteriorMesh.SetActive(true);
            interiorMesh.SetActive(false);

            if (exitPoint != null && _playerTransform != null)
                _playerTransform.position = exitPoint.position;

            EventBus.Publish(new PlayerExitedBuildingEvent { BuildingId = buildingId });
        }

        void Update()
        {
            if (_playerInside && Input.GetKeyDown(KeyCode.E))
                Exit();
        }
    }
}
