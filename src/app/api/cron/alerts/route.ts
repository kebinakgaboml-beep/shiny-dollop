import { NextRequest, NextResponse } from 'next/server';
import { checkLowStockAlerts, checkPendingQuotes } from '@/lib/notifications/alerter';

// This endpoint can be called by Vercel Cron or any scheduler
// Vercel Cron format: every 6 hours
// GET /api/cron/alerts?key=SECRET_KEY

const CRON_SECRET = process.env.CRON_SECRET || 'dev-secret';

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const providedKey = request.nextUrl.searchParams.get('key');
  
  if (process.env.NODE_ENV === 'production' && providedKey !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = {
    timestamp: new Date().toISOString(),
    lowStockAlerts: { alertsSent: 0, errors: [] as string[] },
    quoteFollowUps: { quotesFound: 0, alertsSent: 0, errors: [] as string[] },
  };

  // Check low stock alerts
  try {
    results.lowStockAlerts = await checkLowStockAlerts();
  } catch (error) {
    results.lowStockAlerts.errors.push(String(error));
  }

  // Check pending quotes for follow-up
  try {
    results.quoteFollowUps = await checkPendingQuotes(3); // 3 days old
  } catch (error) {
    results.quoteFollowUps.errors.push(String(error));
  }

  return NextResponse.json(results);
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}