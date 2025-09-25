const express = require("express");
const crypto = require("crypto");

const router = express.Router();

function getBasicAuthHeader() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !secret) return null;
  const token = Buffer.from(`${keyId}:${secret}`).toString('base64');
  return { header: `Basic ${token}`, keyId };
}

// Create Razorpay Order
router.post('/pay/razorpay/order', async (req, res) => {
  try {
    const auth = getBasicAuthHeader();
    if (!auth) return res.status(400).json({ message: 'Razorpay not configured' });

    const { amount, amountPaise, currency = 'INR', receipt } = req.body || {};
    const amtPaise = Number.isFinite(Number(amountPaise))
      ? Number(amountPaise)
      : Math.round((Number(amount) || 0) * 100);
    if (!amtPaise || amtPaise <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const body = {
      amount: amtPaise,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1
    };

    const resp = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': auth.header,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const order = await resp.json();
    if (!resp.ok) {
      return res.status(400).json({ message: order && order.error ? order.error.description : 'Order create failed' });
    }
    res.json({ order, keyId: auth.keyId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Verify Razorpay Signature
router.post('/pay/razorpay/verify', async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return res.status(400).json({ message: 'Razorpay not configured' });
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing parameters' });
    }
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    const valid = expected === razorpay_signature;
    return res.json({ valid });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;



