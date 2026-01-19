import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, update, get } from "firebase/database";
import { database } from "../firebase/config";
import { useAuth } from "../hooks/useAuth";
import { useProducts } from "../hooks/useProducts";
import { useRealtimeData } from "../hooks/useRealtimeData";
import ProductList from "../components/receiver/ProductList";
import { Radio, Package, ArrowRight, CheckCircle, XCircle, Bluetooth, Shield } from "lucide-react";

export default function ReceiverPortal() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { updateProduct } = useProducts();
  const [isScanning, setIsScanning] = useState(false);

  // Real-time subscriptions
  const { data: allProducts } = useRealtimeData("products");
  const { data: detections } = useRealtimeData("warehouse/detections");
  const { data: scanners } = useRealtimeData("warehouse/scanners");
  // Keep a live view of the current scanner status (ESP32 writes here)
  const { data: currentStatus } = useRealtimeData("warehouse/current_status");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const myProducts =
    allProducts?.filter((p) => p.receiver_email === user?.email) || [];

  // Auto-sync product.status with warehouse/current_status updates coming from ESP32
  // This ensures receiver UI updates automatically when the ESP32 reports present/missing.
  // Inserted: convert currentStatus (array of { id: deviceName, present, last_seen, rssi })
  // into a map and update any products that changed state.
  // NOTE: we avoid changing products that are already marked 'received'.
  useEffect(() => {
    if (!currentStatus || currentStatus.length === 0 || !myProducts) return;

    const statusMap = new Map(currentStatus.map((s) => [s.id, s]));

    myProducts.forEach(async (product) => {
      try {
        if (!product || !product.device_name || product.status === "received")
          return;

        const deviceEntry = statusMap.get(product.device_name);
        // If no entry exists for the device, treat as missing (device not reporting)
        const newStatus =
          deviceEntry && deviceEntry.present ? "present" : "missing";

        if (newStatus !== product.status) {
          await updateProduct(product.id, {
            status: newStatus,
            updated_date: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error("Error syncing product status from current_status:", err);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStatus, allProducts, user]);

  const handleMarkReceived = async (product) => {
    await updateProduct(product.id, {
      status: "received",
      received_date: new Date().toISOString(),
    });
  };

  const simulateBluetoothVerification = async () => {
    setIsScanning(true);

    try {
      // 1. Trigger ESP32 Master to scan all slaves
      // Set trigger_scan flag in Firebase for ESP32 to detect
      const triggerRef = ref(database, "warehouse/scanner/trigger_scan");
      await update(triggerRef, {
        requested: true,
        requested_by: user.email,
        requested_at: new Date().toISOString(),
      });

      // Also update scanner status to active
      const scannerStatusRef = ref(database, "warehouse/scanner");
      await update(scannerStatusRef, {
        status: "scanning",
        last_seen: new Date().toISOString(),
      });

      // 2. Wait for ESP32 to complete scan (ESP32 scans all 3 slaves, takes ~15-20 seconds)
      // Check for new detections every 2 seconds, timeout after 30 seconds
      let scanComplete = false;
      let attempts = 0;
      const maxAttempts = 15; // 30 seconds total
      const scanStartTime = Date.now();

      while (!scanComplete && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        attempts++;

        // Check if new detections have been added (within last 30 seconds)
        const detectionsRef = ref(database, "warehouse/detections");
        const detectionsSnapshot = await get(detectionsRef);
        const allDetections = detectionsSnapshot.val();

        if (allDetections) {
          // Check for recent detections (within last 30 seconds)
          const recentDetections = Object.values(allDetections).filter(
            (detection) => {
              const detectionTime = detection.timestamp
                ? parseInt(detection.timestamp)
                : 0;
              const timeDiff = Date.now() - detectionTime;
              return timeDiff < 30000; // Within last 30 seconds
            }
          );

          if (recentDetections.length > 0) {
            scanComplete = true;
          }
        }
      }

      // 3. Get current status from warehouse/current_status (most reliable)
      const currentStatusRef = ref(database, "warehouse/current_status");
      const currentStatusSnapshot = await get(currentStatusRef);
      const currentStatus = currentStatusSnapshot.val() || {};

      // Also get recent detections for timestamp info
      const detectionsRef = ref(database, "warehouse/detections");
      const detectionsSnapshot = await get(detectionsRef);
      const allDetections = detectionsSnapshot.val() || {};

      // Extract detected device names from current_status
      const detectedDevices = new Set();
      Object.entries(currentStatus).forEach(([deviceName, status]) => {
        if (status.present === true) {
          detectedDevices.add(deviceName);
        }
      });

      // Create a map of device_name -> product for this receiver
      const receiverDeviceMap = new Map();
      myProducts.forEach((product) => {
        if (product.device_name) {
          receiverDeviceMap.set(product.device_name, product);
        }
      });

      // 4. Update product statuses based on detected slaves
      for (const product of myProducts) {
        if (product.status === "received") continue; // Skip already received products

        const deviceName = product.device_name;
        const isDetected = detectedDevices.has(deviceName);

        let newStatus;
        if (isDetected) {
          // Device is detected - check if it belongs to this receiver
          if (receiverDeviceMap.has(deviceName)) {
            newStatus = "present"; // ✅ Correct product detected
          } else {
            newStatus = "irrelevant"; // ⚠️ Detected but not for this receiver
          }
        } else {
          // Device not detected - if it's for this receiver, mark as missing
          if (product.receiver_email === user.email) {
            newStatus = "missing"; // ❌ Expected but not found
          } else {
            newStatus = "irrelevant"; // Not relevant to this receiver
          }
        }

        // Only update if status changed
        if (product.status !== newStatus) {
          await updateProduct(product.id, {
            status: newStatus,
            updated_date: new Date().toISOString(),
          });
        }
      }

      // 5. Reset trigger flag
      await update(triggerRef, { requested: false });
      await update(scannerStatusRef, { status: "online" });

      // Show results
      const presentCount = myProducts.filter(
        (p) => p.status === "present"
      ).length;
      const missingCount = myProducts.filter(
        (p) => p.status === "missing"
      ).length;
      const detectedCount = detectedDevices.size;

      alert(
        `Bluetooth verification complete!\n\nDetected Slaves: ${detectedCount}/3\nYour Packages:\n✓ ${presentCount} Present\n✗ ${missingCount} Missing`
      );
    } catch (error) {
      console.error("Verification error:", error);
      alert("Verification failed. Please try again.\nError: " + error.message);
    } finally {
      setIsScanning(false);
    }
  };

  const presentCount = myProducts.filter((p) => p.status === "present").length;
  const missingCount = myProducts.filter((p) => p.status === "missing").length;
  const receivedCount = myProducts.filter((p) => p.status === "received").length;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto" style={{ borderColor: 'var(--primary-start)' }}></div>
          <p className="mt-4 text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full opacity-10 blur-3xl"
             style={{ background: 'var(--color-success)' }}></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl"
             style={{ background: 'var(--highlight)' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-lg"
               style={{ background: 'linear-gradient(135deg, #10b981, var(--highlight))' }}>
            <Package size={40} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Receiver Portal
          </h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Verify incoming packages with Bluetooth scanning and track your deliveries in real-time
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
               style={{ background: 'var(--color-card)', border: '1px solid var(--divider)' }}>
            <div className="absolute top-0 right-0 w-24 h-24 opacity-10 group-hover:opacity-20 transition-opacity">
              <Package size={80} />
            </div>
            <div className="relative">
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Total Packages</p>
              <p className="text-4xl font-bold text-white">{myProducts.length}</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
               style={{ background: 'var(--color-card)', border: '1px solid var(--divider)' }}>
            <div className="absolute top-0 right-0 w-24 h-24 opacity-10 group-hover:opacity-20 transition-opacity">
              <CheckCircle size={80} />
            </div>
            <div className="relative">
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Present</p>
              <p className="text-4xl font-bold" style={{ color: 'var(--color-success)' }}>{presentCount}</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
               style={{ background: 'var(--color-card)', border: '1px solid var(--divider)' }}>
            <div className="absolute top-0 right-0 w-24 h-24 opacity-10 group-hover:opacity-20 transition-opacity">
              <XCircle size={80} />
            </div>
            <div className="relative">
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Missing</p>
              <p className="text-4xl font-bold" style={{ color: 'var(--color-error)' }}>{missingCount}</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
               style={{ background: 'var(--color-card)', border: '1px solid var(--divider)' }}>
            <div className="absolute top-0 right-0 w-24 h-24 opacity-10 group-hover:opacity-20 transition-opacity">
              <Shield size={80} />
            </div>
            <div className="relative">
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Received</p>
              <p className="text-4xl font-bold text-blue-400">{receivedCount}</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="rounded-2xl p-8 mb-10 border"
             style={{ background: 'var(--color-panel)', borderColor: 'var(--divider)' }}>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <ArrowRight className="text-green-400" size={28} />
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Await Delivery', desc: 'Wait for shipment notification from sender' },
              { step: '2', title: 'Start Scanner', desc: 'Click "Verify Bluetooth" to scan for devices' },
              { step: '3', title: 'Verify Items', desc: 'System detects which packages are present' },
              { step: '4', title: 'Mark Received', desc: 'Confirm and mark packages as received' },
            ].map((item, idx) => (
              <div key={idx} className="text-center group">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-lg transition-transform group-hover:scale-110"
                     style={{ background: 'var(--color-success)' }}>
                  {item.step}
                </div>
                <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bluetooth Verification Section */}
        <div className="rounded-2xl p-8 mb-10 border"
             style={{ background: 'var(--color-panel)', borderColor: 'var(--divider)' }}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                <Bluetooth size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Bluetooth Verification</h2>
                <p className="max-w-xl" style={{ color: 'var(--text-secondary)' }}>
                  Verify which packages are physically present using Bluetooth scanning. 
                  The Master ESP32 will scan all slave devices to detect your packages in real-time.
                </p>
                <div className="flex flex-wrap gap-3 mt-4">
                  <span className="status-badge-present font-medium flex items-center gap-1">
                    <CheckCircle size={14} /> {presentCount} Present
                  </span>
                  <span className="status-badge-missing font-medium flex items-center gap-1">
                    <XCircle size={14} /> {missingCount} Missing
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              {isScanning && (
                <div className="flex items-center gap-2 mb-3 px-4 py-2 rounded-lg"
                     style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2"
                       style={{ borderColor: 'var(--color-success)' }}></div>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-success)' }}>
                    Scanning... Please wait (up to 30s)
                  </span>
                </div>
              )}
              <button
                onClick={simulateBluetoothVerification}
                disabled={isScanning}
                className="w-full lg:w-auto px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                style={{ 
                  background: isScanning 
                    ? 'var(--divider)' 
                    : 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: isScanning ? 'none' : '0 8px 32px rgba(16, 185, 129, 0.3)'
                }}
              >
                <Radio size={22} className={isScanning ? "animate-pulse" : ""} />
                {isScanning ? "Scanning..." : "Verify Bluetooth"}
              </button>
            </div>
          </div>
        </div>

        {/* Product List */}
        <ProductList
          products={myProducts}
          onMarkReceived={handleMarkReceived}
          currentUserEmail={user?.email}
        />
      </div>
    </div>
  );
}
