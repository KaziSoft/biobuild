import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import connectMongo from '@/lib/mongoose';
import NewsEvent from '@/models/NewsEvent';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// ✅ GET Handler – now supports both paginated and full fetch
export async function GET(req: NextRequest) {
  try {
    await connectMongo();

    const { searchParams } = new URL(req.url);
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    if (pageParam && limitParam) {
      const page = parseInt(pageParam);
      const limit = parseInt(limitParam);
      const skip = (page - 1) * limit;

      const total = await NewsEvent.countDocuments();
      const data = await NewsEvent.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return NextResponse.json({ data, total });
    }

    // If no pagination query, return full list (used in view page)
    const items = await NewsEvent.find().sort({ createdAt: -1 });
    return NextResponse.json(items);
  } catch (error) {
    console.error('GET /api/news-events error:', error);
    return NextResponse.json({ message: 'Failed to fetch news/events' }, { status: 500 });
  }
}

// ✅ POST Handler – unchanged, supports image upload
export async function POST(req: NextRequest) {
  try {
    await connectMongo();

    const formData = await req.formData();

    const type = formData.get('type') as string;
    const title = formData.get('title') as string;
    const date = formData.get('date') as string;
    const summary = formData.get('summary') as string;
    const location = formData.get('location') as string;
    const imageBlob = formData.get('image') as Blob;

    if (!type || !title || !date || !summary || !imageBlob) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Convert Blob to Buffer
    const buffer = Buffer.from(await imageBlob.arrayBuffer());

    // Upload to Cloudinary
    const cloudinaryUpload = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'news-events' },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
      Readable.from(buffer).pipe(stream);
    });

    // Save to MongoDB
    const newItem = new NewsEvent({
      type,
      title,
      date,
      summary,
      location: type === 'event' ? location : '',
      image: cloudinaryUpload.secure_url,
    });

    await newItem.save();

    return NextResponse.json({ message: 'News/Event added successfully' });
  } catch (error: any) {
    console.error('POST /api/news-events error:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
