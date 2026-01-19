import { Package, Calendar, CheckCircle2, XCircle, Clock, User, Tag } from "lucide-react";
import { formatDateTime } from "../../utils/formatters";
import StatusBadge from "../common/StatusBadge";

export default function ProductList({
  products,
  onMarkReceived,
  currentUserEmail,
}) {
  if (!products || products.length === 0) {
    return (
      <div className="rounded-2xl p-8 border"
           style={{ background: 'var(--color-panel)', borderColor: 'var(--divider)' }}>
        <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
          <Package className="text-blue-400" size={28} />
          Incoming Products
        </h2>
        <div className="text-center py-12">
          <Package size={64} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--highlight)' }} />
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            No products assigned to you yet
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            Products will appear here once senders create shipments for you
          </p>
        </div>
      </div>
    );
  }

  // Filter to only show products for this receiver that are not irrelevant
  const filteredProducts = products.filter(
    (p) => p.receiver_email === currentUserEmail && p.status !== "irrelevant"
  );

  if (filteredProducts.length === 0) {
    return (
      <div className="rounded-2xl p-8 border"
           style={{ background: 'var(--color-panel)', borderColor: 'var(--divider)' }}>
        <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
          <Package className="text-blue-400" size={28} />
          Incoming Products
        </h2>
        <div className="text-center py-12">
          <Package size={64} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--highlight)' }} />
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            No products assigned to you
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-8 border"
         style={{ background: 'var(--color-panel)', borderColor: 'var(--divider)' }}>
      <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
        <Package className="text-blue-400" size={28} />
        Incoming Products
        <span className="ml-auto text-sm px-3 py-1 rounded-full"
              style={{ background: 'var(--primary-start)', color: 'white' }}>
          {filteredProducts.length} items
        </span>
      </h2>
      <div className="space-y-4">
        {filteredProducts.map((product) => {
          const canMarkReceived =
            product.status === "present" && product.status !== "received";

          return (
            <div
              key={product.id}
              className={`group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-lg ${
                product.status === "received"
                  ? "bg-green-900/10 border-green-500/30"
                  : "bg-gray-800/30 border-gray-700/50 hover:border-gray-600"
              }`}
            >
              {/* Background Icon */}
              <div className="absolute -right-4 -top-4 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity">
                <Package size={128} />
              </div>

              <div className="relative p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                           style={{ background: 'var(--primary-start)' }}>
                        <Package size={20} className="text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">
                        {product.product_name}
                      </h3>
                      <StatusBadge status={product.status} />
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <Tag size={14} />
                        ID: {product.product_id || product.id}
                      </span>
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <Clock size={14} />
                        Device: {product.device_name}
                      </span>
                    </div>
                  </div>
                  {product.status === "present" && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400">
                      <CheckCircle2 size={18} />
                      <span className="text-sm font-medium">Detected</span>
                    </div>
                  )}
                  {product.status === "missing" && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400">
                      <XCircle size={18} />
                      <span className="text-sm font-medium">Not Found</span>
                    </div>
                  )}
                  {product.status === "received" && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                      <CheckCircle2 size={18} />
                      <span className="text-sm font-medium">Received</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-300">
                    <User size={16} className="text-gray-500" />
                    <span>From: {product.sender_name || product.sender_email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar size={16} className="text-gray-500" />
                    <span>Shipped: {formatDateTime(product.shipment_date)}</span>
                  </div>
                  {product.received_date && (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle2 size={16} />
                      <span>Received: {formatDateTime(product.received_date)}</span>
                    </div>
                  )}
                </div>

                {product.notes && (
                  <div className="mb-4 pt-4 border-t border-gray-700/50">
                    <p className="text-sm">
                      <span className="font-medium text-gray-300">Notes:</span>{" "}
                      <span style={{ color: 'var(--text-secondary)' }}>{product.notes}</span>
                    </p>
                  </div>
                )}

                {canMarkReceived && (
                  <div className="pt-4 border-t border-gray-700/50">
                    <button
                      onClick={() => onMarkReceived(product)}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-white transition-all duration-300 flex items-center gap-2 justify-center hover:scale-105 active:scale-95"
                      style={{ 
                        background: 'linear-gradient(135deg, var(--color-success), #059669)',
                        boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <CheckCircle2 size={18} />
                      Mark as Received
                    </button>
                  </div>
                )}

                {product.status === "received" && (
                  <div className="pt-4 border-t border-gray-700/50">
                    <div className="flex items-center gap-2 justify-center text-green-400">
                      <CheckCircle2 size={20} />
                      <span className="font-medium">Package successfully received</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
