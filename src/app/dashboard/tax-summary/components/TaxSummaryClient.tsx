'use client';

import { useState } from 'react';

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

interface ExpenseBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

interface RecentExpense {
  id: string;
  merchant: string;
  category: string | null;
  amount: number;
  expenseDate: string | null;
  imageUrl: string | null;
}

interface TaxSummaryData {
  business: {
    id: string;
    name: string;
  };
  metrics: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    estimatedTax: number;
    taxRate: number;
  };
  monthlyData: MonthlyData[];
  expenseBreakdown: ExpenseBreakdown[];
  recentExpenses: RecentExpense[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
}

export default function TaxSummaryClient({ data }: { data: TaxSummaryData }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses'>('overview');

  // Find max value for chart scaling
  const maxMonthlyValue = Math.max(
    ...data.monthlyData.map(d => Math.max(d.income, d.expenses)),
    1
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BP</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Tax Summary</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Fiscal Year {new Date().getFullYear()} (To Date)
            </span>
            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
              Export for CPA
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(data.metrics.totalRevenue)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Expenses</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{formatCurrency(data.metrics.totalExpenses)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Net Profit</p>
            <p className={`text-3xl font-bold mt-2 ${data.metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(data.metrics.netProfit)}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Est. Tax Liability</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">{formatCurrency(data.metrics.estimatedTax)}</p>
            <p className="text-xs text-gray-400 mt-1">Based on {(data.metrics.taxRate * 100).toFixed(0)}% rate</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Income vs Expenses Chart */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Income vs Expenses (Last 6 Months)</h2>
            <div className="h-64 flex items-end justify-around gap-4">
              {data.monthlyData.map((month, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex gap-2 items-end justify-center h-48">
                    {/* Income bar */}
                    <div 
                      className="w-6 bg-green-500 rounded-t"
                      style={{ height: `${(month.income / maxMonthlyValue) * 100}%` }}
                      title={`Income: ${formatCurrency(month.income)}`}
                    />
                    {/* Expenses bar */}
                    <div 
                      className="w-6 bg-red-400 rounded-t"
                      style={{ height: `${(month.expenses / maxMonthlyValue) * 100}%` }}
                      title={`Expenses: ${formatCurrency(month.expenses)}`}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{month.month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded"></div>
                <span className="text-sm text-gray-600">Expenses</span>
              </div>
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h2>
            {data.expenseBreakdown.length === 0 ? (
              <p className="text-gray-500 text-sm">No expenses recorded yet</p>
            ) : (
              <div className="space-y-4">
                {data.expenseBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{item.category}</span>
                        <span className="text-sm text-gray-500">{item.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-24 text-right">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Expenses Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Expenses</h2>
          {data.recentExpenses.length === 0 ? (
            <p className="text-gray-500 text-sm">No expenses recorded yet. Send a receipt photo via WhatsApp to log expenses.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Vendor</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Category</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentExpenses.map((expense) => (
                    <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-700">{formatDate(expense.expenseDate)}</td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{expense.merchant}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{expense.category || '-'}</td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right">{formatCurrency(expense.amount)}</td>
                      <td className="py-3 px-4 text-center">
                        {expense.imageUrl ? (
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            View Image
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}