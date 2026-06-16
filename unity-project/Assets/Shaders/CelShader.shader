// Miles Morales cel-shading with hard light steps and colored outlines
Shader "BagongLupa/CelShader"
{
    Properties
    {
        _MainTex ("Albedo", 2D) = "white" {}
        _Color ("Base Color", Color) = (1,1,1,1)
        _ShadowColor ("Shadow Color", Color) = (0.05, 0.02, 0.15, 1) // deep purple shadow
        _ShadowThreshold ("Shadow Threshold", Range(0,1)) = 0.4
        _ShadowSmooth ("Shadow Smooth", Range(0,0.2)) = 0.02
        _MidColor ("Mid Color", Color) = (0.15, 0.05, 0.35, 1)
        _MidThreshold ("Mid Threshold", Range(0,1)) = 0.7
        _RimColor ("Rim Color", Color) = (0.4, 0.1, 1.0, 1)  // purple rim
        _RimPower ("Rim Power", Range(1,8)) = 3.0
        _OutlineColor ("Outline Color", Color) = (0, 0, 0, 1)
        _OutlineWidth ("Outline Width", Range(0, 0.05)) = 0.003
    }

    SubShader
    {
        Tags { "RenderType"="Opaque" "RenderPipeline"="UniversalPipeline" }

        // --- Outline pass (back-face expanded) ---
        Pass
        {
            Name "Outline"
            Cull Front

            HLSLPROGRAM
            #pragma vertex OutlineVert
            #pragma fragment OutlineFrag
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

            struct Attributes { float4 posOS : POSITION; float3 normalOS : NORMAL; };
            struct Varyings { float4 posCS : SV_POSITION; };

            float _OutlineWidth;
            float4 _OutlineColor;

            Varyings OutlineVert(Attributes IN)
            {
                Varyings OUT;
                float3 normalWS = TransformObjectToWorldNormal(IN.normalOS);
                float3 posWS = TransformObjectToWorld(IN.posOS.xyz) + normalWS * _OutlineWidth;
                OUT.posCS = TransformWorldToHClip(posWS);
                return OUT;
            }

            half4 OutlineFrag(Varyings IN) : SV_Target { return _OutlineColor; }
            ENDHLSL
        }

        // --- Main cel-shaded pass ---
        Pass
        {
            Name "CelShading"
            Tags { "LightMode"="UniversalForward" }

            HLSLPROGRAM
            #pragma vertex Vert
            #pragma fragment Frag
            #pragma multi_compile _ _MAIN_LIGHT_SHADOWS
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"

            struct Attributes
            {
                float4 posOS   : POSITION;
                float3 normalOS: NORMAL;
                float2 uv      : TEXCOORD0;
            };

            struct Varyings
            {
                float4 posCS   : SV_POSITION;
                float3 normalWS: TEXCOORD0;
                float3 viewDir : TEXCOORD1;
                float2 uv      : TEXCOORD2;
                float3 posWS   : TEXCOORD3;
            };

            TEXTURE2D(_MainTex); SAMPLER(sampler_MainTex);
            float4 _Color, _ShadowColor, _MidColor, _RimColor;
            float _ShadowThreshold, _ShadowSmooth, _MidThreshold, _RimPower;

            Varyings Vert(Attributes IN)
            {
                Varyings OUT;
                OUT.posCS    = TransformObjectToHClip(IN.posOS.xyz);
                OUT.normalWS = TransformObjectToWorldNormal(IN.normalOS);
                OUT.posWS    = TransformObjectToWorld(IN.posOS.xyz);
                OUT.viewDir  = GetWorldSpaceNormalizeViewDir(OUT.posWS);
                OUT.uv       = IN.uv;
                return OUT;
            }

            half4 Frag(Varyings IN) : SV_Target
            {
                half4 albedo = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, IN.uv) * _Color;

                Light mainLight = GetMainLight();
                float3 L = normalize(mainLight.direction);
                float3 N = normalize(IN.normalWS);
                float NdotL = dot(N, L);

                // Hard three-band shading
                float shadow = smoothstep(_ShadowThreshold - _ShadowSmooth, _ShadowThreshold + _ShadowSmooth, NdotL);
                float mid    = smoothstep(_MidThreshold - _ShadowSmooth, _MidThreshold + _ShadowSmooth, NdotL);

                half4 shadedColor = lerp(_ShadowColor, _MidColor, shadow);
                shadedColor = lerp(shadedColor, albedo, mid);

                // Rim light — neon purple edge
                float rim = 1.0 - saturate(dot(IN.viewDir, N));
                rim = pow(rim, _RimPower);
                shadedColor.rgb += _RimColor.rgb * rim;

                // Light color tint
                shadedColor.rgb *= mainLight.color;

                return shadedColor;
            }
            ENDHLSL
        }
    }
}
