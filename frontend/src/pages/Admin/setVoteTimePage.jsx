import { useState,useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const SetVotingTime = () => {
  const { user } = useAuth();

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  /* toast setter for errors */
  useEffect(() => {
    if (!error) return;
    toast.error(error, { id: "voter-registration-error" });
  }, [error]);

  if (!user || user.role !== "admin") {
    return (
      <div className="app-page flex items-center justify-center">
        <div className="app-alertError">Access denied. Admins only.</div>
      </div>
    );
  }
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!startTime || !endTime) {
      setError("Both start time and end time are required");
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      setError("Start time must be before end time");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("adminToken");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/setVotingTime`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ startTime, endTime }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to set voting time");
      }

      setMessage("Voting window set successfully");
      setStartTime("");
      setEndTime("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-page flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg app-card">
        <div className="app-cardHeaderBrand text-center">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Set voting window
          </h2>
          <p className="text-brand-100 text-sm mt-1">
            Configure when voting opens and closes
          </p>
        </div>

        <div className="px-6 py-6">
          {message && <div className="app-alertSuccess mb-4">{message}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="app-label">Start time</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="app-input"
              />
            </div>

            <div>
              <label className="app-label">End time</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="app-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={loading ? "app-btnDisabled w-full" : "app-btnPrimary w-full"}
            >
              {loading ? "Saving..." : "Save voting time"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetVotingTime;