import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/mongoose';
import { Project } from '@/models/Project';

// Helper function to extract ID from URL
function extractIdFromUrl(request: NextRequest): string {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  return pathSegments[pathSegments.length - 1];
}

export async function GET(request: NextRequest) {
  try {
    await connectMongo();
    const id = extractIdFromUrl(request);
    const project = await Project.findById(id);
    
    if (!project) {
      return NextResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, data: project },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET project error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch project',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectMongo();
    const id = extractIdFromUrl(request);
    const updates = await request.json();
    
    // Basic validation
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid update data' },
        { status: 400 }
      );
    }

    const updatedProject = await Project.findByIdAndUpdate(id, updates, { 
      new: true,
      runValidators: true
    });
    
    if (!updatedProject) {
      return NextResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, data: updatedProject },
      { status: 200 }
    );
  } catch (error) {
    console.error('PATCH project error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to update project',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectMongo();
    const id = extractIdFromUrl(request);
    const deletedProject = await Project.findByIdAndDelete(id);
    
    if (!deletedProject) {
      return NextResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Project deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE project error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to delete project',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}