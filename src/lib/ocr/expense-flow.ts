import { db, messageLogs, businesses, expenses } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { extractReceiptFromBase64, downloadTwilioMedia, ReceiptExtraction } from '@/lib/ocr/receipt';
import { logExpense } from '@/lib/ai/tools';
import crypto from 'crypto';

// In-memory store for pending receipt confirmations
// Key: phone number, Value: { extraction, timestamp }
const pendingConfirmations = new Map<string, { extraction: ReceiptExtraction; businessId: string; timestamp: number }>();

// Clean up old pending confirmations (older than 10 minutes)
function cleanupPendingConfirmations() {
  const now = Date.now();
  for (const [key, value] of pendingConfirmations.entries()) {
    if (now - value.timestamp > 10 * 60 * 1000) {
      pendingConfirmations.delete(key);
    }
  }
}

export interface OCRFlowResult {
  response: string;
  savedExpenseId?: string;
  isConfirmation: boolean;
}

/**
 * Handle an image message from WhatsApp
 * Downloads media, extracts receipt data, and asks for confirmation
 */
export async function handleImageMessage(
  businessId: string,
  mediaUrl: string,
  fromNumber: string
): Promise<OCRFlowResult> {
  try {
    // Download the media from Twilio
    const base64Image = await downloadTwilioMedia(mediaUrl);
    if (!base64Image) {
      return {
        response: "Sorry, I couldn't download the image. Please try again or send the receipt in a different format.",
        isConfirmation: false,
      };
    }

    // Extract receipt data using GPT-4o Vision
    const extraction = await extractReceiptFromBase64(base64Image);
    if (!extraction) {
      return {
        response: "I couldn't extract any receipt data from that image. Please make sure the receipt is clear and try again.",
        isConfirmation: false,
      };
    }

    // Store pending confirmation
    pendingConfirmations.set(fromNumber, {
      extraction,
      businessId,
      timestamp: Date.now(),
    });

    // Format date for display
    const displayDate = new Date(extraction.date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    return {
      response: `📄 Receipt detected!\n\n` +
        `🏪 Merchant: ${extraction.merchant}\n` +
        `💰 Amount: ${extraction.currency} ${extraction.amount.toFixed(2)}\n` +
        `📅 Date: ${displayDate}\n` +
        `📁 Category: ${extraction.category}\n` +
        (extraction.taxAmount > 0 ? `🧾 Tax: ${extraction.currency} ${extraction.taxAmount.toFixed(2)}\n` : '') +
        `\nReply "yes" to confirm and save this expense, or "no" to cancel.`,
      isConfirmation: false,
    };
  } catch (error) {
    console.error('OCR image handling error:', error);
    return {
      response: "I encountered an error processing your receipt. Please try again, or describe the expense manually.",
      isConfirmation: false,
    };
  }
}

/**
 * Handle a text response that might be a confirmation for a pending OCR
 */
export async function handleExpenseConfirmation(
  businessId: string,
  fromNumber: string,
  messageBody: string
): Promise<OCRFlowResult | null> {
  // Clean up old pending confirmations
  cleanupPendingConfirmations();

  const pending = pendingConfirmations.get(fromNumber);
  if (!pending) {
    return null; // Not a confirmation, let normal flow handle it
  }

  const normalizedMessage = messageBody.trim().toLowerCase();

  // User confirms the expense
  if (normalizedMessage === 'yes' || normalizedMessage === 'confirm' || normalizedMessage === 'y') {
    const { extraction } = pending;

    // Save the expense using logExpense tool
    const result = await logExpense(
      pending.businessId,
      extraction.merchant,
      extraction.amount,
      extraction.category,
      extraction.date,
      `Receipt OCR - ${extraction.confidence}% confidence`
    );

    // Remove from pending
    pendingConfirmations.delete(fromNumber);

    if (result.success) {
      return {
        response: `✅ Expense saved!\n\n` +
          `🏪 ${extraction.merchant}\n` +
          `💰 ${extraction.currency} ${extraction.amount.toFixed(2)}\n` +
          `📁 Category: ${extraction.category}\n\n` +
          `You can view all expenses in your dashboard.`,
        savedExpenseId: result.data as string,
        isConfirmation: true,
      };
    } else {
      return {
        response: `❌ Failed to save expense: ${result.error}. Please try again or contact support.`,
        isConfirmation: true,
      };
    }
  }

  // User declines or asks to cancel
  if (normalizedMessage === 'no' || normalizedMessage === 'cancel' || normalizedMessage === 'n') {
    pendingConfirmations.delete(fromNumber);
    return {
      response: "OK, I've cancelled that expense. Send another receipt whenever you're ready!",
      isConfirmation: true,
    };
  }

  // User might be providing corrections
  // This is a simple correction flow
  if (normalizedMessage.startsWith('change ') || normalizedMessage.startsWith('update ')) {
    return {
      response: `I see you want to make changes. Please send the corrected receipt image and I'll process it again.`,
      isConfirmation: true,
    };
  }

  // Not a clear confirmation response, let normal flow handle it
  return null;
}

/**
 * Check if there's a pending confirmation for this number
 */
export function hasPendingConfirmation(fromNumber: string): boolean {
  cleanupPendingConfirmations();
  return pendingConfirmations.has(fromNumber);
}