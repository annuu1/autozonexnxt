import { NextResponse } from 'next/server';
import Blog from '@/models/Blog';
import dbConnect from '@/lib/mongodb';

export async function GET(req: Request, context: { params: any }) {
  try {
    await dbConnect();
    const { slug } = await context.params;
    const blog = await Blog.findOne({ slug, isPublished: true });
    
    if (!blog) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, blog });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
