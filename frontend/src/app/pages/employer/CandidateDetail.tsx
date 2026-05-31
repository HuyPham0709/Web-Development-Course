// ==========================================
// CandidateDetail.tsx (Dark Mode, JobSpot Premium UI Modals)
// ==========================================
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Mail, Phone, Linkedin, Github, Globe, Download, Printer, ChevronRight, 
  Briefcase, FileText, Send, Loader2, X, Calendar, MapPin, Clock, MessageSquare 
} from 'lucide-react';
import { applicationService } from '../../../services/applicationService';
import { ApplicationDetail, ApplicationNote } from '../../../types/application';

export default function CandidateDetail() {
  const { id } = useParams<{ id: string }>();

  const [candidate, setCandidate] = useState<ApplicationDetail | null>(null);
  const [notes, setNotes] = useState<ApplicationNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  // State to control smooth entrance animation
  const [animate, setAnimate] = useState(false);
  
  // ================= INTERVIEW MODAL STATE =================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    location: '',
    time: '',
    message: 'We would like to cordially invite you to join an in-person interview at our company office.'
  });

  const steps = ['Pending', 'Reviewed', 'Interview', 'Hired'];

  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [detailRes, notesRes] = await Promise.all([
          applicationService.getApplicationById(id),
          applicationService.getNotes(id as any)
        ]);
        setCandidate(detailRes.data.data);
        setNotes(notesRes.data.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setAnimate(true), 60);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const handleAddNote = async () => {
    if (!newNote.trim() || !id) return;
    try {
      const res = await applicationService.addNote(id as any, newNote);
      setNotes([...notes, res.data.data]);
      setNewNote('');
    } catch (error) {
      console.error("Error adding note:", error);
      alert("Cannot add note at this time.");
    }
  };

  const handleUpdateStatus = async (stepLabel: string) => {
    if (!candidate || !id) return;

    let backendStatus = stepLabel.toLowerCase();
    if (backendStatus === 'interview') backendStatus = 'interviewing';
    if (backendStatus === 'hired') backendStatus = 'accepted';

    if (candidate.status?.toLowerCase() === backendStatus) return;

    // Intercept when clicking on "Interview" step to show the interview email invitation modal
    if (backendStatus === 'interviewing') {
      setIsModalOpen(true);
      return; 
    }

    const oldStatus = candidate.status;
    setCandidate({ ...candidate, status: backendStatus });

    try {
      if (applicationService.updateStatus) {
        await applicationService.updateStatus(id as any, backendStatus);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setCandidate({ ...candidate, status: oldStatus });
      alert("Error 400: Cannot update status due to incorrect Backend format.");
    }
  };

  // ================= HANDLE SUBMIT INTERVIEW INVITATION =================
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSendingInvite(true);
    try {
      if (applicationService.inviteInterview) {
        // Step 1: Call API to send email from the backend server
        await applicationService.inviteInterview({ 
          application_id: id,
          ...interviewForm
        });
        
        // Step 2: After successfully sending the email, update the application status to 'interviewing'
        if (applicationService.updateStatus) {
          await applicationService.updateStatus(id as any, 'interviewing');
        }

        alert("Interview invitation has been sent via email!");
        setCandidate(prev => prev ? { ...prev, status: 'interviewing' } : null);
        setIsModalOpen(false);
      } else {
        alert("The function inviteInterview has not been configured in applicationService.");
      }
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to send interview invitation.");
    } finally {
      setSendingInvite(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center gap-2 text-blue-600 dark:text-blue-400 dark:bg-[#0E1422] transition-colors duration-300">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-gray-400 text-sm">Loading profile...</span>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 dark:text-gray-400 dark:bg-[#0E1422] transition-colors duration-300">
        <div className="text-center py-12">Candidate not found.</div>
      </div>
    );
  }

  let activeStep = 0;
  switch (candidate.status?.toLowerCase()) {
    case 'pending': activeStep = 0; break;
    case 'reviewed': activeStep = 1; break;
    case 'interviewing':
    case 'interview': activeStep = 2; break;
    case 'accepted':
    case 'hired': activeStep = 3; break;
    case 'rejected': activeStep = -1; break;
    default: activeStep = 0;
  }

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/30';
      case 'reviewed': return 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/30';
      case 'interviewing':
      case 'interview': return 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200/30';
      case 'accepted':
      case 'hired': return 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 border border-green-200/30';
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200/30';
      default: return 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-400 border border-transparent';
    }
  };

  const displayName = candidate.full_name || candidate.candidate_name || 'Candidate';
  const cvFile = candidate.cv_url || '';
  const cvLink = cvFile.startsWith('http')
    ? cvFile
    : `${backendUrl}/uploads/${cvFile.replace(/^(?:\/?uploads\/)+/, '')}`;
  const cleanCvFile = cvFile;
  const rawAvatar = candidate.avatar_url || candidate.avatar;
  const avatarSrc = rawAvatar
    ? (rawAvatar.startsWith('http') || rawAvatar.startsWith('data:')
      ? rawAvatar
      : `${backendUrl}/${rawAvatar.replace(/^\//, '')}`)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#0E1422]/60 py-4 transition-colors duration-300">
      <div className="flex flex-col gap-6 font-sans pb-12 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className={`flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2 mt-4 transform transition-all duration-500 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Link to="/employer/candidates" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Candidates</Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="text-gray-900 dark:text-white font-medium">{displayName}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT COLUMN */}
          <div className={`w-full lg:w-[340px] flex-shrink-0 flex flex-col gap-6 transform transition-all duration-500 ease-out delay-75 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-sm transition-colors">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden shrink-0 border border-gray-200 dark:border-white/10 transition-colors">
                    <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { const target = e.target as HTMLImageElement; target.onerror = null; target.src = "https://placehold.co/150x150/e2e8f0/64748b?text=No+Image"; }} />
                  </div>
                  {candidate.experience_level && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 dark:bg-blue-500 text-white text-[11px] font-bold px-3 py-0.5 rounded-full border-2 border-white dark:border-[#0E1422] whitespace-nowrap shadow-sm">
                      {candidate.experience_level}
                    </div>
                  )}
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-2">{displayName}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5 mt-1">
                  <Briefcase className="w-4 h-4 text-gray-400" /> {candidate.job_title || 'Candidate'}
                </p>
              </div>

              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#0E1422]/30 text-sm transition-colors">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{candidate.candidate_email}</span>
                </div>
                {candidate.phone && (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#0E1422]/30 text-sm transition-colors">
                    <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">{candidate.phone}</span>
                  </div>
                )}
              </div>

              {candidate.skills && candidate.skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill: string) => (
                      <span key={skill} className="px-3 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium border border-transparent dark:border-blue-500/20 transition-colors">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Bio</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {candidate.bio || 'No bio provided.'}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-full flex-1 flex flex-col gap-6">

            {/* 1. Application Status Card */}
            <div className={`bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-sm transform transition-all duration-500 ease-out delay-150 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Application Status</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Applied on {new Date(candidate.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                  <div className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm transition-colors ${getStatusColor(candidate.status)}`}>
                    {candidate.status || 'Action Required'}
                  </div>
                </div>
              </div>

              {/* Timeline Flow */}
              <div className="relative flex items-center justify-between w-full mt-6 px-2 pb-8">
                <div className="absolute left-6 right-6 top-3 h-1 bg-gray-200 dark:bg-white/10 z-0 rounded-full">
                  <div
                    className="absolute left-0 top-0 h-full bg-blue-600 dark:bg-blue-500 z-0 rounded-full transition-all duration-500"
                    style={{ width: `${activeStep >= 0 ? (activeStep / (steps.length - 1)) * 100 : 0}%` }}
                  ></div>
                </div>

                {steps.map((step, index) => {
                  const isCompleted = activeStep >= 0 && index <= activeStep;
                  return (
                    <div key={step} onClick={() => handleUpdateStatus(step)} className="relative z-10 flex flex-col items-center cursor-pointer group">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 group-hover:scale-110 group-hover:shadow-md ${isCompleted
                          ? 'bg-blue-600 dark:bg-blue-500 text-white ring-4 ring-white dark:ring-[#0E1422]'
                          : 'bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400 ring-4 ring-white dark:ring-[#0E1422] group-hover:bg-gray-300 dark:group-hover:bg-white/20'
                        }`}>
                        {index + 1}
                      </div>
                      <span className={`text-xs font-medium absolute top-9 whitespace-nowrap transition-colors ${isCompleted ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Resume Document Card */}
            <div className={`bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-sm transform transition-all duration-500 ease-out delay-300 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Resume Document</h3>
                <div className="flex items-center gap-4">
                  <a href={cvLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 dark:bg-blue-500 text-white text-sm font-medium rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm">
                    <Download className="w-4 h-4" />
                    Download PDF
                  </a>
                </div>
              </div>
              <div className="w-full h-[600px] bg-slate-50 dark:bg-[#0E1422]/40 rounded-xl border border-gray-200 dark:border-white/10 relative overflow-hidden transition-colors">
                {cleanCvFile ? (
                  <iframe src={cvLink} className="w-full h-full border-0 absolute inset-0 z-10 dark:opacity-90" title="CV Viewer" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">
                    No attachment available
                  </div>
                )}
              </div>
            </div>

            {/* 3. HR Internal Notes Card */}
            <div className={`bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-sm relative overflow-hidden transform transition-all duration-500 ease-out delay-[400ms] ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <div className="absolute left-0 top-0 w-1.5 h-full bg-blue-600 dark:bg-blue-500"></div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 ml-2">HR Notes</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 ml-2">Internal workspace. Candidate cannot see these notes.</p>
              
              {notes.length > 0 && (
                <div className="mb-4 space-y-3 ml-2">
                  {notes.map(note => (
                    <div key={note.id} className="bg-gray-50 dark:bg-[#0E1422]/30 p-4 rounded-xl border border-gray-100 dark:border-white/5 text-sm transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-900 dark:text-white">{note.username || note.display_name || 'HR Team'}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(note.created_at).toLocaleString('en-US')}</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative ml-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full bg-white dark:bg-[#0E1422]/60 border border-gray-200 dark:border-white/10 rounded-xl p-4 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/30 transition-all resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white min-h-[100px]"
                  placeholder="Add your interview feedback or internal notes here..."
                ></textarea>
                <button onClick={handleAddNote} className="absolute bottom-3 right-3 p-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 🔥 INTERVIEW INVITATION POPUP MODAL PREMIUM UI ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all">
          <div className="bg-white dark:bg-[#111827] w-full max-w-lg rounded-3xl border border-gray-100 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden relative transform transition-all duration-300 scale-100">
            
            {/* Accent Gradient Top Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#0052FF] to-[#8B5CF6]" />

            {/* Close Button */}
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              className="absolute right-5 top-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-7">
              {/* Modal Header */}
              <div className="mb-6">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0052FF] dark:text-blue-400">
                    <Calendar className="w-5 h-5" />
                  </span>
                  Invite Candidate to Interview
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Set up the schedule and invitation content. The system will automatically wrap this in a standardized premium email format and send it to <span className="font-semibold text-slate-700 dark:text-slate-200">{displayName}</span>.
                </p>
              </div>

              {/* Form Content */}
              <form onSubmit={handleInviteSubmit} className="space-y-5">
                
                {/* 1. Location */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Interview Location
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0052FF] transition-colors">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input 
                      required 
                      type="text" 
                      value={interviewForm.location} 
                      onChange={e => setInterviewForm({...interviewForm, location: e.target.value})}
                      placeholder="e.g., 5th Floor, Bitexco Tower, Dist. 1, HCMC or Google Meet"
                      className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 dark:bg-[#1F2937]/40 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] dark:focus:border-[#8B5CF6] transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                    />
                  </div>
                </div>

                {/* 2. Time */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Interview Schedule
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0052FF] transition-colors">
                      <Clock className="w-4 h-4" />
                    </div>
                    <input 
                      required 
                      type="datetime-local" 
                      value={interviewForm.time} 
                      onChange={e => setInterviewForm({...interviewForm, time: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 dark:bg-[#1F2937]/40 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] dark:focus:border-[#8B5CF6] transition-all cursor-pointer text-slate-700 dark:text-slate-200" 
                    />
                  </div>
                </div>

                {/* 3. Message */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Message / Additional Notes
                  </label>
                  <div className="relative group">
                    <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400 group-focus-within:text-[#0052FF] transition-colors">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <textarea 
                      rows={4} 
                      value={interviewForm.message} 
                      onChange={e => setInterviewForm({...interviewForm, message: e.target.value})}
                      placeholder="Enter warm greetings or notes regarding required interview documents..."
                      className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 dark:bg-[#1F2937]/40 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] dark:focus:border-[#8B5CF6] transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600 leading-relaxed" 
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-3 border-t border-slate-100 dark:border-white/5 mt-6">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-all duration-200"
                  >
                    Cancel
                  </button>
                  
                  <button 
                    type="submit" 
                    disabled={sendingInvite} 
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#0052FF] to-[#8B5CF6] hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 transition-all duration-200 cursor-pointer shadow-md"
                  >
                    {sendingInvite ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Invitation'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}