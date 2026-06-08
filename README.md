# 🏭 IoT Warehouse Automation System

A real-time warehouse package tracking system powered by ESP32 BLE beacons, React, and Firebase. Track packages in real-time, verify deliveries with Bluetooth scanning, and manage your logistics operations through an intuitive multi-portal interface.

📖 **[Read the full blog post](https://medium.com/@amitbartwal008/warehouse-automation-how-iot-real-time-tracking-are-transforming-logistics-669beeb8fb8a)** to learn more about the technology behind this project.

## ✨ Features

- **📍 Real-time Tracking**: Monitor package locations using ESP32 BLE scanners and beacons
- **🔄 Multi-Portal Interface**: Separate portals for senders, receivers, and warehouse monitoring
- **🔥 Firebase Integration**: Real-time database updates with automatic synchronization
- **📡 Bluetooth Verification**: Verify package presence using BLE scanning
- **🎨 Modern UI**: Responsive, professional interface built with React and Tailwind CSS
- **⚡ Live Updates**: Watch package status change in real-time as devices are detected
- **📊 Analytics Dashboard**: Track shipments, delivery status, and warehouse activity

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS 3.4
- **Backend**: Firebase (Realtime Database, Authentication)
- **Routing**: React Router DOM 7
- **Icons**: Lucide React
- **Hardware**: ESP32 (Master and Slave devices)
- **Communication Protocol**: Bluetooth Low Energy (BLE)

## 🔌 ESP32 Integration

The system uses ESP32 devices for Bluetooth Low Energy (BLE) communication:

- **ESP32 Master**: Acts as a BLE scanner that detects all slave devices in range
- **ESP32 Slaves**: BLE beacons attached to physical packages/products

How it works:

1. Master ESP32 continuously scans for BLE devices
2. When slaves are detected, Master updates Firebase with device presence
3. React frontend subscribes to Firebase for real-time updates
4. Package status automatically updates based on device detection

See [`ESP32_MASTER_TRIGGERED.ino`](ESP32_MASTER_TRIGGERED.ino) and [`ESP32_TRIGGER_UPDATE.md`](ESP32_TRIGGER_UPDATE.md) for detailed implementation instructions.

## 📱 Application Features

### 🏠 Home Page

- Landing page with overview of the system
- Quick navigation to all portals
- Feature highlights and system capabilities

### 📦 Warehouse Tracker

- **Real-time scanner status**: Monitor ESP32 Master connectivity
- **Live detection cards**: See currently detected BLE devices
- **Detection history**: Complete log of all device detections with timestamps

### 📤 Sender Portal

- **Create shipments**: Add package details, assign receivers, and associate ESP32 devices
- **Track shipments**: View all sent packages and their current status
- **Device assignment**: Link ESP32 slave beacons to specific packages

### 📥 Receiver Portal

- **View incoming packages**: See all products assigned to you
- **Bluetooth verification**: Trigger BLE scan to verify package presence
- **Mark as received**: Confirm delivery and update package status
- **Real-time status**: Automatic updates as packages move through the warehouse


### Security Rules

Configure your Firebase Realtime Database rules according to your security requirements. For development:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

For production, implement more granular rules based on user roles and data ownership.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Amit Bartwal**

- Blog: [Medium Article](https://medium.com/@amitbartwal008/warehouse-automation-how-iot-real-time-tracking-are-transforming-logistics-669beeb8fb8a)
- GitHub: [@abrtwcom](https://github.com/abrtwcom)

## 📞 Support

If you encounter any issues or have questions:

- Open an [issue](https://github.com/abrtwcom/warehose-automation/issues)
- Read the [documentation](https://github.com/abrtwcom/warehose-automation/wiki)
- Check existing issues for solutions

---

**⭐ If you find this project useful, please consider giving it a star!**
