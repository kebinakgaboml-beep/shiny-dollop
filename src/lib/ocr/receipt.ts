import OpenAI from 'openai';

// Lazily create OpenAI client to avoid build-time errors
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return new OpenAI({ apiKey });
}

export interface ReceiptExtraction {
  merchant: string;
  amount: number;
  taxAmount: number;
  date: string;
  category: string;
  currency: string;
  confidence: number;
}

/**
 * Extract receipt data from an image URL using GPT-4o Vision
 */
export async function extractReceiptData(imageUrl: string): Promise<ReceiptExtraction | null> {
  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
            {
              type: 'text',
              text: `Analyze this receipt image and extract the following information in JSON format:
              {
                "merchant": "the business name or store name",
                "amount": "the total amount (just the number, no currency symbol)",
                "taxAmount": "the tax amount if visible (just the number, or 0 if not found)",
                "date": "the date of the transaction in ISO format (YYYY-MM-DD)",
                "category": "the category of expense (e.g., supplies, utilities, food, travel, equipment, services)",
                "currency": "the 3-letter currency code (USD, EUR, etc.)",
                "confidence": "a number from 0-100 representing extraction confidence"
              }
              
              If the image is not a receipt or is unclear, return null.
              Only respond with the JSON, no additional text.`,
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    // Parse the JSON response
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const data = JSON.parse(cleaned) as ReceiptExtraction;

    return {
      merchant: data.merchant || 'Unknown',
      amount: Number(data.amount) as number || 0,
      taxAmount: Number(data.taxAmount) as number || 0,
      date: data.date || new Date().toISOString().split('T')[0],
      category: data.category || 'Uncategorized',
      currency: data.currency || 'USD',
      confidence: data.confidence || 50,
    };
  } catch (error) {
    console.error('Receipt extraction error:', error);
    return null;
  }
}

/**
 * Download media from Twilio and return as base64
 */
export async function downloadTwilioMedia(mediaUrl: string): Promise<string | null> {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      console.error('Twilio credentials not configured');
      return null;
    }

    const response = await fetch(mediaUrl, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      },
    });

    if (!response.ok) {
      console.error(`Failed to download media: ${response.status}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return `data:${response.headers.get('content-type') || 'image/jpeg'};base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.error('Media download error:', error);
    return null;
  }
}

/**
 * Extract receipt data from base64 image
 */
export async function extractReceiptFromBase64(base64Image: string): Promise<ReceiptExtraction | null> {
  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: base64Image },
            },
            {
              type: 'text',
              text: `Analyze this receipt image and extract the following information in JSON format:
              {
                "merchant": "the business name or store name",
                "amount": "the total amount (just the number, no currency symbol)",
                "taxAmount": "the tax amount if visible (just the number, or 0 if not found)",
                "date": "the date of the transaction in ISO format (YYYY-MM-DD)",
                "category": "the category of expense (e.g., supplies, utilities, food, travel, equipment, services)",
                "currency": "the 3-letter currency code (USD, EUR, etc.)",
                "confidence": "a number from 0-100 representing extraction confidence"
              }
              
              If the image is not a receipt or is unclear, return null.
              Only respond with the JSON, no additional text.`,
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const data = JSON.parse(cleaned) as ReceiptExtraction;

    return {
      merchant: data.merchant || 'Unknown',
      amount: Number(data.amount) as number || 0,
      taxAmount: Number(data.taxAmount) as number || 0,
      date: data.date || new Date().toISOString().split('T')[0],
      category: data.category || 'Uncategorized',
      currency: data.currency || 'USD',
      confidence: data.confidence || 50,
    };
  } catch (error) {
    console.error('Receipt extraction error:', error);
    return null;
  }
}