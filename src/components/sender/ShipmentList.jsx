import { Package, Calendar, Mail, User, ArrowRight, CheckCircle, Clock, XCircle } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';
import StatusBadge from '../common/StatusBadge';

export default function ShipmentList({ shipments, loading }) {
  if (loading) {
    return (
      <div className="rounded-2xl p-8 border"
           style={{ background: 'var(--color-panel)', borderColor: 'var(--divider)' }}>
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
          <Package className="text-blue-400" size={28} />
          My Shipments
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 rounded-xl animate-pulse"
                 style={{ background: 'var(--color-card)' }}></div>
          ))}
        </div>
      </div>
    );
  }

  if (!shipments || shipments.length === 0) {
    return (
      <div className="rounded-2xl p-8 border"
           style={{ background: 'var(--color-panel)', borderColor: 'var(--divider)' }}>
        <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
          <Package className="text-blue-400" size={28} />
          My Shipments
        </h2>
        <div className="text-center py-12">
          <Package size={64} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--highlight)' }} />
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            No shipments created yet
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            Create your first shipment using the form on the left
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
        My Shipments
        <span className="ml-auto text-sm px-3 py-1 rounded-full"
              style={{ background: 'var(--primary-start)', color: 'white' }}>
          {shipments.length} items
        </span>
      </h2>
      <div className="space-y-4">
        {shipments.map((shipment) => (
          <div
            key={shipment.id}
            className="group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-lg hover:border-gray-600"
            style={{ background: 'var(--color-card)', borderColor: 'var(--divider)' }}
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
                         style={{ background: 'linear-gradient(135deg, var(--primary-start), var(--highlight))' }}>
                      <Package size={20} className="text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      {shipment.product_name}
                    </h3>
                    <StatusBadge status={shipment.status} />
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-1.5 text-gray-400">
                      <Clock size={14} />
                      ID: {shipment.product_id || shipment.id}
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-400">
                      <ArrowRight size={14} />
                      Device: {shipment.device_name}
                    </span>
                  </div>
                </div>
                
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  {shipment.status === 'received' && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400">
                      <CheckCircle size={18} />
                      <span className="text-sm font-medium">Delivered</span>
                    </div>
                  )}
                  {shipment.status === 'sent' && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                      <Clock size={18} />
                      <span className="text-sm font-medium">In Transit</span>
                    </div>
                  )}
                  {shipment.status === 'missing' && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400">
                      <XCircle size={18} />
                      <span className="text-sm font-medium">Missing</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-500/20">
                    <User size={16} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">To</p>
                    <p className="text-sm text-white">{shipment.receiver_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/20">
                    <Mail size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-white truncate max-w-[200px]">{shipment.receiver_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500/20">
                    <Calendar size={16} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Shipped</p>
                    <p className="text-sm text-white">{formatDateTime(shipment.shipment_date)}</p>
                  </div>
                </div>
                {shipment.received_date && (
                  <div className="flex items-center gap-3 text-green-400">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-500/20">
                      <CheckCircle size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-green-400/70">Received</p>
                      <p className="text-sm font-medium">{formatDateTime(shipment.received_date)}</p>
                    </div>
                  </div>
                )}
              </div>

              {shipment.notes && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--divider)' }}>
                  <p className="text-sm">
                    <span className="font-medium text-gray-300">Notes:</span>{" "}
                    <span style={{ color: 'var(--text-secondary)' }}>{shipment.notes}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
