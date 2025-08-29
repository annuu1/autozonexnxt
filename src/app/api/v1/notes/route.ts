// app/api/v1/notes/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Note from "@/models/Notes";

// GET all notes (with optional search by title or tags)
export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    let query: any = {};
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { content: { $regex: search, $options: "i" } },
          { tags: { $regex: search, $options: "i" } },
        ],
      };
    }

    const notes = await Note.find(query).sort({ isPinned: -1, updatedAt: -1 });

    return NextResponse.json(notes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// CREATE a new note
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const newNote = await Note.create(body);

    return NextResponse.json(newNote, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
