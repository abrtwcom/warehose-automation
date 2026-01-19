import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useProducts } from "../hooks/useProducts";
import { useRealtimeData } from "../hooks/useRealtimeData";
import ShipmentForm from "../components/sender/ShipmentForm";
import ShipmentList from "../components/sender/ShipmentList";
import { Package, ArrowRight, Plus, Truck, CheckCircle } from "lucide-react";

export default function SenderPortal() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { createProduct } = useProducts();
  const [shipments, setShipments] = useState([]);

  // Get all products and filter by sender
  const { data: allProducts } = useRealtimeData("products");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && allProducts) {
      const myShipments = allProducts.filter(
        (p) => p.sender_email === user.email
      );
      // Sort by shipment_date descending
      myShipments.sort(
        (a, b) =>
          new Date(b.shipment_date || b.created_date) -
          new Date(a.shipment_date || a.created_date)
      );
      setShipments(myShipments);
    }
  }, [user, allProducts]);

  const handleCreateShipment = async (formData) => {
    const shipmentData = {
      ...formData,
      sender_email: user.email,
      sender_name: user.full_name || user.email,
      status: "sent",
      shipment_date: new Date().toISOString(),
      created_by: user.email,
    };

    await createProduct(shipmentData);
    alert("Shipment created successfully!");
  };

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

  const stats = {
    total: shipments.length,
    sent: shipments.filter(s => s.status === 'sent').length,
    delivered: shipments.filter(s => s.status === 'received').length,
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10 blur-3xl"
             style={{ background: 'var(--primary-start)' }}></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 rounded-full opacity-10 blur-3xl"
             style={{ background: 'var(--highlight)' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-lg"
               style={{ background: 'linear-gradient(135deg, var(--primary-start), var(--highlight))' }}>
            <Package size={40} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Sender Portal
          </h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Create shipments, track packages, and manage your logistics with real-time IoT tracking
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
               style={{ background: 'var(--color-card)', border: '1px solid var(--divider)' }}>
            <div className="absolute top-0 right-0 w-24 h-24 opacity-10 group-hover:opacity-20 transition-opacity">
              <Package size={80} />
            </div>
            <div className="relative">
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Total Shipments</p>
              <p className="text-4xl font-bold text-white">{stats.total}</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
               style={{ background: 'var(--color-card)', border: '1px solid var(--divider)' }}>
            <div className="absolute top-0 right-0 w-24 h-24 opacity-10 group-hover:opacity-20 transition-opacity">
              <Truck size={80} />
            </div>
            <div className="relative">
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>In Transit</p>
              <p className="text-4xl font-bold" style={{ color: 'var(--primary-start)' }}>{stats.sent}</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
               style={{ background: 'var(--color-card)', border: '1px solid var(--divider)' }}>
            <div className="absolute top-0 right-0 w-24 h-24 opacity-10 group-hover:opacity-20 transition-opacity">
              <CheckCircle size={80} />
            </div>
            <div className="relative">
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Delivered</p>
              <p className="text-4xl font-bold" style={{ color: 'var(--color-success)' }}>{stats.delivered}</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="rounded-2xl p-8 mb-10 border"
             style={{ background: 'var(--color-panel)', borderColor: 'var(--divider)' }}>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <ArrowRight className="text-blue-400" size={28} />
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Create Shipment', desc: 'Fill in package details and assign a BLE beacon device' },
              { step: '2', title: 'Attach Device', desc: 'Physically attach the ESP32 device to your package' },
              { step: '3', title: 'Track Online', desc: 'Monitor your shipment status in real-time dashboard' },
              { step: '4', title: 'Confirmation', desc: 'Receiver verifies and marks package as received' },
            ].map((item, idx) => (
              <div key={idx} className="text-center group">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-lg transition-transform group-hover:scale-110"
                     style={{ background: 'var(--primary-start)' }}>
                  {item.step}
                </div>
                <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <ShipmentForm onSubmit={handleCreateShipment} currentUser={user} />
          <ShipmentList shipments={shipments} />
        </div>
      </div>
    </div>
  );
}
