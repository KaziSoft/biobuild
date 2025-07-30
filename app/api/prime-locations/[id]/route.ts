import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/mongoose';
import { PrimeLocation } from '@/models/PrimeLocation';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectMongo();
    const { id } = params;
    const body = await req.json();
    const updated = await PrimeLocation.findByIdAndUpdate(id, body, { new: true });

    if (!updated) {
      return NextResponse.json({ message: 'Location not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Location updated', location: updated });
  } catch (err) {
    return NextResponse.json({ message: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectMongo();
    const deleted = await PrimeLocation.findByIdAndDelete(params.id);

    if (!deleted) {
      return NextResponse.json({ message: 'Location not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Location deleted' });
  } catch (err) {
    return NextResponse.json({ message: 'Delete failed' }, { status: 500 });
  }
}
