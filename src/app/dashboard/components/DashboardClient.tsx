'use client';

import { useState } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'warning' | 'success';
}

function MetricCard({ title, value, subtitle, trend, variant = 'default' }: MetricCardProps) {
  const variantClasses = {
    default: 'bg-white border-gray-200',
    warning: 'bg-yellow-50 border-yellow-200',
    success: 'bg-green-50 border-green-200',
  };

  return (
    <div className={`p-6 rounded-lg border ${variantClasses[variant]} shadow-sm`}>
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
      <div className="flex items-baseline gap-2 mt-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {trend && (
          <span className={`text-sm ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </div>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

interface ActivityItem {
  type: 'quote' | 'invoice' | 'message';
  status?: string | null;
  amount?: number;
  role?: string;
  content?: string;
  customerId?: string;
  createdAt?: string | null;
}

interface StockAlert {
  id: string;
  name: string;
  stockQuantity: number | null;
  lowStockThreshold: number | null;
}

interface Customer {
  id: string;
  name: string;
  phoneNumber?: string | null;
}

interface DashboardData {
  business: {
    id: string;
    name: string;
    whatsappNumber: string;
    industry?: string | null;
  };
  metrics: {
    revenueThisMonth: number;
    pendingInvoiceCount: number;
    pendingInvoiceTotal: number;
    openQuotesCount: number;
    openQuotesTotal: number;
  };
  lowStockProducts: StockAlert[];
  recentActivity: ActivityItem[];
  customers: Customer[];
}

function formatTimeAgo(dateString?: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default function DashboardClient({ data }: { data: DashboardData }) {
  const [showSyncStatus, setShowSyncStatus] = useState(true);

  return (
    <div className="min-h-screen">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BP</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">{data.business.name}</h1>
          </div>
          <div className="flex items-center gap-4">
            {showSyncStatus && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Sync: OK
              </span>
            )}
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Business Health Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Revenue This Month"
            value={formatCurrency(data.metrics.revenueThisMonth)}
            trend="up"
            variant="success"
          />
          <MetricCard
            title="Pending Invoices"
            value={formatCurrency(data.metrics.pendingInvoiceTotal)}
            subtitle={`${data.metrics.pendingInvoiceCount} Unpaid`}
            variant="warning"
          />
          <MetricCard
            title="Open Quotes"
            value={formatCurrency(data.metrics.openQuotesTotal)}
            subtitle={`${data.metrics.openQuotesCount} Pending`}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {data.recentActivity.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent activity</p>
              ) : (
                data.recentActivity.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.type === 'invoice' ? 'bg-blue-100 text-blue-600' :
                      item.type === 'quote' ? 'bg-purple-100 text-purple-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {item.type === 'invoice' ? '$' : item.type === 'quote' ? '+' : '💬'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {item.type === 'invoice' && `Invoice sent`}
                        {item.type === 'quote' && `New Quote created`}
                        {item.type === 'message' && `Message from ${item.role}`}
                      </p>
                      {item.amount && (
                        <p className="text-sm font-medium text-gray-700">{formatCurrency(item.amount)}</p>
                      )}
                      {item.content && (
                        <p className="text-sm text-gray-500 truncate">{item.content}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(item.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-left font-medium">
                  + New Quote
                </button>
                <button className="w-full px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left font-medium">
                  + New Invoice
                </button>
                <button className="w-full px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left font-medium">
                  + Add Customer
                </button>
              </div>
            </div>

            {/* Stock Alerts */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock Alerts</h2>
              {data.lowStockProducts.length === 0 ? (
                <p className="text-sm text-gray-500">No stock alerts</p>
              ) : (
                <div className="space-y-3">
                  {data.lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-yellow-700">
                          {product.stockQuantity || 0} left (threshold: {product.lowStockThreshold || 5})
                        </p>
                      </div>
                      <button className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-300">
                        Restock
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}