# Design Specification: Momentum-style Dashboard Overlay

This document specifies the layout, aesthetics, and implementation details for the **Dashboard Overlay** feature, inspired by the popular **Momentum** Chrome extension.

---

## 1. UI Layout Wireframe

### Header Button Position
A centered button `🌅 Dashboard` (or an icon like `👁`) is placed at the top-center of the header.

```
+-----------------------------------------------------------------------------------------------------------------+
| ☰ logo  JSON Viewer & Formatter                   [ 🌅 Dashboard ]                                 Toolbar Area |
+-----------------------------------------------------------------------------------------------------------------+
```

### Fullscreen Dashboard Overlay (Momentum Style)
When toggled, a fullscreen overlay slides in. It displays a nature landscape wallpaper, a large digital clock, and a friendly greeting, with a toggle close button at the bottom.

```
===================================================================================================================
                                            DASHBOARD OVERLAY (Fullscreen)
                        (Background: High-quality nature photography or soft CSS gradient)
===================================================================================================================






                                                   16:05
                                           Good afternoon, Kitti.
                                     "Focus on being productive, not busy."






                                               [ ✕ Close Dashboard ]
===================================================================================================================
```

---

## 2. Visual Design & CSS Architecture (Compact Light Theme Integration)

* **Dashboard Wrapper**:
  ```css
  .dashboard-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 40px 20px;
    color: #ffffff;
    background: linear-gradient(135deg, #1e293b, #0f172a); /* Default fallback gradient */
    background-size: cover;
    background-position: center;
    opacity: 0;
    pointer-events: none;
    transform: translateY(-20px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  
  .dashboard-overlay.active {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }
  ```

* **Background Options**:
  * **Online Mode**: Loads a high-quality landscape photo from Unsplash CDN (cached locally).
  * **Offline Fallback**: Displays a smooth, modern CSS linear-gradient (e.g. dusk to midnight blue) to maintain the clean aesthetic without network lag.

* **Digital Clock & Greeting**:
  * **Clock**: A large `120px` font size monospace or clean sans-serif text (e.g., `16:05`) placed in the exact center of the screen, with a subtle text-shadow for readability on bright images.
  * **Greeting**: Displayed below the clock in `24px` size, dynamically reading: "Good morning", "Good afternoon", or "Good evening" followed by the user's name (customizable).
  * **Daily Quote**: A small, light-grey italicized quote at the bottom (e.g., *"Simplicity is the ultimate sophistication"*).

* **Close Toggle (Bottom Pill)**:
  * A semi-transparent capsule button (`background: rgba(255, 255, 255, 0.15)`) at the bottom of the screen. Hovering over it increases opacity, and clicking it hides the dashboard.

---

## 3. Interactive Behaviors & Logic

1. **Digital Clock Updates**: A JavaScript `setInterval` timer updates the clock every second, showing hours and minutes in 24-hour format (e.g., `15:45`).
2. **Dynamic Greeting**: The greeting string matches the local system time:
   * `05:00 - 11:59`: "Good morning"
   * `12:00 - 16:59`: "Good afternoon"
   * `17:00 - 21:59`: "Good evening"
   * `22:00 - 04:59`: "Good night"
3. **Toggle Event**: Clicking the button in the header opens it. Clicking the capsule button at the bottom, or pressing `Escape`, closes it.
