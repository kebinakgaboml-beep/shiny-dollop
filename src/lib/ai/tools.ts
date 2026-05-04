import { db, products, customers, documents, businesses, expenses } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

// Tool 1: Search Inventory
export async function searchInventory(
  businessId: string,
  query: string
): Promise<ToolResult> {
  try {
    const results = await db.query.products.findMany({
      where: eq(products.businessId, businessId),
    });

    // Filter by query (name or description)
    const queryLower = query.toLowerCase();
    const filtered = results.filter(
      (p) =>
        p.name.toLowerCase().includes(queryLower) ||
        (p.description && p.description.toLowerCase().includes(queryLower))
    );

    return {
      success: true,
      data: filtered.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        currency: p.currency,
        stockQuantity: p.stockQuantity,
        lowStockThreshold: p.lowStockThreshold,
      })),
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Tool 2: Update Stock
export async function updateStock(
  businessId: string,
  productId: string,
  delta: number
): Promise<ToolResult> {
  try {
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
    });

    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    if (product.businessId !== businessId) {
      return { success: false, error: 'Product does not belong to this business' };
    }

    const newQuantity = (product.stockQuantity || 0) + delta;

    await db
      .update(products)
      .set({ stockQuantity: newQuantity, updatedAt: new Date().toISOString() })
      .where(eq(products.id, productId));

    return {
      success: true,
      data: {
        productId,
        productName: product.name,
        previousQuantity: product.stockQuantity || 0,
        delta,
        newQuantity,
      },
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Tool 3: Create Document (Quote/Invoice)
export async function createDocument(
  businessId: string,
  type: 'quote' | 'invoice',
  customerId: string,
  items: Array<{ productId: string; name: string; quantity: number; price: number }>,
  notes?: string,
  dueDate?: string
): Promise<ToolResult> {
  try {
    // Verify customer belongs to this business
    const customer = await db.query.customers.findFirst({
      where: eq(customers.id, customerId),
    });

    if (!customer || customer.businessId !== businessId) {
      return { success: false, error: 'Customer not found or does not belong to this business' };
    }

    // Calculate total
    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    const documentId = crypto.randomUUID();
    const settings = await db.query.businessSettings.findFirst({
      where: eq(businesses.id, businessId),
    });

    const prefix = type === 'invoice' 
      ? (settings?.invoicePrefix || 'INV-')
      : (settings?.quotePrefix || 'QT-');

    await db.insert(documents).values({
      id: documentId,
      businessId,
      customerId,
      type,
      status: 'draft',
      totalAmount,
      items: JSON.stringify(items),
      notes,
      dueDate,
    });

    return {
      success: true,
      data: {
        documentId,
        type,
        customerName: customer.name,
        totalAmount,
        status: 'draft',
        prefix,
      },
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Tool 4: Get Customer Details
export async function getCustomerDetails(
  businessId: string,
  nameOrPhone: string
): Promise<ToolResult> {
  try {
    const allCustomers = await db.query.customers.findMany({
      where: eq(customers.businessId, businessId),
    });

    // Search by name or phone
    const queryLower = nameOrPhone.toLowerCase();
    const customer = allCustomers.find(
      (c) =>
        c.name.toLowerCase().includes(queryLower) ||
        (c.phoneNumber && c.phoneNumber.includes(nameOrPhone))
    );

    if (!customer) {
      return { success: false, error: 'Customer not found' };
    }

    return {
      success: true,
      data: {
        id: customer.id,
        name: customer.name,
        phoneNumber: customer.phoneNumber,
        email: customer.email,
        address: customer.address,
      },
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Tool 5: Get Recent Sales
export async function getRecentSales(
  businessId: string,
  limit: number = 10
): Promise<ToolResult> {
  try {
    const recentDocs = await db.query.documents.findMany({
      where: eq(documents.businessId, businessId),
      orderBy: [desc(documents.createdAt)],
      limit,
    });

    // Get customer names for each document
    const docsWithCustomerNames = await Promise.all(
      recentDocs.map(async (doc) => {
        const customer = await db.query.customers.findFirst({
          where: eq(customers.id, doc.customerId),
        });
        return {
          id: doc.id,
          type: doc.type,
          status: doc.status,
          totalAmount: doc.totalAmount,
          customerName: customer?.name || 'Unknown',
          createdAt: doc.createdAt,
        };
      })
    );

    return {
      success: true,
      data: docsWithCustomerNames,
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Tool 6: Log Expense
export async function logExpense(
  businessId: string,
  merchant: string,
  amount: number,
  category?: string,
  expenseDate?: string,
  notes?: string
): Promise<ToolResult> {
  try {
    const expenseId = crypto.randomUUID();
    const date = expenseDate || new Date().toISOString();

    await db.insert(expenses).values({
      id: expenseId,
      businessId,
      merchant,
      amount,
      category: category || null,
      expenseDate: date,
      notes: notes || null,
    });

    return {
      success: true,
      data: {
        expenseId,
        merchant,
        amount,
        category: category || 'Uncategorized',
        expenseDate: date,
      },
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Tool definitions for AI SDK
export const toolDefinitions = [
  {
    name: 'search_inventory',
    description: 'Search products by name or description. Use when the user asks about product availability, prices, or stock levels.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query for product name or description' },
      },
      required: ['query'],
    },
  },
  {
    name: 'update_stock',
    description: 'Update the stock quantity of a product. Use when the user wants to add or remove inventory.',
    parameters: {
      type: 'object',
      properties: {
        productId: { type: 'string', description: 'The product ID' },
        delta: { type: 'number', description: 'Change in quantity (positive to add, negative to remove)' },
      },
      required: ['productId', 'delta'],
    },
  },
  {
    name: 'create_document',
    description: 'Create a quote or invoice for a customer. Use when the user wants to generate a quote or invoice.',
    parameters: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['quote', 'invoice'], description: 'Document type' },
        customerId: { type: 'string', description: 'Customer ID' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'string' },
              name: { type: 'string' },
              quantity: { type: 'number' },
              price: { type: 'number' },
            },
          },
        },
        notes: { type: 'string' },
        dueDate: { type: 'string' },
      },
      required: ['type', 'customerId', 'items'],
    },
  },
  {
    name: 'get_customer_details',
    description: 'Look up customer information by name or phone number.',
    parameters: {
      type: 'object',
      properties: {
        nameOrPhone: { type: 'string', description: 'Customer name or phone number' },
      },
      required: ['nameOrPhone'],
    },
  },
  {
    name: 'get_recent_sales',
    description: 'Get recent quotes/invoices for context on recent business activity.',
    parameters: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Maximum number of results (default 10)' },
      },
    },
  },
];