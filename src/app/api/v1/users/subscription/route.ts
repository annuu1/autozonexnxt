// app/api/v1/users/susbscription/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";
import Subscription from "@/models/Subscription";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(req, { rolesAllowed: ["admin","manager"] });
    if (!("ok" in auth) || !auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    await dbConnect();
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user.subscription);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    // ✅ Auth check
    const auth = await requireAuth(req, { rolesAllowed: ["admin", "manager"] });
    if (!("ok" in auth) || !auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await dbConnect();
    const data = await req.json();

    const { userId, plan, amount, expiryDate, billingCycle="monthly" } = data;

    // ✅ Validate required fields
    if (!userId || !plan || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: userId, plan, or amount" },
        { status: 400 }
      );
    }

    // ✅ Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Auto-set expiry if not provided (e.g., 30 days)
    const startDate = new Date();
        
    let monthsToAdd = 1; // default = monthly
    switch (billingCycle.toLowerCase()) {
      case "quarterly":
        monthsToAdd = 3;
        break;
      case "halfyearly":
        monthsToAdd = 6;
        break;
      case "yearly":
        monthsToAdd = 12;
        break;
      case "monthly":
      default:
        monthsToAdd = 1;
        break;
    }

    // If expiryDate not provided, auto-calculate
    let finalExpiryDate;
    if (expiryDate) {
      finalExpiryDate = new Date(expiryDate);
    } else {
      finalExpiryDate = new Date(startDate);
      finalExpiryDate.setMonth(finalExpiryDate.getMonth() + monthsToAdd);
    }
    // ✅ Create new subscription
    const subscription = await Subscription.create({
      userId,
      telegramChatId: user?.telegramChatId || null,
      telegramUsername: user?.telegramUsername || null,
      plan,
      billingCycle,
      amount,
      transactionId: data.transactionId || null,
      startDate,
      expiryDate: finalExpiryDate,
      isAutoRenew: data.isAutoRenew || false,
      features: data.features || [],
      notes: data.notes || "",
    });

    // ✅ (Optional) Save subscription ID to user document if you track it there
    user.latestBill = subscription._id;
    await user.save();

    return NextResponse.json(subscription, { status: 201 });
  } catch (error: any) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription", details: error.message },
      { status: 500 }
    );
  }
}

