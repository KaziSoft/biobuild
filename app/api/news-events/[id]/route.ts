// app/api/news-events/[id]/route.ts

// ✅ Use Node.js runtime to enable Buffer, stream, etc.
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import connectMongo from '@/lib/mongoose';
import NewsEvent from '@/models/NewsEvent';
import cloudinary from '@/lib/cloudinary';

// Helper function to extract ID from URL
function extractIdFromUrl(request: NextRequest): string {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  return pathSegments[pathSegments.length - 1];
}

// GET: Single News/Event
export async function GET(request: NextRequest) {
  try {
    await connectMongo();
    const id = extractIdFromUrl(request);
    const item = await NewsEvent.findById(id);
    if (!item) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ message: 'Failed to fetch item' }, { status: 500 });
  }
}

// PUT: Update News/Event
export async function PUT(request: NextRequest) {
  try {
    await connectMongo();
    const id = extractIdFromUrl(request);
    const body = await request.json();

    const { type, title, date, summary, location, image } = body;

    const updated = await NewsEvent.findByIdAndUpdate(
      id,
      {
        type,
        title,
        date,
        summary,
        location: type === 'event' ? location : '',
        image,
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ message: 'Failed to update' }, { status: 500 });
  }
}

// DELETE: Remove News/Event
export async function DELETE(request: NextRequest) {
  try {
    await connectMongo();
    const id = extractIdFromUrl(request);
    await NewsEvent.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ message: 'Failed to delete' }, { status: 500 });
  }
}