<div align="center">

# 🌐 NetTools
### Next-Gen Network Engineering Toolbox

**🔴 [View Live Demo](https://net-tools-eight.vercel.app/)** &nbsp;|&nbsp; **⚙️ [Installation & Setup](#-getting-started)**

<br/>

![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Privacy](https://img.shields.io/badge/Privacy-100%25_Client--Side-cyan?style=for-the-badge)
![Maintained](https://img.shields.io/badge/Maintained-Yes-success?style=for-the-badge)
![Built With](https://img.shields.io/badge/Built_With-React_19-61DAFB?style=for-the-badge&logo=react)

</div>

---

## 📖 About The Project

**NetTools** is a professional-grade network engineering toolbox that runs **entirely in your browser**. Designed for network engineers, IT administrators, security teams, and students : it provides 27 powerful tools with zero data transmission, zero backend servers, and zero compromise on privacy.

> Every calculation, conversion, and analysis happens locally on your device. Your network data never leaves your machine.

### ✨ Why NetTools?

- ⚡ **Instant results** : No API calls, no waiting, pure client-side computation
- 🔒 **Privacy first** : Zero telemetry, zero analytics, zero data leakage
- 📡 **Works offline** : Perfect for air-gapped networks and restricted environments
- 🎨 **Beautiful UI** : Dark/light mode, animations, responsive design
- 📌 **Smart workflow** : Favorites, history, command palette (`Ctrl+K`), quick calculator

---

## 🛠️ Tools Included

<details>
<summary><b>🔵 Core Tools (5)</b></summary>

| Tool | Description |
|------|-------------|
| **Subnet Calculator** | IPv4/IPv6 breakdown : network, broadcast, wildcard, usable hosts |
| **VLSM Planner** | Allocate subnets by required host count |
| **CIDR Aggregator** | Merge multiple CIDRs into the smallest supernet |
| **IP Utilities** | Format conversions, validation, and IP analysis |
| **Binary Converter** | IP ↔ binary, hex, decimal conversions |

</details>

<details>
<summary><b>🟢 Planning Tools (8)</b></summary>

| Tool | Description |
|------|-------------|
| **VLAN Planner** | Design and document VLAN layouts |
| **MTU Calculator** | Overhead analysis for encapsulation protocols |
| **Bandwidth Calculator** | Unit conversions and transfer time estimation |
| **QoS Calculator** | DSCP/CoS markings and queue allocations |
| **Packet Analyzer** | Protocol overhead and payload ratio analysis |
| **Routing Config** | Static and dynamic routing config generator |
| **WiFi Analyzer** | 2.4/5 GHz channel planning and overlap detection |
| **IPv6 Generator** | Generate, expand, compress, and validate IPv6 |

</details>

<details>
<summary><b>🟡 Testing Tools (3)</b></summary>

| Tool | Description |
|------|-------------|
| **Port Scanner** | Common service port checking |
| **DNS Lookup** | DoH-based A, AAAA, MX, TXT, CNAME, NS lookups |
| **Ping Tool** | Reachability simulation and latency estimation |

</details>

<details>
<summary><b>🔴 Security Tools (2)</b></summary>

| Tool | Description |
|------|-------------|
| **ACL/Firewall Builder** | Cisco ACL and iptables rule generator |
| **Password Tools** | Secure password/passphrase generation and hashing |

</details>

<details>
<summary><b>🟣 Reference & Utilities (9)</b></summary>

| Tool | Description |
|------|-------------|
| **Visual Subnet Map** | Interactive graphical subnet allocation map |
| **MAC/OUI Lookup** | Vendor identification from MAC prefix |
| **Port Reference** | Well-known and registered port database |
| **Documentation** | Built-in networking protocol reference |
| **Config Templates** | Reusable Cisco, MikroTik, Linux templates |
| **Batch Processor** | Bulk subnet and IP processing |
| **Troubleshooting** | Guided checklists and network flowcharts |

</details>

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm v9+

### Installation

```bash
# Clone the repository
git clone https://github.com/taguianas/net-tools.git
cd net-tools

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` / `Cmd+K` | Open command palette |
| `Esc` | Close modals |
| `↑ ↓` | Navigate palette results |
| `Ctrl+/` | Toggle quick calculator |

---

## 🏗️ Tech Stack

<div align="center">

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)

</div>

---

## 🔒 Privacy Commitment

| Feature | Status |
|---------|--------|
| Backend servers | ❌ None |
| Data transmission | ❌ Zero |
| Analytics / tracking | ❌ None |
| Cookies | ❌ None |
| External API calls | ⚠️ Optional DNS-over-HTTPS only |
| Local storage | ✅ Your preferences, stays on device |

---

## 📁 Project Structure

```
src/
├── Pages/              # 27 tool pages
├── components/
│   ├── features/       # CommandPalette, FavoritesBar, QuickCalc...
│   ├── tools/          # ToolPageWrapper, ResultCard...
│   ├── ui/             # Button, Input, Dialog, Tabs, Select...
│   └── utils/          # localStorage helpers
├── lib/
│   ├── utils.ts        # cn(), createPageUrl()
│   └── useTheme.ts     # Reactive dark mode (MutationObserver)
├── App.tsx             # Route definitions
└── Layout.tsx          # App shell
```

---

## 👤 Author

<div align="center">

**Anas TAGUI**

*Designer & Developer of NetTools*

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/taguianas)

</div>

---

## 📄 License

<div align="center">

Distributed under the **MIT License** : free to use, modify, and distribute.

⭐ **Star this repo if you find it useful!**

</div>
