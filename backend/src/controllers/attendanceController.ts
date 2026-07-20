import { Request, Response } from 'express';
import crypto from 'crypto';
import QRSession from '../models/QRSession';
import Attendance, { AttendanceStatus } from '../models/Attendance';
import { AuthRequest } from '../middlewares/authMiddleware';
import Subject from '../models/Subject';

// Generate QR Code Session for a class
export const generateQRSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { subjectId, latitude, longitude, radius } = req.body;
    const facultyId = req.user?.id;

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      res.status(404).json({ message: 'Subject not found' });
      return;
    }

    if (subject.faculty.toString() !== facultyId) {
      res.status(403).json({ message: 'Not authorized for this subject' });
      return;
    }

    // Deactivate previous active sessions for this subject
    await QRSession.updateMany({ subject: subjectId, isActive: true }, { isActive: false });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 1000); // 30 seconds expiry

    const qrSession = await QRSession.create({
      subject: subjectId,
      faculty: facultyId,
      token,
      expiresAt,
      latitude,
      longitude,
      radius,
    });

    res.status(201).json({ qrToken: qrSession.token, expiresAt: qrSession.expiresAt });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Scan QR Code to mark attendance
export const scanQRCode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token, latitude, longitude } = req.body;
    const studentId = req.user?.id;

    const session = await QRSession.findOne({ token, isActive: true });

    if (!session) {
      res.status(400).json({ message: 'Invalid or expired QR code' });
      return;
    }

    if (new Date() > session.expiresAt) {
      session.isActive = false;
      await session.save();
      res.status(400).json({ message: 'QR code expired' });
      return;
    }

    // Geolocation verification
    if (session.latitude && session.longitude && latitude && longitude) {
      const distance = getDistanceFromLatLonInM(session.latitude, session.longitude, latitude, longitude);
      if (distance > (session.radius || 50)) {
        res.status(400).json({ message: 'You are not within the classroom radius' });
        return;
      }
    }

    // Check if attendance already marked
    const existing = await Attendance.findOne({
      student: studentId,
      subject: session.subject,
      date: { $gte: new Date().setHours(0, 0, 0, 0) },
    });

    if (existing) {
      res.status(400).json({ message: 'Attendance already marked for today' });
      return;
    }

    await Attendance.create({
      student: studentId,
      subject: session.subject,
      faculty: session.faculty,
      status: AttendanceStatus.PRESENT,
      method: 'qr',
    });

    res.status(201).json({ message: 'Attendance marked successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Mark attendance via Face Recognition
export const markFaceAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { subjectId, studentId, confidence } = req.body;
    // Note: AI matching logic happens on the client side (face-api.js), 
    // we receive the verified studentId here or verify embeddings backend.
    // For this architecture, we trust the client to send the matched student ID along with a secure payload.
    // In production, we'd compare embeddings here on the server.
    
    if (confidence < 0.6) {
       res.status(400).json({ message: 'Face recognition confidence too low' });
       return;
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      res.status(404).json({ message: 'Subject not found' });
      return;
    }

    const existing = await Attendance.findOne({
      student: studentId,
      subject: subjectId,
      date: { $gte: new Date().setHours(0, 0, 0, 0) },
    });

    if (existing) {
      res.status(400).json({ message: 'Attendance already marked for today' });
      return;
    }

    await Attendance.create({
      student: studentId,
      subject: subjectId,
      faculty: subject.faculty,
      status: AttendanceStatus.PRESENT,
      method: 'face',
    });

    res.status(201).json({ message: 'Face Attendance marked successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Manual Attendance Entry by Faculty with SMS trigger
export const markManualAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentEmail, status } = req.body; // status: 'present' | 'absent'
    const facultyId = req.user?.id;

    // Find student by email
    const User = require('../models/User').default;
    const student = await User.findOne({ email: studentEmail, role: 'student' });
    
    if (!student) {
      res.status(404).json({ message: 'Student not found with that email' });
      return;
    }

    // In a real app, we'd specify the subject. For simplicity, we just log a generic manual attendance record.
    await Attendance.create({
      student: student._id,
      faculty: facultyId,
      status: status === 'present' ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT,
      method: 'manual',
    });

    // SIMULATED SMS
    if (student.phoneNumber) {
      console.log(`\n\n[SMS DISPATCH]`);
      console.log(`To: ${student.phoneNumber}`);
      console.log(`Message: Your attendance has been manually marked as ${status.toUpperCase()} by your faculty.`);
      console.log(`Status: Delivered\n\n`);
    } else {
      console.log(`\n\n[SMS WARNING] Could not send SMS to ${student.name} - No phone number on file.\n\n`);
    }

    res.status(201).json({ 
      message: `Attendance marked ${status} for ${student.name}`,
      smsSent: !!student.phoneNumber
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function for Haversine formula
function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371e3; // Radius of the earth in m
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in m
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
