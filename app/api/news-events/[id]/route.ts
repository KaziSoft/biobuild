// app/api/news-events/[id]/route.ts

// ✅ Use Node.js runtime to enable Buffer, stream, etc.
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
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
      return NextResponse.json(
        { success: false, message: 'News/Event not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, data: item },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET News/Event error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch news/event',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// PUT: Update News/Event
export async function PUT(request: NextRequest) {
  try {
    await connectMongo();
    const id = extractIdFromUrl(request);
    const body = await request.json();

    // Validation
    if (!body.type || !body.title || !body.date) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

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
      { 
        new: true,
        runValidators: true 
      }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'News/Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT News/Event error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to update news/event',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE: Remove News/Event
export async function DELETE(request: NextRequest) {
  try {
    await connectMongo();
    const id = extractIdFromUrl(request);
    const deletedItem = await NewsEvent.findByIdAndDelete(id);
    
    if (!deletedItem) {
      return NextResponse.json(
        { success: false, message: 'News/Event not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'News/Event deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE News/Event error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to delete news/event',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}