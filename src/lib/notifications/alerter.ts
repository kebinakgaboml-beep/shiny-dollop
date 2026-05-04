import { db, businesses, products, businessSettings, documents, customers } from '@/lib/db';
import { eq } from 'drizzle-orm';

interface LowStockItem {
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
}

// Send WhatsApp message via Twilio
async function sendWhatsAppMessage(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.error('Twilio credentials not configured');
    return false;
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: `whatsapp:${to}`,
          From: `whatsapp:${fromNumber}`,
          Body: body,
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
}

// Get all businesses with low stock items
export async function checkLowStockAlerts(): Promise<{
  alertsSent: number;
  errors: string[];
}> {
  const results: { alertsSent: number; errors: string[] } = { alertsSent: 0, errors: [] };

  try {
    // Get all businesses with low stock alerts enabled
    const allBusinesses = await db.select().from(businesses);
    
    for (const business of allBusinesses) {
      // Check business settings
      const settings = await db.query.businessSettings.findFirst({
        where: eq(businessSettings.businessId, business.id),
      });

      // Skip if low stock alerts are disabled
      if (settings && settings.lowStockAlertsEnabled === false) {
        continue;
      }

      // Get low stock products for this business
      const lowStockProducts = await db.select().from(products)
        .where(eq(products.businessId, business.id));

      const lowStockItems: LowStockItem[] = lowStockProducts
        .filter(p => (p.stockQuantity || 0) <= (p.lowStockThreshold || 0))
        .map(p => ({
          productId: p.id,
          productName: p.name,
          currentStock: p.stockQuantity || 0,
          threshold: p.lowStockThreshold || 0,
        }));

      if (lowStockItems.length > 0) {
        // Build alert message
        const itemsList = lowStockItems
          .map(item => `• ${item.productName} (${item.currentStock} left, threshold: ${item.threshold})`)
          .join('\n');

        const message = `⚠️ Low Stock Alert for ${business.name}:\n\n${itemsList}\n\nReply 'Restock [Item Name]' to create a restock order.`;

        // Send WhatsApp message
        const sent = await sendWhatsAppMessage(business.whatsappNumber, message);
        
        if (sent) {
          results.alertsSent++;
        } else {
          results.errors.push(`Failed to send alert for business ${business.id}`);
        }
      }
    }
  } catch (error) {
    results.errors.push(String(error));
  }

  return results;
}

// Get pending quotes older than specified days
export async function checkPendingQuotes(daysOld: number = 3): Promise<{
  quotesFound: number;
  alertsSent: number;
  errors: string[];
}> {
  const results: { quotesFound: number; alertsSent: number; errors: string[] } = { quotesFound: 0, alertsSent: 0, errors: [] };

  try {
    const allBusinesses = await db.select().from(businesses);
    
    for (const business of allBusinesses) {
      // Check business settings
      const settings = await db.query.businessSettings.findFirst({
        where: eq(businessSettings.businessId, business.id),
      });

      // Skip if auto followup is disabled
      if (settings && settings.autoFollowupEnabled === false) {
        continue;
      }

      // Get sent quotes
      const allDocs = await db.query.documents.findMany({
        where: eq(documents.businessId, business.id),
      });

      const oldSentQuotes = allDocs.filter(doc => {
        if (doc.type !== 'quote' || doc.status !== 'sent') return false;
        if (!doc.createdAt) return false;
        
        const createdDate = new Date(doc.createdAt);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return diffDays >= daysOld;
      });

      if (oldSentQuotes.length > 0) {
        results.quotesFound += oldSentQuotes.length;

        // Get all customers for this business to lookup names
        const businessCustomers = await db.query.customers.findMany({
          where: eq(customers.businessId, business.id),
        });

        // Build alert message
        const quotesList = oldSentQuotes
          .map((q, i) => {
            const customer = businessCustomers.find(c => c.id === q.customerId);
            return `${i + 1}. ${customer?.name || 'Unknown'} - ${q.totalAmount?.toFixed(2) || '0.00'}`;
          })
          .join('\n');

        const message = `📋 Follow-up Reminder for ${business.name}:\n\nYou have ${oldSentQuotes.length} quote(s) pending for over ${daysOld} days:\n${quotesList}\n\nReply 'Follow up [Quote #]' to send a reminder to the customer.`;

        // Send WhatsApp message
        const sent = await sendWhatsAppMessage(business.whatsappNumber, message);
        
        if (sent) {
          results.alertsSent++;
        } else {
          results.errors.push(`Failed to send follow-up reminder for business ${business.id}`);
        }
      }
    }
  } catch (error) {
    results.errors.push(String(error));
  }

  return results;
}