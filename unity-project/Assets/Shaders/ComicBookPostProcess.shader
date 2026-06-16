// Full-screen halftone + speed lines post-process — Spider-Verse inspired
Shader "BagongLupa/ComicBookPostProcess"
{
    Properties
    {
        _MainTex ("Source", 2D) = "white" {}

        // Halftone
        [Header(Halftone)]
        _HalftoneScale ("Scale", Float) = 80.0
        _HalftoneStrength ("Strength", Range(0,1)) = 0.0
        _HalftoneColor ("Color", Color) = (0.35, 0.0, 0.8, 1)

        // Speed Lines
        [Header(Speed Lines)]
        _SpeedLineAlpha ("Alpha", Range(0,1)) = 0.0
        _SpeedLineCount ("Count", Float) = 60.0
        _SpeedLineColor ("Color", Color) = (0.1, 0.05, 0.2, 1)

        // Impact Frame
        [Header(Impact Frame)]
        _ImpactStrength ("Impact Strength", Range(0,1)) = 0.0
        _ImpactColor ("Impact Color", Color) = (1, 0.1, 0.2, 1)

        // Color grading — push toward Miles Morales palette
        [Header(Color Grade)]
        _Saturation ("Saturation", Range(0,2)) = 1.2
        _Contrast ("Contrast", Range(0,2)) = 1.1
        _PurpleTint ("Purple Shadow Tint", Range(0,1)) = 0.15
    }

    SubShader
    {
        Tags { "RenderType"="Opaque" }
        Cull Off ZWrite Off ZTest Always

        Pass
        {
            CGPROGRAM
            #pragma vertex vert_img
            #pragma fragment frag
            #include "UnityCG.cginc"

            sampler2D _MainTex;
            float _HalftoneScale, _HalftoneStrength;
            float4 _HalftoneColor;
            float _SpeedLineAlpha, _SpeedLineCount;
            float4 _SpeedLineColor;
            float _ImpactStrength;
            float4 _ImpactColor;
            float _Saturation, _Contrast, _PurpleTint;

            float2 Rotate(float2 uv, float angle)
            {
                float c = cos(angle), s = sin(angle);
                return float2(c*uv.x - s*uv.y, s*uv.x + c*uv.y);
            }

            float Halftone(float2 uv, float luma)
            {
                float2 p = uv * _HalftoneScale;
                // Rotate 45° for classic halftone look
                p = Rotate(p - 0.5, 0.785);
                float2 nearest = round(p);
                float dist = length(p - nearest);
                float radius = sqrt(1.0 - luma) * 0.5;
                return step(dist, radius);
            }

            float SpeedLines(float2 uv)
            {
                float2 centered = uv - 0.5;
                float angle = atan2(centered.y, centered.x);
                float lines = frac(angle / (3.14159 * 2.0) * _SpeedLineCount);
                float radial = smoothstep(0.0, 0.05, lines) * smoothstep(0.1, 0.05, lines);
                float vignette = 1.0 - smoothstep(0.1, 0.5, length(centered));
                return radial * vignette;
            }

            float3 ColorGrade(float3 col)
            {
                // Contrast
                col = (col - 0.5) * _Contrast + 0.5;

                // Saturation
                float luma = dot(col, float3(0.299, 0.587, 0.114));
                col = lerp(float3(luma, luma, luma), col, _Saturation);

                // Purple shadow tint — darks push toward purple
                float darkness = 1.0 - saturate(luma * 2.0);
                col = lerp(col, col * float3(0.6, 0.3, 1.0), darkness * _PurpleTint);

                return saturate(col);
            }

            fixed4 frag(v2f_img i) : SV_Target
            {
                fixed4 col = tex2D(_MainTex, i.uv);
                float luma = dot(col.rgb, float3(0.299, 0.587, 0.114));

                // Halftone overlay
                if (_HalftoneStrength > 0.01)
                {
                    float ht = Halftone(i.uv, luma);
                    col.rgb = lerp(col.rgb, _HalftoneColor.rgb, ht * _HalftoneStrength);
                }

                // Speed lines
                if (_SpeedLineAlpha > 0.01)
                {
                    float sl = SpeedLines(i.uv);
                    col.rgb = lerp(col.rgb, _SpeedLineColor.rgb, sl * _SpeedLineAlpha);
                }

                // Impact frame flash
                if (_ImpactStrength > 0.01)
                {
                    float2 edge = abs(i.uv - 0.5) * 2.0;
                    float frame = max(edge.x, edge.y);
                    frame = smoothstep(0.7, 1.0, frame);
                    col.rgb = lerp(col.rgb, _ImpactColor.rgb, frame * _ImpactStrength);
                }

                col.rgb = ColorGrade(col.rgb);
                return col;
            }
            ENDCG
        }
    }
}
