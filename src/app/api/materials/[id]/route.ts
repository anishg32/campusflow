import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import connectDB from '@/lib/db';
import Material from '@/lib/models/Material';
import { verifyAuth } from '@/lib/auth';

// DELETE /api/materials/[id] - Delete a material
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user || (user.role !== 'admin' && user.role !== 'faculty')) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;

    const material = await Material.findById(id);
    if (!material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    // Faculty can only delete their own materials, Admins can delete any
    if (user.role === 'faculty' && material.uploadedBy.toString() !== user.id) {
      return NextResponse.json({ error: 'You can only delete your own materials' }, { status: 403 });
    }

    // Delete file from filesystem
    if (material.fileUrl && material.fileUrl.startsWith('/uploads/')) {
      const fileName = material.fileUrl.replace('/uploads/', '');
      const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
      try {
        await unlink(filePath);
      } catch (err: any) {
        console.warn('Failed to delete file from filesystem, might already be deleted:', err.message);
      }
    }

    // Delete from DB
    await Material.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete material error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
