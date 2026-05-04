import { db, businesses, documents, expenses } from '@/lib/db';
import { eq, desc, sum, count, and, gte } from 'drizzle-orm';
import TaxSummaryClient from './components/TaxSummaryClient';

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
  monthlyData: {
    month: string;
    income: number;
    expenses: number;
  }[];
  expenseBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  recentExpenses: {
    id: string;
    merchant: string;
    category: string | null;
    amount: number;
    expenseDate: string | null;
    imageUrl: string | null;
  }[];
}

async function getTaxSummaryData(businessId: string, fiscalYear: number = 2026): Promise<TaxSummaryData> {
  // Get business info
  const business = await db.query.businesses.findFirst({
    where: eq(businesses.id, businessId),
  });

  if (!business) {
    throw new Error('Business not found');
  }

  // Get all paid invoices (revenue)
  const allDocuments = await db.select().from(documents).where(eq(documents.businessId, businessId));
  const paidInvoices = allDocuments.filter(d => d.type === 'invoice' && d.status === 'paid');
  const totalRevenue = paidInvoices.reduce((sum, d) => sum + (d.totalAmount || 0), 0);

  // Get all expenses
  const allExpenses = await db.select().from(expenses).where(eq(expenses.businessId, businessId));
  const totalExpenses = allExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Calculate net profit and estimated tax (25% rate)
  const netProfit = totalRevenue - totalExpenses;
  const taxRate = 0.25; // 25% estimated tax rate
  const estimatedTax = Math.max(0, netProfit * taxRate);

  // Calculate monthly data for the last 6 months
  const monthlyData: { month: string; income: number; expenses: number }[] = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const monthName = date.toLocaleString('default', { month: 'short' });
    
    // Calculate income for this month (paid invoices)
    const monthIncome = paidInvoices
      .filter(d => {
        if (!d.createdAt) return false;
        const dDate = new Date(d.createdAt);
        return dDate >= monthStart && dDate <= monthEnd;
      })
      .reduce((sum, d) => sum + (d.totalAmount || 0), 0);

    // Calculate expenses for this month
    const monthExpenses = allExpenses
      .filter(e => {
        if (!e.expenseDate) return false;
        const eDate = new Date(e.expenseDate);
        return eDate >= monthStart && eDate <= monthEnd;
      })
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    monthlyData.push({
      month: monthName,
      income: monthIncome,
      expenses: monthExpenses,
    });
  }

  // Calculate expense breakdown by category
  const categoryTotals: Record<string, number> = {};
  for (const expense of allExpenses) {
    const cat = expense.category || 'Uncategorized';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + (expense.amount || 0);
  }

  const expenseBreakdown = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Get recent expenses (last 10)
  const recentExpenses = allExpenses
    .sort((a, b) => {
      const dateA = a.expenseDate ? new Date(a.expenseDate).getTime() : 0;
      const dateB = b.expenseDate ? new Date(b.expenseDate).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 10)
    .map(e => ({
      id: e.id,
      merchant: e.merchant,
      category: e.category,
      amount: e.amount,
      expenseDate: e.expenseDate,
      imageUrl: e.imageUrl,
    }));

  return {
    business,
    metrics: {
      totalRevenue,
      totalExpenses,
      netProfit,
      estimatedTax,
      taxRate,
    },
    monthlyData,
    expenseBreakdown,
    recentExpenses,
  };
}

export default async function TaxSummaryPage() {
  // Get first business or create demo one
  let business = await db.query.businesses.findFirst();
  
  if (!business) {
    const demoBusinessId = crypto.randomUUID();
    await db.insert(businesses).values({
      id: demoBusinessId,
      name: "Sam's Solar",
      whatsappNumber: '+1234567890',
      industry: 'Solar Installation',
      timezone: 'UTC',
    });
    business = await db.query.businesses.findFirst();
  }

  if (!business) {
    return <div>Error loading tax summary</div>;
  }

  const data = await getTaxSummaryData(business.id);
  
  return <TaxSummaryClient data={data} />;
}