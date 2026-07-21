import { Response } from 'express';
import Attendance, { AttendanceStatus } from '../models/Attendance';
import Student from '../models/Student';
import { AuthRequest } from '../middlewares/authMiddleware';

// Mark attendance for multiple students at once
export const markAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, departmentId, records } = req.body;
    // records: [{ studentId: string, status: 'present' | 'absent' }]
    const facultyId = req.user?.id;

    if (!records || !Array.isArray(records) || records.length === 0) {
      res.status(400).json({ message: 'No attendance records provided' });
      return;
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const results = [];
    for (const record of records) {
      const { studentId, status } = record;

      // Upsert: update if exists, create if not
      const attendance = await Attendance.findOneAndUpdate(
        { student: studentId, date: attendanceDate },
        {
          student: studentId,
          faculty: facultyId,
          date: attendanceDate,
          status: status === 'present' ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT,
          department: departmentId,
        },
        { upsert: true, new: true }
      );
      results.push(attendance);
    }

    res.status(201).json({ message: `Attendance marked for ${results.length} students`, count: results.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance records for a department on a specific date
export const getAttendanceByDate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, departmentId } = req.query;

    if (!date || !departmentId) {
      res.status(400).json({ message: 'Date and departmentId are required' });
      return;
    }

    const queryDate = new Date(date as string);
    queryDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(queryDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get all students in the department
    const students = await Student.find({ department: departmentId as string }).sort({ name: 1 });

    // Get attendance records for this date
    const attendanceRecords = await Attendance.find({
      department: departmentId as string,
      date: { $gte: queryDate, $lt: nextDay },
    });

    // Map attendance to students
    const attendanceMap = new Map<string, string>();
    attendanceRecords.forEach((record) => {
      attendanceMap.set(record.student.toString(), record.status);
    });

    const result = students.map((student) => ({
      _id: student._id,
      name: student.name,
      rollNumber: student.rollNumber,
      phoneNumber: student.phoneNumber,
      status: attendanceMap.get(student._id.toString()) || null,
    }));

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance history for a specific student
export const getStudentAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { month, year } = req.query;

    const filter: any = { student: id };

    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const records = await Attendance.find(filter)
      .populate('faculty', 'name')
      .sort({ date: -1 });

    // Calculate stats
    const total = records.length;
    const present = records.filter((r) => r.status === AttendanceStatus.PRESENT).length;
    const absent = total - present;

    res.json({
      records,
      stats: { total, present, absent, percentage: total > 0 ? Math.round((present / total) * 100) : 0 },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get overall stats for the dashboard
export const getAttendanceStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalStudents = await Student.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayRecords = await Attendance.find({
      date: { $gte: today, $lt: tomorrow },
    });

    const todayPresent = todayRecords.filter((r) => r.status === AttendanceStatus.PRESENT).length;
    const todayTotal = todayRecords.length;

    res.json({
      totalStudents,
      todayPresent,
      todayAbsent: todayTotal - todayPresent,
      todayTotal,
      todayPercentage: todayTotal > 0 ? Math.round((todayPresent / todayTotal) * 100) : 0,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
