import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { platformPayments, subscriptions, subscriptionPlans, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nowpayments } from "@/lib/nowpayments";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = session.user;

    const body = await request.json();
    const { planId, billingCycle, cryptoCurrency } = body;

    // Validate required fields
    if (!planId || !billingCycle || !cryptoCurrency) {
      return NextResponse.json(
        { error: "Missing required fields: planId, billingCycle, cryptoCurrency" },
        { status: 400 }
      );
    }

    // Get the subscription plan details
    const plan = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId))
      .limit(1);

    if (plan.length === 0) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const subscriptionPlan = plan[0];

    // Calculate price based on billing cycle
    let priceAmount: number;
    if (billingCycle === "annually" && subscriptionPlan.priceUsdAnnually) {
      priceAmount = subscriptionPlan.priceUsdAnnually;
    } else {
      priceAmount = subscriptionPlan.priceUsdMonthly || 0;
    }

    // Add setup fee if applicable
    if (subscriptionPlan.setupFeeUsd && subscriptionPlan.setupFeeUsd > 0) {
      priceAmount += subscriptionPlan.setupFeeUsd;
    }

    // Check if user already has a subscription record
    let subscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, session.user.id))
      .limit(1);

    let subscriptionId: number;

    if (subscription.length === 0) {
      // Create new subscription record
      const newSubscription = await db
        .insert(subscriptions)
        .values({
          userId: session.user.id,
          planId: planId,
          status: "pending",
          billingCycle: billingCycle,
          autoRenew: true,
        })
        .returning();

      subscriptionId = newSubscription[0].id;
    } else {
      // Update existing subscription
      await db
        .update(subscriptions)
        .set({
          planId: planId,
          billingCycle: billingCycle,
          status: "pending",
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, subscription[0].id));

      subscriptionId = subscription[0].id;
    }

    // Create NOWPayments payment
    const paymentResponse = await nowpayments.createPayment({
      price_amount: priceAmount,
      price_currency: "usd",
      pay_currency: cryptoCurrency,
      order_id: `rentflow_sub_${subscriptionId}_${Date.now()}`,
      order_description: `${subscriptionPlan.name} subscription - ${billingCycle}`,
      customer_email: session.user.email || undefined,
    });

    // Store payment record in database
    const paymentRecord = await db
      .insert(platformPayments)
      .values({
        userId: session.user.id,
        subscriptionId: subscriptionId,
        planId: planId,
        amountUsd: priceAmount,
        cryptoAmount: parseFloat(paymentResponse.pay_amount),
        currency: cryptoCurrency,
        nowpaymentsPaymentId: String(paymentResponse.id),
        nowpaymentsOrderId: paymentResponse.order_id,
        paymentStatus: "waiting",
        payAddress: paymentResponse.payment_address,
        paymentUrl: paymentResponse.checkout_url,
        type: "subscription",
      })
      .returning();

    // Return the payment details to the frontend
    return NextResponse.json({
      success: true,
      payment: {
        id: paymentRecord[0].id,
        checkoutUrl: paymentResponse.checkout_url,
        paymentAddress: paymentResponse.payment_address,
        payAmount: paymentResponse.pay_amount,
        currency: cryptoCurrency,
        amountUsd: priceAmount,
      },
      subscription: {
        id: subscriptionId,
        planName: subscriptionPlan.name,
        billingCycle: billingCycle,
      },
    });

  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
