import { NextResponse } from "next/server";
import User from "@/models/User";
import dbConnect from "@/lib/mongodb";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const statusFilter = searchParams.get("status"); // 'active' | 'expired' | ''
    const telegramStatus = searchParams.get("telegramStatus"); // 'granted' | 'revoked' | 'pending' | ''

    const skip = (page - 1) * limit;

    // 1. Base Match (Search)
    const matchStage: any = {};
    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // 2. Pipeline to calculate expiry and filter
    const pipeline: any[] = [
      { $match: matchStage },
      {
        $addFields: {
          computedEndDate: {
            $let: {
              vars: {
                startDate: { $ifNull: ["$subscription.startDate", new Date()] },
                cycle: { $toLower: { $ifNull: ["$subscription.billingCycle", "monthly"] } },
              },
              in: {
                $switch: {
                  branches: [
                    { case: { $eq: ["$$cycle", "daily"] }, then: { $dateAdd: { startDate: "$$startDate", unit: "day", amount: 1 } } },
                    { case: { $eq: ["$$cycle", "weekly"] }, then: { $dateAdd: { startDate: "$$startDate", unit: "day", amount: 7 } } },
                    { case: { $eq: ["$$cycle", "monthly"] }, then: { $dateAdd: { startDate: "$$startDate", unit: "month", amount: 1 } } },
                    { case: { $eq: ["$$cycle", "quarterly"] }, then: { $dateAdd: { startDate: "$$startDate", unit: "month", amount: 3 } } },
                    { case: { $eq: ["$$cycle", "halfyearly"] }, then: { $dateAdd: { startDate: "$$startDate", unit: "month", amount: 6 } } },
                    { case: { $eq: ["$$cycle", "yearly"] }, then: { $dateAdd: { startDate: "$$startDate", unit: "year", amount: 1 } } },
                  ],
                  default: { $dateAdd: { startDate: "$$startDate", unit: "month", amount: 1 } },
                },
              },
            },
          },
        },
      },
    ];

    // 3. Apply Status Filter
    if (statusFilter === "active") {
      pipeline.push({
        $match: {
          computedEndDate: { $gte: new Date() },
          "subscription.status": "active", // Optional: ensure it's also marked active
        },
      });
    } else if (statusFilter === "expired") {
      pipeline.push({
        $match: {
          $or: [
            { computedEndDate: { $lt: new Date() } },
            { "subscription.status": { $ne: "active" } }
          ]
        },
      });
    }

    // 4. Apply Telegram Status Filter
    if (telegramStatus) {
      pipeline.push({
        $match: {
          "subscription.telegramAccessStatus": telegramStatus
        }
      });
    }

    // 4. Count Total (before pagination)
    // We need a separate count query or use $facet. $facet is better for one round-trip.
    const facetPipeline = [
      ...pipeline,
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "users",
                localField: "invitedBy",
                foreignField: "_id",
                as: "invitedBy",
              },
            },
            { $unwind: { path: "$invitedBy", preserveNullAndEmptyArrays: true } },
            // Project fields to match previous response structure
            {
              $project: {
                name: 1,
                email: 1,
                roles: 1,
                last_login: 1,
                updatedAt: 1,
                mobile: 1,
                other_channels: 1,
                subscription: {
                  plan: 1,
                  status: 1,
                  startDate: 1,
                  billingCycle: 1,
                  telegramAccessStatus: 1,
                  endDate: "$computedEndDate" // Return the computed date as endDate
                },
                invitedBy: { name: 1, email: 1 },
                createdAt: 1
              }
            }
          ],
        },
      },
    ];

    const result = await User.aggregate(facetPipeline);

    const total = result[0].metadata[0]?.total || 0;
    const users = result[0].data;

    // Post-processing to ensure status string is correct in response
    const usersWithStatus = users.map((user: any) => {
      const isExpired = new Date(user.subscription.endDate) < new Date();
      if (isExpired && user.subscription.status === "active") {
        user.subscription.status = "expired";
      }
      return user;
    });

    return NextResponse.json({
      success: true,
      users: usersWithStatus,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Aggregation error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
