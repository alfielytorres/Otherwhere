using UnityEngine;
using BagongLupa.Core;

namespace BagongLupa.Player
{
    [RequireComponent(typeof(CharacterController))]
    public class PlayerController : MonoBehaviour
    {
        [Header("Movement")]
        [SerializeField] float walkSpeed = 5f;
        [SerializeField] float runSpeed = 9f;
        [SerializeField] float gravity = -20f;
        [SerializeField] float jumpHeight = 1.2f;

        [Header("Camera")]
        [SerializeField] Transform cameraMount;
        [SerializeField] float mouseSensitivity = 2f;
        [SerializeField] float verticalClampDeg = 80f;

        CharacterController _cc;
        Vector3 _velocity;
        float _xRotation;
        bool _grounded;

        void Awake() => _cc = GetComponent<CharacterController>();

        void Start()
        {
            Cursor.lockState = CursorLockMode.Locked;
            Cursor.visible = false;
        }

        void Update()
        {
            if (!GameManager.Instance.IsPlayable) return;

            HandleLook();
            HandleMove();
        }

        void HandleLook()
        {
            float mouseX = Input.GetAxis("Mouse X") * mouseSensitivity;
            float mouseY = Input.GetAxis("Mouse Y") * mouseSensitivity;

            _xRotation -= mouseY;
            _xRotation = Mathf.Clamp(_xRotation, -verticalClampDeg, verticalClampDeg);

            cameraMount.localRotation = Quaternion.Euler(_xRotation, 0f, 0f);
            transform.Rotate(Vector3.up * mouseX);
        }

        void HandleMove()
        {
            _grounded = _cc.isGrounded;
            if (_grounded && _velocity.y < 0f) _velocity.y = -2f;

            float h = Input.GetAxis("Horizontal");
            float v = Input.GetAxis("Vertical");
            bool sprinting = Input.GetKey(KeyCode.LeftShift);

            Vector3 moveDir = transform.right * h + transform.forward * v;
            float speed = sprinting ? runSpeed : walkSpeed;

            // Lakas drain when running
            if (sprinting && moveDir.magnitude > 0.1f)
                PlayerNeeds.Instance?.ModifyNeed(NeedType.Lakas, -0.5f * Time.deltaTime);

            _cc.Move(moveDir * speed * Time.deltaTime);

            if (Input.GetButtonDown("Jump") && _grounded)
                _velocity.y = Mathf.Sqrt(jumpHeight * -2f * gravity);

            _velocity.y += gravity * Time.deltaTime;
            _cc.Move(_velocity * Time.deltaTime);
        }

        public void FreezePlayer(bool freeze)
        {
            enabled = !freeze;
            if (freeze) Cursor.lockState = CursorLockMode.None;
            else Cursor.lockState = CursorLockMode.Locked;
        }
    }
}
