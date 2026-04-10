import { NextResponse } from 'next/server';
import Blog from '@/models/Blog';
import dbConnect from '@/lib/mongodb';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, blogs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    let slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // ensure unique slug
    let existing = await Blog.findOne({ slug });
    let counter = 1;
    while(existing) {
      slug = `${slug}-${counter}`;
      existing = await Blog.findOne({ slug });
      counter++;
    }

    const newBlog = await Blog.create({
      ...body,
      slug,
      publishedAt: body.isPublished ? new Date() : undefined,
    });
    return NextResponse.json({ success: true, blog: newBlog });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
