import { NextResponse } from 'next/server';
import Blog from '@/models/Blog';
import dbConnect from '@/lib/mongodb';

export async function GET(req: Request, context: { params: any }) {
  try {
    await dbConnect();
    const { id } = await context.params;
    const blog = await Blog.findById(id);
    if (!blog) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, blog });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: any }) {
  try {
    await dbConnect();
    const { id } = await context.params;
    const body = await req.json();
    
    // Check slug uniqueness if title changed
    let slug = body.slug;
    if (!slug) {
       slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    
    let existing = await Blog.findOne({ slug, _id: { $ne: id } });
    let counter = 1;
    while(existing) {
      slug = `${slug}-${counter}`;
      existing = await Blog.findOne({ slug, _id: { $ne: id } });
      counter++;
    }
    
    const updated = await Blog.findByIdAndUpdate(id, {
      ...body,
      slug,
      publishedAt: body.isPublished ? (body.publishedAt || new Date()) : undefined,
    }, { new: true });
    
    return NextResponse.json({ success: true, blog: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Note: params must be awaited in Next.js 15+, safe approach for backward compatibility
export async function DELETE(req: Request, context: { params: any }) {
  try {
    await dbConnect();
    const { id } = await context.params;
    await Blog.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
