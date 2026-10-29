# Menu and scroll refinement — 29 October 2026

The supplied screen recording showed mirrored menu text on the reverse of the turning page. The legacy turn used two surfaces at the same depth and assigned a menu texture to the back without reversing its UVs. Stationary and turning pages also used different rest profiles.

## Changes

- The moving leaf now has physically separated opaque front/back surfaces and a stitched perimeter. Independent reverse UVs keep the artwork correctly oriented.
- Its reverse is a wordless palace illustration with a gold seal; menu text is only on the reading face. Stationary pages use the same rest curve as the turning leaf.
- Forward and reverse page plans preserve the correct underlying pages. The curl is prepared before it becomes visible, avoiding a stale initial frame.
- The moving paper casts a shadow but does not receive its own shadow. Lighting is softer and tone-mapped; small Three.js brass lanterns light the plinth.
- Horizontal swipe and arrow-key controls are supported. Vertical/diagonal gestures do not turn pages. The controls stay focusable while a turn is busy; repeated input cannot queue conflicting animations.
- Scroll camera movement is subtle and runs only while the menu is nearby. Texture/GPU initialization is deferred until the menu approaches the viewport.
- The desktop chapter guide provides section jumps and the active location. A top progress line and a “Begin the story” link guide normal scrolling. No scroll hijacking or forced pinning is used.

## Verification

`npm run build` checks JavaScript, assets and section links, then runs the menu regression tests. Tests cover physical face separation, reverse UV orientation, both turn plans, boundaries, opacity and finite geometry throughout 41 positions of the curl.

Local browser checks covered repeated forward/back page turns, keyboard controls, section navigation, active-chapter/progress tracking, a horizontal gesture and a vertical-intent gesture. At 390 px viewport width the page has no horizontal overflow and the chapter rail is hidden.

The UI still honours reduced motion and retains the HTML menu fallback. The actual GPU context-loss path is guarded in code but was not forced during the browser checks.

Files: `public/js/book-leaf.js`, `public/js/menu-book.js`, `public/js/app.js`, `public/css/site.css`, `public/index.html`, `tests/menu-leaf.test.mjs`.
