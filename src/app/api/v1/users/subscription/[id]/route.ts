// app/api/v1/users/subscription/[id]/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(req, { rolesAllowed: ["admin", "manager", "associate", "user"] });
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

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  try {
    const auth = await requireAuth(req, { rolesAllowed: ["admin", "manager", "associate", "user"] });
    if (!("ok" in auth) || !auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await dbConnect();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { action } = await req.json();

    // Handle trial activation
    if (action === "activate_trial") {
      // Validate eligibility for trial
      const subscription = user.subscription;

      if (!subscription) {
        return NextResponse.json(
          { error: "No subscription found for this user" },
          { status: 400 }
        );
      }

      // Check if user is eligible for trial
      if (subscription.plan !== "freemium") {
        return NextResponse.json(
          { error: "Trial is only available for freemium plan users" },
          { status: 400 }
        );
      }

      if (subscription.status !== "inactive") {
        return NextResponse.json(
          { error: "Trial can only be activated for inactive subscriptions" },
          { status: 400 }
        );
      }

      if (subscription.billingCycle !== "daily") {
        return NextResponse.json(
          { error: "Trial is only available for daily billing cycle" },
          { status: 400 }
        );
      }

      // Activate trial
      user.subscription.status = "active";
      user.subscription.plan = "starter";
      user.subscription.startDate = new Date();

      // Set trial end date (e.g., 7 days from now)
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7);
      user.subscription.endDate = trialEndDate;

      await user.save();

      return NextResponse.json({
        message: "Trial activated successfully",
        subscription: user.subscription,
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(req, { rolesAllowed: ["admin", "manager"] });
    if (!("ok" in auth) || !auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await dbConnect();

    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { plan, status, billingCycle, startDate, endDate } = body;

    // Update subscription fields
    if (plan) user.subscription.plan = plan;
    if (status) user.subscription.status = status;
    if (billingCycle) user.subscription.billingCycle = billingCycle;
    if (startDate) user.subscription.startDate = new Date(startDate);
    if (endDate) user.subscription.endDate = new Date(endDate);

    await user.save();

    return NextResponse.json({
      message: "Subscription updated successfully",
      subscription: user.subscription,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}