# Brianna's Birthday Zone

A small, phone-friendly birthday puzzle with the supplied artwork and jump-scare recording. No build tools, installation, external libraries, or external asset services are needed.

## Play

Select **1 → 2 → 3** across the left/right/left buttons. The third selection triggers a 140 ms page glitch, followed immediately by the horror image and audio. The image has animated VHS tracking. After 5.4 seconds, the page reveals **Happy Birthday, Brianna!**

The audio is loaded and decoded before play and unlocked on the first tap. It is a 3.2-second opening excerpt from the supplied recording (starting at 0.28 seconds), converted to mono 16 kHz / 48 kbps MP3 and boosted 6 dB with peak limiting. The cue has a short tail fade and repeats during the scare; an additional 0.8-second fade ends the scare. Output volume still follows the visitor's device volume.

Mute, skip, replay, keyboard buttons, background-tab cancellation, and reduced-motion preferences are supported. Mobile viewport and gesture handling discourage page zoom; browser accessibility overrides may still permit it.

## Files

- `index.html` — page markup.
- `style.css` — blue/yellow theme, responsive layout, glow, wiggle, VHS effects.
- `game.js` — three-tap sequence, preload, audio looping/fade, and replay.
- `assets/birthday-banner.jpg` — supplied birthday graphic, unmodified.
- `assets/scare.png` — supplied horror graphic, unmodified; animated on the page with CSS.
- `assets/jumpscare.mp3` — small, lo-fi playback cue.

## Host

Serve the repository root with any static web host. All asset paths are relative, including for a GitHub Pages project site. For GitHub Pages, choose **Settings → Pages → Deploy from a branch → main → / (root)**, if Pages is not already configured. No Actions workflow is required.

For local testing, use a local HTTP server rather than opening `index.html` as a `file://` URL; audio preloading uses `fetch`.

## Adjust timing

`GLITCH_MS`, `SCARE_MS`, and `FADE_SECONDS` are near the top of `game.js`. Keep the fade shorter than the scare. Edit the birthday heading in `index.html` to change the message.
