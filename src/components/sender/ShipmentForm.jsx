import { useState } from "react";
import { Package, User, Mail, FileText, Plus, ArrowRight } from "lucide-react";

export default function ShipmentForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    product_name: "",
    product_id: "",
    receiver_email: "",
    receiver_name: "",
    device_name: "ESP32_Slave1",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        product_name: "",
        product_id: "",
        receiver_email: "",
        receiver_name: "",
        device_name: "ESP32_Slave1",
        notes: "",
      });
    } catch (error) {
      console.error("Error creating shipment:", error);
      alert("Failed to create shipment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const deviceOptions = [
    "ESP32_Slave1",
    "ESP32_Slave2",
    "ESP32_Slave3",
    "ESP32_Slave4",
    "ESP32_Slave5",
  ];

  return (
    <div className="rounded-2xl p-8 border"
         style={{ background: 'var(--color-panel)', borderColor: 'var(--divider)' }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
             style={{ background: 'linear-gradient(135deg, var(--primary-start), var(--highlight))' }}>
          <Plus size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Create New Shipment</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Fill in the details to send a package
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Package size={16} className="text-blue-400" />
              Product Name
            </label>
            <input
              type="text"
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ 
                background: 'var(--color-card)', 
                border: '1px solid var(--divider)',
                color: 'white'
              }}
              placeholder="e.g., Dell Laptop XPS 15"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Package size={16} className="text-blue-400" />
              Package ID
            </label>
            <input
              type="text"
              name="product_id"
              value={formData.product_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ 
                background: 'var(--color-card)', 
                border: '1px solid var(--divider)',
                color: 'white'
              }}
              placeholder="e.g., PKG-001"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <User size={16} className="text-green-400" />
              Receiver Name
            </label>
            <input
              type="text"
              name="receiver_name"
              value={formData.receiver_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              style={{ 
                background: 'var(--color-card)', 
                border: '1px solid var(--divider)',
                color: 'white'
              }}
              placeholder="Jane Smith"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Mail size={16} className="text-green-400" />
              Receiver Email
            </label>
            <input
              type="email"
              name="receiver_email"
              value={formData.receiver_email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              style={{ 
                background: 'var(--color-card)', 
                border: '1px solid var(--divider)',
                color: 'white'
              }}
              placeholder="receiver@company.com"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <Package size={16} className="text-purple-400" />
            Device Name (BLE Beacon)
          </label>
          <div className="relative">
            <select
              name="device_name"
              value={formData.device_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl appearance-none transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              style={{ 
                background: 'var(--color-card)', 
                border: '1px solid var(--divider)',
                color: 'white'
              }}
            >
              {deviceOptions.map((device) => (
                <option key={device} value={device} style={{ background: 'var(--color-card)', color: 'white' }}>
                  {device}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <ArrowRight size={16} className="rotate-90 text-gray-400" />
            </div>
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
            Select the ESP32 device attached to this package
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <FileText size={16} className="text-yellow-400" />
            Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
            style={{ 
              background: 'var(--color-card)', 
              border: '1px solid var(--divider)',
              color: 'white'
            }}
            placeholder="Handle with care - fragile electronics"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
          style={{ 
            background: 'linear-gradient(135deg, var(--primary-start), var(--highlight))',
            boxShadow: '0 8px 32px rgba(77, 77, 255, 0.3)'
          }}
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Creating...
            </>
          ) : (
            <>
              <Plus size={20} />
              Create Shipment
            </>
          )}
        </button>
      </form>
    </div>
  );
}
