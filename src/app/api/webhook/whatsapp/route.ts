import { NextRequest, NextResponse } from 'next/server';
import { db, messageLogs, businesses } from '@/lib/db';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import twilio from 'twilio';
import { processMessage } from '@/lib/ai/agent';
import { handleImageMessage, handleExpenseConfirmation, hasPendingConfirmation } from '@/lib/ocr/expense-flow';

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();
    const params: Record<string, string> = {};
    
    body.forEach((value, key) => {
      params[key] = value.toString();
    });

    // Extract Twilio signature and validate using official twilio.validateRequest()
    const twilioSignature = params['X-Twilio-Signature'] || params['twilioSignature'];
    const authToken = process.env.TWILIO_AUTH_TOKEN || '';
    const webhookUrl = request.url;
    
    // Validate the signature in production using twilio.validateRequest()
    if (authToken && twilioSignature) {
      const isValid = twilio.validateRequest(authToken, twilioSignature, webhookUrl, params);
      if (!isValid) {
        console.error('Invalid Twilio signature rejected');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
      }
    }

    // Extract message data from Twilio payload
    const fromNumber = params['From']?.replace('whatsapp:', '') || '';
    const toNumber = params['To']?.replace('whatsapp:', '') || '';
    const messageBody = params['Body'] || '';
    const messageSid = params['MessageSid'] || '';
    const numMedia = parseInt(params['NumMedia'] || '0');
    const mediaUrl = params['MediaUrl0'] || '';

    // Skip empty messages (but handle media messages)
    if (!messageBody && numMedia === 0) {
      return TwiMLResponse('');
    }

    // Find business by WhatsApp number
    const business = await db.query.businesses.findFirst({
      where: eq(businesses.whatsappNumber, fromNumber)
    });

    if (!business) {
      console.log(`No business found for WhatsApp number: ${fromNumber}`);
      return TwiMLResponse(`Sorry, I don't recognize this number. Please contact support.`);
    }

    // Handle media message (receipt photo)
    if (numMedia > 0 && mediaUrl) {
      console.log(`Processing image message from ${fromNumber}, mediaUrl: ${mediaUrl.substring(0, 50)}...`);

      // Log the incoming media message
      const messageId = crypto.randomUUID();
      await db.insert(messageLogs).values({
        id: messageId,
        businessId: business.id,
        senderPhone: fromNumber,
        role: 'user',
        content: '[Receipt photo]',
        tokensUsed: null,
      });

      const result = await handleImageMessage(business.id, mediaUrl, fromNumber);
      return TwiMLResponse(result.response);
    }

    // Handle text message - check if it's a confirmation response
    if (messageBody && hasPendingConfirmation(fromNumber)) {
      console.log(`Processing confirmation response from ${fromNumber}: ${messageBody}`);

      // Log the incoming message
      const messageId = crypto.randomUUID();
      await db.insert(messageLogs).values({
        id: messageId,
        businessId: business.id,
        senderPhone: fromNumber,
        role: 'user',
        content: messageBody,
        tokensUsed: null,
      });

      const confirmationResult = await handleExpenseConfirmation(business.id, fromNumber, messageBody);
      if (confirmationResult) {
        return TwiMLResponse(confirmationResult.response);
      }
      // Falls through to normal message processing if not actually a confirmation
    }

    // Log the incoming message
    const messageId = crypto.randomUUID();
    await db.insert(messageLogs).values({
      id: messageId,
      businessId: business.id,
      senderPhone: fromNumber,
      role: 'user',
      content: messageBody || '[Media message]',
      tokensUsed: null,
    });

    console.log(`Message logged for business ${business.id}: ${messageBody.substring(0, 50)}...`);

    // Process message with AI agent
    const { response } = await processMessage(business.id, messageBody, fromNumber);

    // Return AI response via TwiML
    return TwiMLResponse(response);

  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    // Return a user-friendly error message
    return TwiMLResponse('Sorry, I encountered an error processing your request. Please try again in a moment.');
  }
}

// Twilio requires a valid TwiML response
function TwiMLResponse(message: string): NextResponse {
  // Escape XML special characters
  const escapedMessage = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapedMessage}</Message>
</Response>`;

  return new NextResponse(twiml, {
    status: 200,
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}

// Handle GET requests (Twilio webhook validation)
export async function GET(request: NextRequest) {
  return TwiMLResponse('BizPilot WhatsApp endpoint is active');
}