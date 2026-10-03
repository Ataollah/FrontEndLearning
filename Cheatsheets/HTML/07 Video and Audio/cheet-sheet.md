# HTML Video & Audio Cheatsheet

## 🎬 Video Tag

```html
<video 
  src="video.mp4" 
  controls 
  autoplay 
  loop 
  muted 
  poster="thumbnail.jpg"
  width="640" 
  height="360"
  preload="metadata">
</video>
```

### Attributes

| Attribute | Description |
|-----------|-------------|
| `controls` | Shows play/pause, volume, seek bar |
| `autoplay` | Starts playing automatically (needs `muted` in most browsers) |
| `loop` | Repeats video when finished |
| `muted` | Starts with sound off |
| `poster` | Image shown before playback |
| `preload` | `none` \| `metadata` \| `auto` |
| `playsinline` | Prevents fullscreen on iOS |
| `width` / `height` | Dimensions in pixels |

---

## 🔊 Audio Tag

```html
<audio 
  src="audio.mp3" 
  controls 
  autoplay 
  loop 
  muted
  preload="auto">
</audio>
```

| Attribute | Description |
|-----------|-------------|
| `controls` | Shows audio player UI |
| `autoplay` | Plays automatically (often needs `muted`) |
| `loop` | Repeats when finished |
| `muted` | Starts muted |
| `preload` | `none` \| `metadata` \| `auto` |

---

## 📦 Source Tag (Multiple Formats)

Provide multiple formats for browser compatibility — browser picks the first supported one.

```html
<video controls poster="thumb.jpg" width="640">
  <source src="video.webm" type="video/webm">
  <source src="video.mp4"  type="video/mp4">
  <source src="video.ogg"  type="video/ogg">
  Your browser does not support the video tag.
</video>

<audio controls>
  <source src="audio.ogg" type="audio/ogg">
  <source src="audio.mp3" type="audio/mpeg">
  Your browser does not support the audio tag.
</audio>
```

### Format Support

| Format | MIME Type | Notes |
|--------|-----------|-------|
| MP4 (H.264) | `video/mp4` | Best overall support |
| WebM | `video/webm` | Open format, great for web |
| OGG | `video/ogg` | Firefox/Chrome |
| MP3 | `audio/mpeg` | Universal audio |
| OGG Audio | `audio/ogg` | Open format |
| WAV | `audio/wav` | Uncompressed |

**Recommended order:** WebM → MP4 → OGG

---

## 🎯 Common Patterns

**Autoplay background video (silent loop):**
```html
<video autoplay muted loop playsinline poster="bg.jpg">
  <source src="bg.webm" type="video/webm">
  <source src="bg.mp4" type="video/mp4">
</video>
```

**With subtitles/captions:**
```html
<video controls>
  <source src="movie.mp4" type="video/mp4">
  <track src="subs.vtt" kind="subtitles" srclang="en" label="English" default>
</video>
```

**JavaScript control:**
```js
const vid = document.querySelector("video");
vid.play();
vid.pause();
vid.currentTime = 30;   // seek to 30s
vid.volume = 0.5;       // 0.0 – 1.0
vid.muted = true;
```

---

## ⚠️ Key Notes

- **`autoplay` requires `muted`** in Chrome, Safari, Firefox (policy)
- Always include **fallback text** between tags
- Add **`playsinline`** for iOS to prevent forced fullscreen
- Use **`<source>`** for multi-format, **`src`** for single file
- Prefer **WebM + MP4** combo for video, **OGG + MP3** for audio