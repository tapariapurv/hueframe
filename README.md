<p align="center"><img src="logo.svg" width="72" alt="Hueframe logo"></p>
<h1 align="center">Hueframe</h1>
<p align="center">Generate 4K–8K wallpapers for desktop, iPad and iPhone — in any colour, matched to your device.</p>

## Features

- **30 generative styles**: hills, mountains, forest, aurora, synthwave, planet, city, low-poly, flow fields, Bauhaus and more. Every style has infinite variations.
- **Live previews** on a laptop, an iPad and an iPhone, including the lock-screen clock.
- **Colour matching**: 24 palettes, a colour wheel, hex, RGB and HSL inputs, a screen-wide eyedropper (Chrome/Edge), and finish colours for popular devices (MacBook Air Sky Blue, iPhone 17 Pro Cosmic Orange, …).
- **Exports up to 8K**: 7680×4320 desktop, 2640×5736 iPhone, 4128×5504 iPad, as lossless PNG.
- **Share links**: every wallpaper is a URL you can copy and send.
- Light and dark themes, keyboard shortcuts (`Space` for a new variation, `←` `→` to switch styles).

## Run locally

No build step and no dependencies. Open `index.html`, or serve the folder:

```sh
npx serve .
```

## Project structure

| File | Purpose |
| --- | --- |
| `index.html` | Markup and styles |
| `engine.js` | Palettes, colour maths and the 30 canvas styles |
| `app.js` | Discover page, editor, colour picker, export |
| `logo.svg` | Logo and favicon |

## Adding a style

Append `['Name', K => { ... }]` to `STY` in `engine.js`. `K` gives you the canvas context `c`, size `W`/`H`, unit `u` (shorter side), seeded random `r()`, noise `n1`/`n2`, and `col(t, alpha)` returns the palette colour at `t` from 0 (dark) to 1 (light).

## Deploy

Static site, deploys to Vercel with zero config.

## Notes

- iOS Safari limits canvas size, so 6K/8K exports may fail on iPhone/iPad. Use 4K there.
- Device finish colours are approximations.

## License

MIT
