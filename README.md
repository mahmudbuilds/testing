# Aetheris Dynamics — Sovereign 3D Orbital Transport

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-00F0FF?style=for-the-badge&logo=github)](https://mahmudbuilds.github.io/testing/)
![Three.js](https://img.shields.io/badge/Three.js-r187-black?style=flat-square&logo=three.js)
![Vite](https://img.shields.io/badge/Vite-v8.3-646CFF?style=flat-square&logo=vite)
![Web Audio API](https://img.shields.io/badge/Web%20Audio-Native%20Synth-00F0FF?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

> 🌐 **Live Website**: **[https://mahmudbuilds.github.io/testing/](https://mahmudbuilds.github.io/testing/)**

An ultra-high-fidelity interactive 3D landing page and flight simulator for **Aetheris Dynamics**, pioneering autonomous deep-space transport and next-generation magnetoplasmadynamic (MPD) solid-state ion propulsion.

---

## 🚀 Key Highlights & 3D Engineering

- **Procedural 3D Spacecraft (`Aetheris Sovereign Mk IV`)**:
  - Physically based metallic & roughness materials (`MeshStandardMaterial`) with titanium-aerogel hull plates, deployable crystalline photovoltaic arrays, and an equatorial orbital sensor gyro.
  - Interactive live cockpit canopy with optical refraction.
- **Dynamic Plasma Thruster Particles**:
  - Continuous 500+ ion particle stream with real-time velocity, turbulence, and decay models.
  - PointLight illumination pulsing synchronously with plasma exhaust oscillations.
- **Interactive 3D Telemetry Studio**:
  - 4 cinematic camera perspectives: `Orbit`, `Avionics`, `Thruster Core`, and `Solar Wings`.
  - Holographic Wireframe matrix mode toggle.
  - Throttle Afterburner mode with camera shake, high-density particle velocity, and sound FX.
  - Solar Dawn vs Deep Void lighting toggle.
- **Native Web Audio Synthesizer**:
  - Pure procedural sound design using the native Web Audio API — zero external mp3/wav audio assets required.
  - Ambient deep-space sub-bass rumble, mechanical UI clicks, and filtered engine ignition roar.
- **Real-Time Mission & Payload Simulator**:
  - Computes Delta-V requirements, transit durations, specific $/kg cost, and mission investment based on payload mass and orbital destinations (LEO, GEO, Lunar Gateway, Mars Hohmann Transfer).
- **Responsive & Accessible Design System**:
  - Modern typography hierarchy with `Space Grotesk`, `Plus Jakarta Sans`, and `JetBrains Mono`.
  - Zero cliché tropes: no purple glow, no arbitrary grids, function-driven telemetry layout.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **3D Engine** | Three.js r187 (WebGL, ACESFilmicToneMapping, PBR) |
| **Styling** | Precision Vanilla CSS Design System with custom properties |
| **Audio** | Native Web Audio API (Oscillators, BiquadFilters, GainNodes) |
| **Build Tool** | Vite 8 |
| **Markup** | Semantic HTML5 with complete OpenGraph & SEO meta tags |

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/mahmudbuilds/testing.git
cd testing

# Install dependencies
npm install

# Start the local development server with hot module reload
npm run dev
```

### Production Build

```bash
# Build optimized production bundle to /dist
npm run build

# Preview the production build locally
npm run preview
```

---

## 📂 Project Structure

```
testing/
├── index.html          # Main HTML5 entry document & HUD structure
├── package.json        # Dependencies and build scripts
├── vite.config.js      # Vite build configuration
├── src/
│   ├── main.js         # Application orchestrator, telemetry & simulator
│   ├── scene.js        # Three.js 3D world, spacecraft model, and particles
│   ├── audio.js        # Procedural Web Audio synthesizer engine
│   └── style.css       # Complete vanilla CSS design system
└── dist/               # Production build output
```

---

## 📜 License

MIT License © 2026 Aetheris Dynamics Corp.
