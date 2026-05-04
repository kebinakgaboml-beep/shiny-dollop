import { db, businesses, products, documents, customers, messageLogs } from '@/lib/db';
import { eq, desc, sum, count, and, gte } from 'drizzle-orm';
import DashboardClient from './components/DashboardClient';

async function getBusinessData(businessId: string) {
  // Get business info
  const business = await db.query.businesses.findFirst({
    where: eq(businesses.id, businessId),
  });

  if (!business) {
    return null;
  }

  // Get products (for stock alerts)
  const allProducts = await db.select().from(products).where(eq(products.businessId, businessId));
  const lowStockProducts = allProducts.filter(p => (p.stockQuantity || 0) <= (p.lowStockThreshold || 0));

  // Get documents (quotes and invoices)
  const allDocuments = await db.select().from(documents).where(eq(documents.businessId, businessId));
  
  // Calculate metrics
  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);
  
  const invoicesThisMonth = allDocuments.filter(
    d => d.type === 'invoice' && d.status === 'paid' && 
    d.createdAt && new Date(d.createdAt) >= currentMonth
  );
  const revenueThisMonth = invoicesThisMonth.reduce((sum, d) => sum + (d.totalAmount || 0), 0);
  
  const pendingInvoices = allDocuments.filter(d => d.type === 'invoice' && d.status === 'sent');
  const pendingInvoiceTotal = pendingInvoices.reduce((sum, d) => sum + (d.totalAmount || 0), 0);
  
  const openQuotes = allDocuments.filter(d => d.type === 'quote' && d.status !== 'declined');
  const openQuotesTotal = openQuotes.reduce((sum, d) => sum + (d.totalAmount || 0), 0);

  // Get recent activity (last 10 messages and documents)
  const recentMessages = await db.select().from(messageLogs)
    .where(eq(messageLogs.businessId, businessId))
    .orderBy(desc(messageLogs.createdAt))
    .limit(5);
  
  const recentDocs = allDocuments
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5);

  // Get customers
  const allCustomers = await db.select().from(customers).where(eq(customers.businessId, businessId));

  return {
    business,
    metrics: {
      revenueThisMonth,
      pendingInvoiceCount: pendingInvoices.length,
      pendingInvoiceTotal,
      openQuotesCount: openQuotes.length,
      openQuotesTotal,
    },
    lowStockProducts,
    recentActivity: [
      ...recentDocs.map(d => ({
        type: d.type as 'quote' | 'invoice',
        status: d.status,
        amount: d.totalAmount,
        customerId: d.customerId,
        createdAt: d.createdAt,
      })),
      ...recentMessages.map(m => ({
        type: 'message' as const,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 10),
    customers: allCustomers,
  };
}

export default async function DashboardPage() {
  // For now, use a placeholder business ID - in production this would come from auth
  // Get first business or create a demo one
  let business = await db.query.businesses.findFirst();
  
  if (!business) {
    // Create demo business
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
    return <div>Error loading dashboard</div>;
  }

  const data = await getBusinessData(business.id);
  
  if (!data) {
    return <div>Error loading dashboard data</div>;
  }

  return <DashboardClient data={data} />;
}