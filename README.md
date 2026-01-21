# IoT Logistics Tracking System

A real-time warehouse package tracking system using ESP32 BLE beacons, React, and Firebase.

https://iot-inventory-87709788-95492.firebaseapp.com/

## Features

- **Real-time Tracking**: Monitor package locations using ESP32 BLE scanners and beacons
- **Multi-Portal Interface**: Separate portals for senders, receivers, and warehouse monitoring
- **Firebase Integration**: Real-time database updates with Firebase Realtime Database
- **Bluetooth Verification**: Verify package presence using Bluetooth scanning
- **Responsive UI**: Modern, responsive interface built with React and Tailwind CSS

## Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Realtime Database, Authentication)
- **Routing**: React Router DOM

- **Icons**: Lucide React


## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase project with Realtime Database enabled

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd iot-inventory
```

2. Install dependencies
```bash
npm install
```

3. Configure Firebase
   - Copy `.env.example` to `.env`
   - Add your Firebase credentials to `.env`

4. Start development server
```bash
npm run dev
```

5. Build for production
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Layout.jsx
│   │   └── Sidebar.jsx
│   ├── warehouse/
│   ├── sender/
│   │   ├── ShipmentForm.jsx
│   │   └── ShipmentList.jsx
│   ├── receiver/
│   │   └── ProductList.jsx
│   └── common/
│       └── StatusBadge.jsx
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── WarehouseTracker.jsx
│   ├── SenderPortal.jsx
│   └── ReceiverPortal.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useRealtimeData.js
│   └── useProducts.js
├── firebase/
│   └── config.js
└── utils/
    ├── constants.js
    └── formatters.js
```

## ESP32 Integration

The system works with ESP32 devices:
- **ESP32 Master**: BLE scanner that detects slave devices
- **ESP32 Slave**: BLE beacons attached to packages

See `ESP32_MASTER_TRIGGERED.ino` and `ESP32_TRIGGER_UPDATE.md` for implementation details.

### Home Page
- Landing page with navigation to all portals
<img width="1910" height="782" alt="Screenshot From 2026-01-21 14-26-57" src="https://github.com/user-attachments/assets/987286dd-f998-46e9-b412-5b1518e9a629" />
### Warehouse Tracker
- Real-time display of scanner status
- Live detection cards showing currently detected devices
- Detection history

### Sender Portal
- Create new shipments with package details
- Assign ESP32 devices to packages
- View all sent shipments
  <img width="1904" height="924" alt="Screenshot From 2026-01-19 19-56-42" src="https://github.com/user-attachments/assets/56a1f6e0-3cc1-493b-b498-130d4244f99a" />

### Receiver Portal
- View incoming products assigned to you
- Bluetooth verification to check package presence
- Mark packages as received

<img width="1904" height="924" alt="Screenshot From 2026-01-19 19-57-05" src="https://github.com/user-attachments/assets/7ac858f9-3d53-4c95-a3a7-feac0d6989ec" />

## Firebase Database Rules

Configure your Firebase Realtime Database rules appropriately for your security needs.

## License

MIT
