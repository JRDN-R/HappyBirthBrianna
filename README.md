# Brianna's Birthday Zone

A small, phone-friendly birthday puzzle with the supplied artwork and jump-scare recording. No build tools, installation, external libraries, or external asset services are needed.

## Play

Select **1 → 2 → 3** across the left/right/left buttons. The third selection triggers a 140 ms page glitch, followed immediately by the horror image and audio. The image has animated VHS tracking. The horror scene keeps looping. After 0.9 seconds, a floating **Click here** button appears in the center. Clicking it leaves this page and opens **https://www.amazon.com/g/TR4GP4HNZTAWAT?t=SvL&asin=B07PCMWTSG** in the same browser tab. The scene loops until the link is clicked. Each button plays a short retro square-wave click.

The audio is loaded and decoded before play and unlocked on the first tap. It is a 20-second opening excerpt from the supplied recording (starting at 0.28 seconds), converted to mono 16 kHz / 48 kbps MP3 and boosted 6 dB with peak limiting. Each audio loop has a half-second tail fade before the next impact. The loop continues until replay or leaving the page; it pauses while the page is hidden and resumes when returning. Output volume still follows the visitor's device volume.

Replay, keyboard buttons, background audio pausing, and reduced-motion preferences are supported. There are no Sound or Skip buttons. Mobile viewport and gesture handling discourage page zoom; browser accessibility overrides may still permit it.

## Files

- `index.html` — page markup.
- `style.css` — blue/yellow theme, responsive layout, glow, wiggle, VHS effects.
- `game.js` — three-tap sequence, preload, audio looping/fade, and replay.
- `assets/birthday-banner.jpg` — supplied birthday graphic, unmodified.
- `assets/scare.png` — supplied horror graphic, unmodified; animated on the page with CSS.
- `assets/jumpscare.mp3` — small, lo-fi playback cue.

## Host

Share the page at **https://jrdn-r.github.io/HappyBirthBrianna/**. Its static Open Graph and large-image card metadata select `assets/birthday-banner.jpg`, the same unmodified image used as the page hero. Metadata includes an absolute HTTPS image URL, JPEG type, dimensions, title, and description, so preview services can read it without executing the game. Share the hosted page URL to get this preview; a GitHub repository URL has GitHub's own preview.

Serve the repository root with any static web host. All asset paths are relative, including for a GitHub Pages project site. For GitHub Pages, choose **Settings → Pages → Deploy from a branch → main → / (root)**, if Pages is not already configured. No Actions workflow is required.

For local testing, use a local HTTP server rather than opening `index.html` as a `file://` URL; audio preloading uses `fetch`.

## Adjust timing

`GLITCH_MS` and `REVEAL_BUTTON_MS` are near the top of `game.js`. The scare runs continuously; its audio fade is baked into the loop asset. Edit the birthday heading in `index.html` to change the message.
