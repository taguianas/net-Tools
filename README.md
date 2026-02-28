# NetTools — Network Engineering Toolbox

> A comprehensive, privacy-first network engineering toolbox that runs entirely in your browser.
> No backend. No data transmission. No compromise.

---

## Overview

NetTools is a professional-grade collection of network utilities designed for network engineers, IT administrators, security teams, and students. Every calculation, conversion, and analysis is performed client-side using JavaScript — your data never leaves your device.

---

## Features

- **100% Client-Side** — All computations run in the browser. No server, no latency, no data leakage.
- **Offline Capable** — Works without an internet connection once loaded. Ideal for air-gapped and restricted environments.
- **Privacy First** — Zero telemetry, zero analytics, zero cookies beyond localStorage for your own preferences.
- **PWA Ready** — Installable as a Progressive Web App for a native-like experience.
- **Dark / Light Mode** — Reactive theme switching with no flash or glitch.
- **Favorites & History** — Pin your most-used tools and access recent sessions instantly.
- **Command Palette** — `Ctrl+K` / `Cmd+K` to jump to any tool instantly.
- **Export / Import** — Backup and restore all your settings and history as a JSON file.

---

## Included Tools

### Core Tools
| Tool | Description |
|------|-------------|
| **Subnet Calculator** | IPv4/IPv6 subnet breakdown — network/host/broadcast addresses, wildcard masks, usable hosts |
| **VLSM Planner** | Variable Length Subnet Masking — allocate subnets by required host count |
| **CIDR Aggregator** | Aggregate multiple CIDR blocks into the smallest supernet |
| **IP Utilities** | IP address format conversions, validation, and analysis |
| **Binary Converter** | Convert IP addresses to binary, hex, decimal, and dotted notation |

### Planning
| Tool | Description |
|------|-------------|
| **VLAN Planner** | Design and document VLAN layouts with range allocation |
| **MTU Calculator** | Calculate MTU overhead for various encapsulation protocols |
| **Bandwidth Calculator** | Convert between bandwidth units and estimate transfer times |
| **QoS Calculator** | Calculate DSCP/CoS markings and queue bandwidth allocations |
| **Packet Analyzer** | Analyze protocol overhead and effective payload ratios |
| **Routing Config** | Generate static and dynamic routing configuration snippets |
| **WiFi Analyzer** | Compare 2.4 GHz / 5 GHz channels and non-overlapping channel planning |
| **IPv6 Generator** | Generate, expand, compress, and validate IPv6 addresses |

### Testing
| Tool | Description |
|------|-------------|
| **Port Scanner** | Simulate port scanning and check common service ports |
| **DNS Lookup** | DNS-over-HTTPS lookups (A, AAAA, MX, TXT, CNAME, NS records) |
| **Ping Tool** | ICMP-style reachability simulation and latency estimation |

### Security
| Tool | Description |
|------|-------------|
| **ACL/Firewall Builder** | Build Cisco ACL or iptables rules with a visual editor |
| **Password Tools** | Generate secure passwords, passphrases, and compute common hashes |

### Visualization
| Tool | Description |
|------|-------------|
| **Visual Subnet Map** | Interactive graphical subnet tree and allocation map |

### Reference
| Tool | Description |
|------|-------------|
| **MAC/OUI Lookup** | Look up vendor information from MAC address OUI prefix |
| **Port Reference** | Comprehensive well-known and registered port number reference |
| **Documentation** | Built-in networking documentation and protocol references |
| **Config Templates** | Reusable device configuration templates (Cisco, MikroTik, Linux) |

### Utilities
| Tool | Description |
|------|-------------|
| **Batch Processor** | Process multiple subnets or IPs in bulk |
| **Troubleshooting** | Guided network troubleshooting checklists and flowcharts |

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Build Tool | Vite (rolldown-vite) |
| Language | TypeScript |
| Styling | Tailwind CSS 3 + shadcn/ui |
| Routing | React Router v7 |
| Animations | Framer Motion |
| Icons | Lucide React |
| Notifications | Sonner |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd net-tools

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
```

The compiled output will be in the `dist/` folder. Serve it with any static file server.

```bash
# Preview the production build locally
npm run preview
```

---

## Usage

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` / `Cmd+K` | Open command palette |
| `Esc` | Close modals / command palette |
| `↑ ↓` | Navigate command palette results |

### Favorites

Click the star icon on any tool page (or in the favorites bar) to pin a tool for quick access. Favorites appear in the quick-access bar at the top of every page.

### Data Export / Import

Go to **Settings → Data Management → Export Data** to download a full backup of your favorites, history, and preferences as a `.json` file. Import it on any device using **Import Data**.

---

## Privacy

NetTools is built with privacy as its foundation:

- No backend servers — runs purely client-side
- No data transmission — your inputs never leave your device
- No analytics or tracking of any kind
- No cookies — only `localStorage` for your own preferences (stays local)
- No external API calls — except optional DNS lookups (DoH) which you initiate and control

Perfect for security-conscious organizations, air-gapped networks, and anyone who values data privacy.

---

## Project Structure

```
src/
├── Pages/              # Tool pages (one file per tool)
├── components/
│   ├── features/       # Layout-level features (CommandPalette, FavoritesBar, QuickCalc, …)
│   ├── tools/          # Shared tool UI components (ToolPageWrapper, ResultCard, …)
│   ├── ui/             # shadcn/ui base components (Button, Input, Dialog, …)
│   └── utils/          # Utility functions and localStorage helpers
├── lib/
│   ├── utils.ts        # cn(), createPageUrl() helpers
│   └── useTheme.ts     # Reactive dark mode hook (MutationObserver-based)
├── App.tsx             # Route definitions (React Router v7 nested routes)
├── Layout.tsx          # App shell (sidebar, header, favorites bar, toaster)
└── index.css           # Global styles and Tailwind base layers
```

---

## Author

**Anas TAGUI**

Designed and built NetTools to give network engineers a fast, private, and offline-capable workspace — no cloud dependencies, no data collection, just the tools you need.

---

## License

MIT — free to use, modify, and distribute.
