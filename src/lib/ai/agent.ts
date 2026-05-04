import { createOpenAI } from '@ai-sdk/openai';
import { generateText, tool } from 'ai';
import { db, messageLogs, businesses } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import crypto from 'crypto';
import {
  searchInventory,
  updateStock,
  createDocument,
  getCustomerDetails,
  getRecentSales,
  logExpense,
} from './tools';
import { zodSchema } from 'ai';
import { z } from 'zod';

// Lazily create OpenAI client to avoid build-time errors
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return createOpenAI({ apiKey });
}

// Create system prompt with business context
async function createSystemPrompt(businessId: string): Promise<string> {
  const business = await db.query.businesses.findFirst({
    where: eq(businesses.id, businessId),
  });

  if (!business) {
    return 'You are BizPilot, an AI assistant for small businesses.';
  }

  // Get low stock items
  const allProducts = await db.select().from(products).where(eq(products.businessId, businessId));
  
  const lowStockItems = allProducts.filter(
    (p) => (p.stockQuantity || 0) <= (p.lowStockThreshold || 0)
  );

  let prompt = `You are BizPilot, an AI assistant for ${business.name}. `;

  if (lowStockItems.length > 0) {
    const items = lowStockItems.map((p) => `${p.name} (${p.stockQuantity})`).join(', ');
    prompt += `Current low stock items: ${items}. `;
  }

  prompt += `\n\nYou can help with:
- Creating quotes and invoices (e.g., "create quote for Alice with 3 windows")
- Checking inventory (e.g., "search inventory windows")
- Updating stock (e.g., "update stock product123 by +10")
- Looking up customers (e.g., "find customer John")
- Viewing recent sales (e.g., "show recent sales")

Be concise and helpful.`;
  return prompt;
}

// Get recent message history for context
async function getMessageHistory(businessId: string, limit: number = 10) {
  const messages = await db.select().from(messageLogs)
    .where(eq(messageLogs.businessId, businessId))
    .orderBy(desc(messageLogs.createdAt))
    .limit(limit);
  return messages.reverse(); // Oldest first for context
}

// Main agent function
export async function processMessage(
  businessId: string,
  userMessage: string,
  senderPhone: string
): Promise<{ response: string }> {
  try {
    // Get conversation history
    const history = await getMessageHistory(businessId);
    
    // Build messages array for AI
    const messages: { role: 'user' | 'assistant' | 'system'; content: string }[] = [];

    // Add system prompt
    const systemPrompt = await createSystemPrompt(businessId);
    messages.push({ role: 'system', content: systemPrompt });

    // Add conversation history
    for (const msg of history) {
      messages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      });
    }

    // Add current message
    messages.push({ role: 'user', content: userMessage });

    // Call LLM with tools for actual execution
    const openai = getOpenAIClient();
    const result = await generateText({
      model: openai('gpt-4o'),
      messages,
      tools: {
        search_inventory: tool({
          description: 'Search products by name or description. Use when the user asks about product availability, prices, or stock levels.',
          parameters: zodSchema(z.object({
            query: z.string().describe('Search query for product name or description'),
          })),
          execute: async ({ query }: { query: string }) => {
            return await searchInventory(businessId, query);
          },
        }),
        update_stock: tool({
          description: 'Update the stock quantity of a product. Use when the user wants to add or remove inventory.',
          parameters: zodSchema(z.object({
            productId: z.string().describe('The product ID'),
            delta: z.number().describe('Change in quantity (positive to add, negative to remove)'),
          })),
          execute: async ({ productId, delta }: { productId: string; delta: number }) => {
            return await updateStock(businessId, productId, delta);
          },
        }),
        create_document: tool({
          description: 'Create a quote or invoice for a customer. Use when the user wants to generate a quote or invoice.',
          parameters: zodSchema(z.object({
            type: z.enum(['quote', 'invoice']).describe('Document type'),
            customerId: z.string().describe('Customer ID'),
            items: z.array(z.object({
              productId: z.string(),
              name: z.string(),
              quantity: z.number(),
              price: z.number(),
            })),
            notes: z.string().optional(),
            dueDate: z.string().optional(),
          })),
          execute: async ({ type, customerId, items, notes, dueDate }: any) => {
            return await createDocument(businessId, type, customerId, items, notes, dueDate);
          },
        }),
        get_customer_details: tool({
          description: 'Look up customer information by name or phone number.',
          parameters: zodSchema(z.object({
            nameOrPhone: z.string().describe('Customer name or phone number'),
          })),
          execute: async ({ nameOrPhone }: { nameOrPhone: string }) => {
            return await getCustomerDetails(businessId, nameOrPhone);
          },
        }),
        get_recent_sales: tool({
          description: 'Get recent quotes/invoices for context on recent business activity.',
          parameters: zodSchema(z.object({
            limit: z.number().optional().describe('Maximum number of results (default 10)'),
          })),
          execute: async ({ limit }: { limit?: number }) => {
            return await getRecentSales(businessId, limit);
          },
        }),
        log_expense: tool({
          description: 'Log a business expense. Use when user wants to record an expense.',
          parameters: zodSchema(z.object({
            merchant: z.string().describe('Merchant or vendor name'),
            amount: z.number().describe('Expense amount'),
            category: z.string().optional().describe('Expense category'),
            expenseDate: z.string().optional().describe('Date of expense in ISO format'),
            notes: z.string().optional().describe('Additional notes'),
          })),
          execute: async ({ merchant, amount, category, expenseDate, notes }: any) => {
            return await logExpense(businessId, merchant, amount, category, expenseDate, notes);
          },
        }),
      },
      maxSteps: 5,
    });

    const finalText = result.text;

    // Log the assistant's response
    await db.insert(messageLogs).values({
      id: crypto.randomUUID(),
      businessId,
      senderPhone,
      role: 'assistant',
      content: finalText,
      tokensUsed: result.usage?.totalTokens || null,
    });

    return { response: finalText };
  } catch (error) {
    console.error('Agent error:', error);
    return { 
      response: 'I apologize, but I encountered an error processing your request. Please try again, or type "help" for available commands.' 
    };
  }
}
