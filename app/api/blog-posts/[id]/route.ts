// app/api/blog-posts/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/mongoose';
import BlogPost from '@/models/BlogPost';

function extractIdFromUrl(request: NextRequest): string {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const id = pathSegments[pathSegments.length - 1];
  return id;
}

export async function GET(request: NextRequest) {
  try {
    await connectMongo();
    const id = extractIdFromUrl(request);
    const post = await BlogPost.findById(id);
    if (!post) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectMongo();
    const id = extractIdFromUrl(request);
    const data = await request.json();
    const updatedPost = await BlogPost.findByIdAndUpdate(id, data, {
      new: true,
    });
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { message: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectMongo();
    const id = extractIdFromUrl(request);
    await BlogPost.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { message: 'Failed to delete post' },
      { status: 500 }
    );
  }
}