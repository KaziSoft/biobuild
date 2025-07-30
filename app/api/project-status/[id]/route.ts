import connectMongo from '@/lib/mongoose';
import ProjectStatus from '@/models/ProjectStatus';
import { NextRequest, NextResponse } from 'next/server';

// Helper function to extract ID from URL
function extractIdFromUrl(request: NextRequest): string {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  return pathSegments[pathSegments.length - 1];
}

export async function GET(request: NextRequest) {
  await connectMongo();
  try {
    const id = extractIdFromUrl(request);
    const project = await ProjectStatus.findById(id);
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    return NextResponse.json(project);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  await connectMongo();
  try {
    const id = extractIdFromUrl(request);
    const body = await request.json();
    const updated = await ProjectStatus.findByIdAndUpdate(id, body, { new: true });
    
    if (!updated) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  await connectMongo();
  try {
    const id = extractIdFromUrl(request);
    const deleted = await ProjectStatus.findByIdAndDelete(id);
    
    if (!deleted) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}