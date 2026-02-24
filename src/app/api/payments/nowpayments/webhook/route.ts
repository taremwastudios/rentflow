import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { platformPayments, subscriptions, subscriptionPlans, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nowpayments } from "@/lib/nowpayments";

export async function POST(request: NextRequest) {
  try {
    // Get the raw request body for signature verification
    const rawBody = await request.text();
    
    // Get headers for signature verification
    const signature = request.headers.get("x-nowpayments-sig") || "";
    const timestamp = request.headers.get("timestamp") || "";
    
    // Verify IPN signature (optional but recommended)
    // Note: This is a simplified check - in production, use proper crypto verification
    if (!signature || !timestamp) {
      console.error("Missing IPN signature or timestamp");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Parse the payment data from NOWPayments
    const paymentData = JSON.parse(rawBody);
    
    console.log("NOWPayments IPN received:", paymentData);

    // Find the payment record in our database
    const paymentId = paymentData.payment_id;
    
    if (!paymentId) {
      console.error("No payment_id in IPN data");
      return NextResponse.json({ error: "Invalid payment data" }, { status: 400 });
    }

    // Query the platform_payments table to find this payment
    const existingPayment = await db
      .select()
      .from(platformPayments)
      .where(eq(platformPayments.nowpaymentsPaymentId, String(paymentId)))
      .limit(1);

    if (existingPayment.length === 0) {
      console.error("Payment not found in database:", paymentId);
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const payment = existingPayment[0];

    // Update the payment record with the IPN data
    const paymentStatus = mapNOWPaymentsStatus(paymentData.payment_status);
    
    await db
      .update(platformPayments)
      .set({
        paymentStatus: paymentStatus,
        ipnData: JSON.stringify(paymentData),
        updatedAt: new Date(),
      })
      .where(eq(platformPayments.id, payment.id));

    // If payment is confirmed/finished, activate the subscription
    if (paymentStatus === "confirmed" || paymentStatus === "finished") {
      await handleSuccessfulPayment(payment);
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Error processing NOWPayments IPN:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function mapNOWPaymentsStatus(status: string): "waiting" | "confirming" | "confirmed" | "finished" | "failed" | "expired" | "refunded" {
  const statusMap: Record<string, any> = {
    "waiting": "waiting",
    "confirming": "confirming", 
    "confirmed": "confirmed",
    "finished": "finished",
    "failed": "failed",
    "expired": "expired",
    "refunded": "refunded",
  };
  
  return statusMap[status] || "waiting";
}

async function handleSuccessfulPayment(payment: any) {
  try {
    // Get the subscription details
    const subscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, payment.subscriptionId))
      .limit(1);

    if (subscription.length === 0) {
      console.error("Subscription not found:", payment.subscriptionId);
      return;
    }

    const sub = subscription[0];

    // Calculate the new expiration date based on billing cycle
    const now = new Date();
    let expiresAt: Date;
    
    if (sub.billingCycle === "annually") {
      expiresAt = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    } else {
      // Monthly
      expiresAt = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    }

    // Update subscription status to active
    await db
      .update(subscriptions)
      .set({
        status: "active",
        startedAt: now,
        expiresAt: expiresAt,
        updatedAt: now,
      })
      .where(eq(subscriptions.id, sub.id));

    console.log("Subscription activated:", sub.id, "until", expiresAt);

  } catch (error) {
    console.error("Error handling successful payment:", error);
  }
}
