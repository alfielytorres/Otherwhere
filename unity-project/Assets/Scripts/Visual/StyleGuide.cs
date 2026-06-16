// Miles Morales visual palette — reference these everywhere
// Do not use colors outside this palette without a strong reason
using UnityEngine;

namespace BagongLupa.Visual
{
    public static class StyleGuide
    {
        // Core palette
        public static readonly Color DeepPurple    = new Color(0.12f, 0.02f, 0.30f); // bg shadows
        public static readonly Color ElectricBlue  = new Color(0.00f, 0.53f, 1.00f); // energy
        public static readonly Color NeonPurple    = new Color(0.55f, 0.00f, 1.00f); // primary accent
        public static readonly Color NeonPink      = new Color(1.00f, 0.00f, 0.50f); // highlight
        public static readonly Color HotOrange     = new Color(1.00f, 0.42f, 0.00f); // warning / food
        public static readonly Color NeonGreen     = new Color(0.00f, 1.00f, 0.53f); // health / money earn
        public static readonly Color GoldYellow    = new Color(1.00f, 0.84f, 0.00f); // spiritual / church
        public static readonly Color NearBlack     = new Color(0.05f, 0.03f, 0.08f); // dark surfaces
        public static readonly Color StreetGrey    = new Color(0.22f, 0.20f, 0.25f); // concrete

        // Need type → color mapping
        public static Color GetNeedColor(Player.NeedType need) => need switch
        {
            Player.NeedType.Gutom      => HotOrange,
            Player.NeedType.Lakas      => NeonGreen,
            Player.NeedType.Lipunan    => ElectricBlue,
            Player.NeedType.Kasiyahan  => NeonPink,
            Player.NeedType.Kalinisan  => new Color(0.00f, 0.75f, 1.00f),
            _ => Color.white
        };

        // Typography suggestion: Bold condensed sans-serif
        // Recommended: Bebas Neue, Anton, or Barlow Condensed Bold
        // All caps for headers, sentence case for body
        // White text on dark, never grey-on-grey

        // Graffiti-tag UI element color
        public static readonly Color TagColor = NeonPurple;
    }
}
