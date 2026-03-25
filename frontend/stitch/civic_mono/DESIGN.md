# Design System Specification: Civic Clarity

## 1. Overview & Creative North Star
### The Creative North Star: "The Digital Architect"
This design system moves beyond the standard "civic tech" aesthetic—which often feels bureaucratic or overly utilitarian—to embrace the role of an elite, quiet facilitator. Inspired by high-end editorial layouts and modern social interfaces, the system prioritizes **Atmospheric Intelligence**. 

We achieve a "premium" feel not through decoration, but through **intentional restraint**. By utilizing a monochrome-first palette with a singular "Forest Green" anchor, the UI recedes to let civic discourse and data take center stage. The system breaks the rigid "web box" template by using asymmetric white space, purposeful tonal layering, and high-contrast typography scales that feel more like a prestige magazine than a government portal.

---

## 2. Colors & Tonal Logic
The palette is rooted in absolute neutrals to convey stability and objectivity.

### The Monochrome Core
- **Surface & Background:** Use `surface` (#fcf9f8) for the main canvas. This is a "warm white" that reduces eye strain compared to pure hex white.
- **Primary Actions:** Use `primary` (#000000) for high-impact text and primary buttons.
- **The Anchor Accent:** The `tertiary` (#254136) is our "Muted Forest." It is the only color allowed in the UI besides greyscale. Reserve it for "Commit" actions: submitting a proposal, signing a petition, or confirming a resolution.

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for sectioning. They create visual noise and "grid-locking." Instead:
- **Define boundaries** via background shifts. A `surface-container-low` (#f6f3f2) card should sit on a `surface` (#fcf9f8) background.
- **Nesting Hierarchy:** Use the hierarchy of `surface-container` tokens to create depth.
    - *Level 1 (Base):* `surface`
    - *Level 2 (Section):* `surface-container-low`
    - *Level 3 (Content Card):* `surface-container-highest`

### Signature Texture & Depth
While the request avoids heavy gradients, we use **Tonal Bleeds**. For hero sections or primary CTAs, use a subtle transition from `primary` (#000000) to `primary_container` (#3b3b3b). This adds "soul" and prevents the black from feeling like a "dead zone" on the screen.

---

## 3. Typography: Editorial Authority
We use **Inter** as our typographic backbone. The goal is a rhythm that feels both urgent and calm.

- **Display Scale:** Use `display-lg` (3.5rem) with a tight letter-spacing (-0.02em) for high-level civic stats or hero headers.
- **The Hierarchy Gap:** Create "breath" by pairing a `headline-lg` (2rem) title with a `body-md` (0.875rem) description. The drastic size difference emphasizes the importance of the header while keeping the UI clean.
- **Labels:** Use `label-md` (0.75rem) in all-caps with increased letter-spacing (+0.05em) for category tags or metadata. This mimics the look of professional architectural blueprints.

---

## 4. Elevation & Depth
In this design system, depth is a matter of **Tonal Layering**, not structural shadows.

### The Layering Principle
Do not use drop shadows to indicate a card. Instead, stack your tokens:
1. **Background:** `surface` (#fcf9f8)
2. **Layer 1:** `surface_container` (#f0edec) - *Use for large content areas.*
3. **Layer 2:** `surface_container_highest` (#e5e2e1) - *Use for interactive cards.*

### Ambient Shadows
When an element must float (e.g., a Modal or a Floating Action Button), use an "Ambient Lift":
- **Shadow:** 0px 12px 32px rgba(28, 27, 27, 0.06). 
- **The Tint:** Never use pure black shadows. The shadow must be a translucent version of `on_surface` (#1c1b1b) to feel like natural light diffusion.

### The "Ghost Border" Fallback
If an element lacks contrast against its background (e.g., an image on a dark surface), use a **Ghost Border**: `outline_variant` (#c6c6c6) at **15% opacity**.

---

## 5. Components & Interface Elements

### Buttons
- **Primary:** `primary` (#000000) background with `on_primary` (#e2e2e2) text. Corner radius: `md` (0.75rem).
- **Secondary:** `surface_container_highest` (#e5e2e1) background. No border.
- **Tertiary (Critical):** `tertiary` (#254136) background. Used only for the "Final Solve" or "Submit" actions.

### Input Fields
- **Default State:** `surface_container_low` (#f6f3f2) background. No border.
- **Focus State:** 1px "Ghost Border" using `primary` at 20% opacity.
- **Corner Radius:** `sm` (0.25rem) to maintain a professional, slightly sharper "startup" feel.

### Cards & Lists
- **The Rule of Whitespace:** Forbid the use of divider lines. Separate list items using `spacing.4` (1.4rem) of vertical padding and a subtle background shift on hover (`surface_container_high`).
- **Civic Chips:** Use `secondary_container` (#d6d4d3) with `label-sm` typography for status tags (e.g., "In Progress," "Resolved").

### Signature Component: The "Perspective Rail"
For long-form civic proposals, use an asymmetric layout. Place metadata (author, date, status) in a left-aligned "rail" using `body-sm` and `on_surface_variant` (#474747), while the main content occupies the right 60% of the container. This creates a modern, non-template editorial feel.

---

## 6. Do’s and Don’ts

### Do
- **Do** use `spacing.8` (2.75rem) or higher for section margins. Space is a luxury; use it.
- **Do** use `full` (9999px) rounded corners for chips and search bars, but stick to `md` (0.75rem) for cards to maintain structural integrity.
- **Do** prioritize high-contrast text ratios for accessibility. Our monochrome base makes this easy—ensure `on_surface` text always sits on `surface` or `surface-container-lowest`.

### Don’t
- **Don’t** use 100% opaque borders. They clutter the "calm" atmosphere.
- **Don’t** introduce a second accent color. If something needs attention and isn't a "critical action," use bold typography or a heavier greyscale weight.
- **Don’t** use generic "drop shadows." If it doesn't look like it's naturally lifting off the page via color change, it doesn't belong.