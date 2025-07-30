// app/api/news-events/[id]/route.ts

// ✅ Use Node.js runtime to enable Buffer, stream, etc.
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import connectMongo from '@/lib/mongoose';
import NewsEvent from '@/models/NewsEvent';
import cloudinary from '@/lib/cloudinary';

// GET: Single News/Event
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  await connectMongo();
  const item = await NewsEvent.findById(params.id);
  if (!item) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

// PUT: Update News/Event
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectMongo();

    const formData = await req.formData();
    const { id } = params;

    const type = formData.get('type') as string;
    const title = formData.get('title') as string;
    const date = formData.get('date') as string;
    const summary = formData.get('summary') as string;
    const location = formData.get('location') as string;
    const imageBlob = formData.get('image') as Blob | null;

    let imageUrl: string | undefined = undefined;

    if (imageBlob && typeof imageBlob !== 'string') {
      const buffer = Buffer.from(await imageBlob.arrayBuffer());

      const uploadResult = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'news-events' },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
        Readable.from(buffer).pipe(uploadStream);
      });

      imageUrl = uploadResult.secure_url;
    }

    const updated = await NewsEvent.findByIdAndUpdate(
      id,
      {
        type,
        title,
        date,
        summary,
        location: type === 'event' ? location : '',
        ...(imageUrl && { image: imageUrl }),
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ message: 'Failed to update' }, { status: 500 });
  }
}

// DELETE: Remove News/Event
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectMongo();
    await NewsEvent.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ message: 'Failed to delete' }, { status: 500 });
  }
}
