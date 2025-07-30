import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/mongoose';
import { Project } from '@/models/Project';

// Get all projects
export async function GET(request: NextRequest) {
  try {
    await connectMongo();
    const projects = await Project.find().sort({ createdAt: -1 });
    return NextResponse.json(
      { 
        success: true,
        data: projects 
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('GET projects error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch projects',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      }, 
      { status: 500 }
    );
  }
}

// Create new project
export async function POST(request: NextRequest) {
  try {
    await connectMongo();
    const body = await request.json();
    
    // Basic validation
    if (!body.name || !body.description) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Name and description are required' 
        }, 
        { status: 400 }
      );
    }

    const newProject = await Project.create(body);
    
    return NextResponse.json(
      { 
        success: true,
        data: newProject 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('POST project error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to create project',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      }, 
      { status: 500 }
    );
  }
}