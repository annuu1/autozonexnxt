import { NextResponse } from "next/server";
import TradeAnalysis from "@/models/TradeAnalysis";
import dbConnect from "@/lib/mongodb";

// GET single trade by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = await params.id;
  try {
    await dbConnect();
    const trade = await TradeAnalysis.findById(id);

    if (!trade) {
      return NextResponse.json(
        { success: false, error: "Trade not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: trade });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT update trade by ID
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = await params.id;
  try {
    await dbConnect();
    const body = await req.json();

    const updatedTrade = await TradeAnalysis.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    if (!updatedTrade) {
      return NextResponse.json(
        { success: false, error: "Trade not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedTrade });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE trade by ID
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = await params.id;
  try {
    await dbConnect();

    const deletedTrade = await TradeAnalysis.findByIdAndDelete(id);

    if (!deletedTrade) {
      return NextResponse.json(
        { success: false, error: "Trade not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Trade deleted successfully",
      data: deletedTrade,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}