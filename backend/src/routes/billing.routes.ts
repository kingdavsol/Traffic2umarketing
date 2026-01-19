import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { query } from '../database/connection';
import { logger } from '../config/logger';

const router = Router();

/**
 * @route   GET /api/v1/billing/subscription
 * @desc    Get current user subscription details for billing page
 * @access  Private
 */
router.get('/subscription', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // Get subscription details
    const result = await query(
      `SELECT s.*, p.name as plan_name, p.price_monthly
       FROM subscriptions s
       LEFT JOIN pricing_plans p ON s.plan_id = p.id
       WHERE s.user_id = $1 AND s.status IN ('active', 'trialing')
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (!result.rows[0]) {
      // Return free plan info
      return res.status(200).json({
        success: true,
        data: {
          plan: 'Free',
          status: 'active',
          billingCycle: 'N/A',
          nextBillingDate: 'N/A',
          amount: 0,
        },
        statusCode: 200,
      });
    }

    const sub = result.rows[0];
    res.status(200).json({
      success: true,
      data: {
        plan: sub.plan_name || sub.plan_id,
        status: sub.status,
        billingCycle: 'monthly',
        nextBillingDate: sub.current_period_end
          ? new Date(sub.current_period_end).toLocaleDateString()
          : 'N/A',
        amount: sub.price_monthly ? sub.price_monthly / 100 : 0,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        trialEnd: sub.trial_end,
      },
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Get billing subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get subscription',
      statusCode: 500,
    });
  }
});

/**
 * @route   GET /api/v1/billing/invoices
 * @desc    Get user invoices
 * @access  Private
 */
router.get('/invoices', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const result = await query(
      `SELECT id, stripe_invoice_id, amount_due, amount_paid, currency, status,
              invoice_url, invoice_pdf, hosted_invoice_url, paid_at, created_at
       FROM invoices
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );

    const invoices = result.rows.map((inv: any) => ({
      id: inv.id,
      date: new Date(inv.created_at).toLocaleDateString(),
      amount: inv.amount_paid / 100,
      status: inv.status,
      downloadUrl: inv.invoice_pdf || inv.hosted_invoice_url,
    }));

    res.status(200).json({
      success: true,
      data: invoices,
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get invoices',
      statusCode: 500,
    });
  }
});

/**
 * @route   GET /api/v1/billing/payment-methods
 * @desc    Get user payment methods
 * @access  Private
 */
router.get('/payment-methods', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const result = await query(
      `SELECT id, type, brand, last4, exp_month, exp_year, is_default
       FROM payment_methods
       WHERE user_id = $1
       ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );

    const paymentMethods = result.rows.map((pm: any) => ({
      id: pm.id,
      type: pm.type || 'card',
      last4: pm.last4,
      expiryMonth: pm.exp_month,
      expiryYear: pm.exp_year,
      isDefault: pm.is_default,
    }));

    res.status(200).json({
      success: true,
      data: paymentMethods,
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment methods',
      statusCode: 500,
    });
  }
});

/**
 * @route   GET /api/v1/billing/invoices/:id/download
 * @desc    Download invoice PDF
 * @access  Private
 */
router.get('/invoices/:id/download', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const invoiceId = req.params.id;

    const result = await query(
      `SELECT invoice_pdf, hosted_invoice_url
       FROM invoices
       WHERE id = $1 AND user_id = $2`,
      [invoiceId, userId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found',
        statusCode: 404,
      });
    }

    const invoice = result.rows[0];
    const pdfUrl = invoice.invoice_pdf || invoice.hosted_invoice_url;

    if (!pdfUrl) {
      return res.status(404).json({
        success: false,
        error: 'Invoice PDF not available',
        statusCode: 404,
      });
    }

    // Redirect to Stripe-hosted PDF
    res.redirect(pdfUrl);
  } catch (error: any) {
    logger.error('Download invoice error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download invoice',
      statusCode: 500,
    });
  }
});

export default router;
