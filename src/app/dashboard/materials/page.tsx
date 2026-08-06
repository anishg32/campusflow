"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Upload, Search, FileText, Download, Trash2, X, Filter, Building2, Calendar, File } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiDelete } from '@/lib/api';

interface Department {
  _id: string;
  name: string;
  code: string;
}

interface Material {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
  fileSize: number;
  uploadedBy: {
    _id: string;
    name: string;
    role: string;
  };
  department?: {
    _id: string;
    name: string;
    code: string;
  };
  year?: number;
  createdAt: string;
}

export default function MaterialsPage() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  
  // Upload Modal State
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [file, setFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDepartments();
    fetchMaterials();
  }, [deptFilter, yearFilter]);

  const fetchDepartments = async () => {
    try {
      const data = await apiGet<Department[]>('/departments');
      setDepartments(data);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      let path = '/materials?';
      if (deptFilter !== 'all') path += `department=${deptFilter}&`;
      if (yearFilter !== 'all') path += `year=${yearFilter}&`;
      
      const data = await apiGet<Material[]>(path);
      setMaterials(data);
    } catch (err) {
      console.error('Failed to fetch materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Limit file size to 20MB for local uploads
      if (selectedFile.size > 20 * 1024 * 1024) {
        setUploadError('File size must be less than 20MB');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setFile(selectedFile);
      setUploadError('');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !file) {
      setUploadError('Title and file are required');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (selectedDept !== 'all') formData.append('department', selectedDept);
      if (selectedYear !== 'all') formData.append('year', selectedYear);
      formData.append('file', file);

      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      // Reset and close
      setShowUpload(false);
      setTitle('');
      setDescription('');
      setSelectedDept('all');
      setSelectedYear('all');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      fetchMaterials();
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    try {
      await apiDelete(`/materials/${id}`);
      setMaterials(materials.filter(m => m._id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const filteredMaterials = materials.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) || 
    m.description?.toLowerCase().includes(search.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    if (type.includes('image')) return <File className="w-8 h-8 text-blue-500" />;
    if (type.includes('word') || type.includes('document')) return <FileText className="w-8 h-8 text-blue-600" />;
    return <File className="w-8 h-8 text-primary" />;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70 flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary" />
            Study Materials
          </h1>
          <p className="text-foreground/60 text-sm">Access notes, presentations, and resources.</p>
        </div>
        
        {(user?.role === 'faculty' || user?.role === 'admin') && (
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 shrink-0"
          >
            <Upload className="w-4 h-4" />
            Upload Material
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="bg-card/50 border border-border rounded-2xl p-4 flex flex-col md:flex-row gap-4 backdrop-blur-md">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            placeholder="Search materials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>
        
        {(user?.role === 'admin' || user?.role === 'faculty') && (
          <div className="flex gap-3">
            <div className="relative w-full md:w-48">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-background border border-border focus:border-primary outline-none appearance-none"
              >
                <option value="all">All Departments</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.code}</option>)}
              </select>
            </div>
            
            <div className="relative w-full md:w-36">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-background border border-border focus:border-primary outline-none appearance-none"
              >
                <option value="all">All Years</option>
                {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative"
            >
              <button
                onClick={() => setShowUpload(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-foreground/10 text-foreground/50 hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Upload Study Material
              </h2>

              {uploadError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm mb-4">
                  {uploadError}
                </div>
              )}

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Data Structures Chapter 1"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional details about this material..."
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none h-24 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Target Department</label>
                    <select
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:border-primary outline-none"
                    >
                      <option value="all">Any / General</option>
                      {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Target Year</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:border-primary outline-none"
                      disabled={selectedDept === 'all'}
                    >
                      <option value="all">All Years</option>
                      {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-1.5 block">File *</label>
                  <div className="relative">
                    <input
                      type="file"
                      required
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.zip"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-background border-2 border-border border-dashed rounded-xl appearance-none cursor-pointer hover:border-primary/50 focus:outline-none"
                    >
                      <span className="flex items-center space-x-2 text-foreground/60">
                        <Upload className="w-6 h-6" />
                        <span className="font-medium">
                          {file ? file.name : 'Click to select a file'}
                        </span>
                      </span>
                      {file && (
                        <span className="text-xs text-foreground/40 mt-2">{formatFileSize(file.size)}</span>
                      )}
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-3 mt-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload Material'
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Materials List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="bg-card/50 border border-border rounded-3xl p-12 text-center shadow-lg backdrop-blur-md">
          <BookOpen className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Materials Found</h3>
          <p className="text-foreground/50 text-sm max-w-sm mx-auto">
            {search ? 'Try adjusting your search or filters.' : 'There are no study materials posted yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material, i) => (
            <motion.div
              key={material._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:border-primary/30 group flex flex-col"
            >
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    {getFileIcon(material.fileType)}
                  </div>
                  
                  {/* Delete Button (Only for uploader or admin) */}
                  {(user?.role === 'admin' || (user?.role === 'faculty' && material.uploadedBy._id === user?._id)) && (
                    <button 
                      onClick={() => handleDelete(material._id)}
                      className="p-2 text-foreground/30 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2" title={material.title}>
                  {material.title}
                </h3>
                
                {material.description && (
                  <p className="text-foreground/60 text-sm line-clamp-2 mb-4">
                    {material.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mt-auto">
                  {material.department && (
                    <span className="text-[10px] font-bold px-2 py-1 bg-foreground/5 rounded-lg uppercase tracking-wider">
                      {material.department.code} {material.year ? `• Y${material.year}` : ''}
                    </span>
                  )}
                  <span className="text-[10px] font-bold px-2 py-1 bg-foreground/5 rounded-lg uppercase tracking-wider text-foreground/50">
                    {formatFileSize(material.fileSize)}
                  </span>
                </div>
              </div>

              <div className="border-t border-border p-4 bg-background/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                    {material.uploadedBy.name.charAt(0)}
                  </div>
                  <span className="text-xs text-foreground/60 font-medium">
                    {material.uploadedBy.name}
                  </span>
                </div>
                
                <a 
                  href={material.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors bg-primary/10 px-3 py-1.5 rounded-lg"
                >
                  <Download className="w-3.5 h-3.5" />
                  View
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
