// app/api/v1/users/susbscription/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";
import Subscription from "@/models/Subscription";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req, { rolesAllowed: ["admin", "manager"] });
    if (!("ok" in auth) || !auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortField = searchParams.get("sortField") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "ascend" ? 1 : -1;


    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");


    const query: any = {};

    if (startDate && endDate) {
      query.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const plan = searchParams.get("plan");
    if (plan) query.plan = plan;

    const billingCycle = searchParams.get("billingCycle");
    if (billingCycle) query.billingCycle = billingCycle;

    if (search) {
      // Search by plan or user email or telegram username
      query.$or = [
        { plan: { $regex: search, $options: "i" } },
        { billingCycle: { $regex: search, $options: "i" } },
      ];
    }

    // Join with user data
    const total = await Subscription.countDocuments(query);
    const subscriptions = await Subscription.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      { $sort: { [sortField]: sortOrder } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          plan: 1,
          billingCycle: 1,
          amount: 1,
          startDate: 1,
          expiryDate: 1,
          isAutoRenew: 1,
          notes: 1,
          createdAt: 1,
          "userDetails.name": 1,
          "userDetails.email": 1,
          "userDetails.telegramUsername": 1,
        },
      },
    ]);

    return NextResponse.json({
      data: subscriptions,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("Error fetching subscriptions:", error);
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
    user.subscription.plan = plan;
    user.subscription.status = "active";
    user.subscription.startDate = startDate;
    user.subscription.endDate = finalExpiryDate;
    user.subscription.billingCycle = billingCycle;
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

