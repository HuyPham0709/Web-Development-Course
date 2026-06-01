import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Invitation {
  id: number;
  message: string;
  status: string;
  job_title: string;
  employer_name: string;
  company_name: string;
  job_id: number | string;
}

export const InviteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/invitations/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });
        const result = await response.json();
        if (result.success) {
          setInvitation(result.data);
        }
      } catch (error) {
        console.error("Error in extracting details:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  const handleUpdateStatus = async (status: 'accepted' | 'rejected') => {
    try {
      const response = await fetch(`http://localhost:5000/api/invitations/status/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status })
      });
      const result = await response.json();
      
      if (result.success) {
        if (status === 'accepted') {
          alert("Job offer accepted! Going to the jobs page...");
          // 👈 CHUYỂN HƯỚNG SANG TRANG CHI TIẾT CÔNG VIỆC
          if (invitation?.job_id) {
            navigate(`/job/${invitation.job_id}`);
          } else {
            alert("Error: Cannot find job ID from the system.");
          }
        } else {
          alert("Job offer rejected.");
          // If rejected, just reload the page to show the "Rejected" status
          window.location.reload(); 
        }
      }
    } catch (error) {
      alert("Error when updating status!");
    }
  };

  if (loading) return <div className="text-center text-slate-400 p-10">Loading data...</div>;
  if (!invitation) return <div className="text-center text-red-400 p-10">Invitation not found.</div>;

  return (
    <div className="max-w-2xl mx-auto my-10 p-6 bg-[#111827] border border-slate-800 rounded-xl text-slate-50">
      <h2 className="text-2xl font-bold mb-4">Invitation Details</h2>
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg mb-6">
        <p className="mb-2"><strong>Company:</strong> {invitation.company_name}</p>
        <p className="mb-2"><strong>Sender:</strong> {invitation.employer_name}</p>
        <p className="mb-2"><strong>Job Position:</strong> <span className="text-blue-400 font-semibold">{invitation.job_title}</span></p>
        <p className="mt-4 p-4 bg-slate-950 rounded border border-slate-800 italic text-slate-300">
          "{invitation.message}"
        </p>
      </div>

      <div className="flex gap-4 justify-end">
        {invitation.status === 'pending' ? (
          <>
            <button onClick={() => handleUpdateStatus('rejected')} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition">Reject</button>
            <button onClick={() => handleUpdateStatus('accepted')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition">Accept Invitation</button>
          </>
        ) : (
          <span className={`px-4 py-2 rounded-lg font-bold ${invitation.status === 'accepted' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
            {invitation.status === 'accepted' ? 'Accepted' : 'Rejected'}
          </span>
        )}
      </div>
    </div>
  );
};