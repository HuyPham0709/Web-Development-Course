import { useState } from "react";
import axios from "axios";

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: number;
}

export default function ApplyModal({
  isOpen,
  onClose,
  jobId,
}: ApplyModalProps) {
  const [step, setStep] = useState(1);
  const [coverLetter, setCoverLetter] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const submitApplication = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    if (!cvUrl) {
      alert("Please select or upload your CV");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "https://web-development-course-y23i.onrender.com/api/applications/apply",
        {
          job_id: jobId,
          cover_letter: coverLetter,
          cv_snapshot_url: cvUrl,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setStep(3);
      } else {
        alert(res.data.message);
      }
    } catch (err: any) {
      if (err.response?.status === 400) {
        alert("You already applied for this job");
      } else {
        alert("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File must be under 5MB");
      return;
    }

    const fakeUrl = `https://storage.example.com/resumes/${Date.now()}_${file.name}`;
    setCvUrl(fakeUrl);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[600px] rounded-2xl shadow-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
        >
          ✕
        </button>

        {step === 1 && (
          <>
            <h2 className="text-xl font-bold mb-4">Select Resume</h2>

            <label className="block mb-3">
              <input
                type="radio"
                name="resume"
                checked={cvUrl === "profile_cv"}
                onChange={() => setCvUrl("profile_cv")}
              />{" "}
              Use profile CV
            </label>

            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileUpload}
            />

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setStep(2)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-bold mb-4">Cover Letter</h2>

            <textarea
              rows={6}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full border rounded-lg p-3"
              placeholder="Write your cover letter..."
            />

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border rounded-lg"
              >
                Back
              </button>

              <button
                onClick={submitApplication}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              🎉 Application Submitted!
            </h2>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}