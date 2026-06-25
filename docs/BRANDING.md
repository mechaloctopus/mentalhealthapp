# Branding — Mended Light

MoodSignal is a **Mended Light** app (Mended Light is the studio/parent brand).
The full brand guide is cloned into [`/branding`](../branding) (logos, fonts, style guide PDF).

## Logo
- **Mark:** a stylized **flame** in a violet → indigo → blue gradient.
- **Wordmark:** "Mended Light" in an elegant serif, beside or beneath the flame.
- In-repo assets: `branding/PNG Logo/` (full-color, reversed, and B/W, horizontal & vertical),
  `branding/AI Logo/` (vector source), `branding/Style Guide/ML_StyleGuide_2022.pdf`.
  Use the **Reversed** variants on dark backgrounds.

## Colour palette (exact, from the 2022 Style Guide)
| Token | Hex | Use |
|---|---|---|
| Violet | `#80237B` | primary brand / flame top |
| Indigo | `#1F3277` | flame mid / deep accent |
| Deep teal | `#064559` | shadow / depth |
| Blue | `#3085AC` | secondary accent / flame base |
| White | `#FFFFFF` | reversed logo, light text |

In-app these are adapted for our premium **dark** canvas (brighter tints for contrast)
while keeping the violet→blue flame identity. See `src/theme/theme.ts` (`colors.violet`,
`colors.indigo`, `colors.brandBlue`, `gradients.flame`).

## Typography (from the guide)
- **Headers / display:** **Alegreya SC** (small-caps serif). *(Noyh, Permanent Marker,
  Alegreya SC are also used for social-media marketing headers.)*
- **Body / UI:** **Open Sans** (web/body). *(Glacial Indifference for course workbooks.)*
- **Serif body / quotes:** **Alegreya** (pairs with Alegreya SC).
- **Script accent:** **Aire Bold Pro** (`branding/.../AireBoldPro.otf`) — logo/flourishes only.

In-app: `font.display` = Alegreya SC, `font.serif` = Alegreya, `font.sans` = Open Sans.

## Snazz preserved
All motion/effects (animated canvas, auras, glass-morphism, haptics, the flame brand mark)
are retained — branding is layered on top of the existing feel, not in place of it.
