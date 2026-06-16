// Emissive neon sign shader — for building signage and UI accents
Shader "BagongLupa/NeonGlow"
{
    Properties
    {
        _MainTex ("Texture", 2D) = "white" {}
        _EmissionColor ("Neon Color", Color) = (0.4, 0.1, 1.0, 1) // purple default
        _EmissionIntensity ("Intensity", Range(0, 10)) = 3.0
        _FlickerSpeed ("Flicker Speed", Range(0, 10)) = 0.0
        _FlickerAmount ("Flicker Amount", Range(0, 1)) = 0.0
    }

    SubShader
    {
        Tags { "RenderType"="Opaque" "RenderPipeline"="UniversalPipeline" }

        Pass
        {
            Name "NeonGlow"
            Tags { "LightMode"="UniversalForward" }

            HLSLPROGRAM
            #pragma vertex Vert
            #pragma fragment Frag
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

            struct Attributes { float4 posOS : POSITION; float2 uv : TEXCOORD0; };
            struct Varyings { float4 posCS : SV_POSITION; float2 uv : TEXCOORD0; };

            TEXTURE2D(_MainTex); SAMPLER(sampler_MainTex);
            float4 _EmissionColor;
            float _EmissionIntensity, _FlickerSpeed, _FlickerAmount;

            Varyings Vert(Attributes IN)
            {
                Varyings OUT;
                OUT.posCS = TransformObjectToHClip(IN.posOS.xyz);
                OUT.uv = IN.uv;
                return OUT;
            }

            half4 Frag(Varyings IN) : SV_Target
            {
                half4 tex = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, IN.uv);

                // Flicker — random-ish using sine
                float flicker = 1.0 - _FlickerAmount * abs(sin(_Time.y * _FlickerSpeed + 3.7));
                float intensity = _EmissionIntensity * flicker;

                half4 emission = _EmissionColor * intensity * tex.a;
                return half4(tex.rgb + emission.rgb, 1.0);
            }
            ENDHLSL
        }
    }
}
