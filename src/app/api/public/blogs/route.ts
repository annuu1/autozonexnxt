import { NextResponse } from 'next/server';
import Blog from '@/models/Blog';
import dbConnect from '@/lib/mongodb';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const blogs = await Blog.find({ isPublished: true })
      .sort({ publishedAt: -1 })
      .select("-content"); // Omit large HTML content on the list page
      
    return NextResponse.json({ success: true, blogs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
