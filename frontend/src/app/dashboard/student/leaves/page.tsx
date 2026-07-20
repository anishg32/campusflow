"use client";

export default function Leaves() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Leave Requests</h1>
      <div className="glass rounded-3xl p-8 min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <p className="text-foreground/50">No leave requests found.</p>
        <button className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold">Apply for Leave</button>
      </div>
    </div>
  );
}
