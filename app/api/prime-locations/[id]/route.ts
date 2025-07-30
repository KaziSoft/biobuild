// app/api/prime-locations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/mongoose';
import { PrimeLocation } from '@/models/PrimeLocation';

// Helper function to extract ID from URL
function extractIdFromUrl(request: NextRequest): string {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  return pathSegments[pathSegments.length - 1];
}

export async function PATCH(request: NextRequest) {
  try {
    await connectMongo();
    const id = extractIdFromUrl(request);
    const body = await request.json();
    const updated = await PrimeLocation.findByIdAndUpdate(id, body, { new: true });

    if (!updated) {
      return NextResponse.json({ message: 'Location not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Location updated successfully', 
      location: updated 
    });
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      { message: 'Failed to update location' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectMongo();
    const id = extractIdFromUrl(request);
    const location = await PrimeLocation.findByIdAndDelete(id);
    
    if (!location) {
      return NextResponse.json(
        { message: 'Location not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Location deleted successfully' 
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { message: 'Failed to delete location' }, 
      { status: 500 }
    );
  }
}