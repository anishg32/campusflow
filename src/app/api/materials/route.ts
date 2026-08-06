import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '@/lib/db';
import Material from '@/lib/models/Material';
import { verifyAuth } from '@/lib/auth';

export const config = {
  api: {
    bodyParser: false,
  },
};

// GET /api/materials - List materials (students see filtered, faculty/admin see all)
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const year = searchParams.get('year');

    const filter: Record<string, any> = {};

    if (user.role === 'student') {
      // Students only see materials meant for everyone OR specifically for their department/year
      const orConditions: any[] = [{ department: { $exists: false } }, { department: null }];
      
      if (department) {
        if (year) {
          orConditions.push({ department, year: Number(year) });
          orConditions.push({ department, year: { $exists: false } });
          orConditions.push({ department, year: null });
        } else {
          orConditions.push({ department });
        }
      }
      
      filter.$or = orConditions;
    } else {
      // Faculty/Admin can filter if they want, but default to all
      if (department) filter.department = department;
      if (year) filter.year = Number(year);
    }

    const materials = await Material.find(filter)
      .populate('uploadedBy', 'name email role avatar')
      .populate('department', 'name code')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(materials);
  } catch (error: any) {
    console.error('Get materials error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/materials - Faculty/Admin upload a new material
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || (user.role !== 'admin' && user.role !== 'faculty')) {
      return NextResponse.json({ error: 'Only faculty and admin can upload materials' }, { status: 403 });
    }

    await connectDB();

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const department = formData.get('department') as string;
    const year = formData.get('year') as string;
    const file = formData.get('file') as File;

    if (!title || !file) {
      return NextResponse.json({ error: 'Title and file are required' }, { status: 400 });
    }

    // Process file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename to prevent overrides
    const ext = path.extname(file.name);
    const fileName = `${uuidv4()}${ext}`;
    
    // Save to public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);
    
    const fileUrl = `/uploads/${fileName}`;

    // Create database record
    const materialData: any = {
      title,
      description: description || '',
      fileUrl,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadedBy: user.id,
    };

    if (department && department !== 'null' && department !== 'undefined') {
      materialData.department = department;
    }
    
    if (year && year !== 'null' && year !== 'undefined') {
      materialData.year = Number(year);
    }

    const material = await Material.create(materialData);
    const populated = await Material.findById(material._id)
      .populate('uploadedBy', 'name')
      .populate('department', 'name code')
      .lean();

    return NextResponse.json(populated, { status: 201 });
  } catch (error: any) {
    console.error('Upload material error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
