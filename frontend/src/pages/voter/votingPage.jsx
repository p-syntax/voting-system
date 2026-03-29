import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ContestantCard from "../../components/ContestantCard";
import toast from "react-hot-toast";

const VotingPage = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [positions, setPositions] = useState({});
  const [votedPositions, setVotedPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [endTime, setEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const token = localStorage.getItem("voterToken");
  //setting the toast values 
  useEffect(() => {
    if (!error) return;
    toast.error(error, { id: "voter-paage" });
  }, [error]);


  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`http://localhost:5555/voter/getcontestants`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.status === 403) {
          toast.error(data.error);
          setError(data.error);
        }
        if (!res.ok) throw new Error(data.error || "Failed to load contestants");

        setPositions(data.positions || {});
        setVotedPositions(data.votedPositions || []);

        if (data.endTime) {
          setEndTime(data.endTime);
          toast.success("Voting is open");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, navigate]);

  const handleVoteSuccess = (position) => {
    setVotedPositions((prev) => (prev.includes(position) ? prev : [...prev, position]));
    setPositions((prev) => ({
      ...prev,
      [position]: { ...prev[position], hasVoted: true },
    }));
  };

  useEffect(() => {
    if (!endTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(endTime);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Voting closed");
        toast.error("Voting time has ended");
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:` +
          `${minutes.toString().padStart(2, "0")}:` +
          `${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const allPositions = Object.keys(positions);
  const votedCount = votedPositions.length;
  const totalCount = allPositions.length;
  const allVoted = totalCount > 0 && votedCount === totalCount;
  const progressPct = totalCount > 0 ? Math.round((votedCount / totalCount) * 100) : 0;

  const handleCompleteVoting = async () => {
    if (!allVoted) return;
    setCompleting(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:5555/voter/completeVoting`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to complete voting");
      setCompleted(true);
      setSuccessMsg("Your ballot has been submitted successfully.");
      setTimeout(() => navigate("/thank-you"), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setCompleting(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem("voterToken");
    setUser(null);
    navigate("/");
  };

  if (loading) {
    return (
      <div className="app-page flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
        <p className="text-brand-800 font-bold text-sm">Loading election data...</p>
      </div>
    );
  }

  return (
    <div className="app-page">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="app-container h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-base tracking-tight">
              Student election portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            
            <button onClick={handleLogout} className="app-btnOutline">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="app-container pt-8 pb-36">
        <div className="app-card mb-8 border-brand-200 bg-brand-50/40">
          <div className="px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-slate-600 text-xs font-bold uppercase tracking-widest mb-2">
                Ballot progress
              </p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-extrabold text-slate-900 leading-none">
                  {votedCount}
                </span>
                <span className="text-xl text-slate-600 font-bold mb-1">
                  / {totalCount}
                </span>
                <span className="text-sm text-slate-600 mb-1">positions</span>
              </div>
              {allVoted && !completed && (
                <p className="mt-3 text-brand-800 text-sm font-bold">
                  All positions covered. You can submit your ballot.
                </p>
              )}
            </div>

            <div className="relative w-24 h-24 flex-shrink-0">
              <svg viewBox="0 0 80 80" className="w-24 h-24 -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke="rgba(102,199,67,0.18)"
                  strokeWidth="7"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke="#66c743"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - progressPct / 100)}`}
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-slate-900 font-extrabold text-base">
                {progressPct}%
              </span>
            </div>
          </div>
        </div>

        {successMsg && <div className="app-alertSuccess mb-5">{successMsg}</div>}

        <div className="flex flex-col gap-10">
          {allPositions.map((position) => {
            const group = positions[position];
            const hasVoted = group.hasVoted || votedPositions.includes(position);

            return (
              <section key={position}>
                <div className="flex items-center gap-3 pb-3 mb-5 border-b border-slate-200">
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    {position}
                  </h3>
                  {hasVoted && (
                    <span className="text-xs font-extrabold text-brand-800 bg-brand-50 border border-brand-200 px-3 py-1 rounded-full">
                      Voted
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-5">
                  {group.contestants.map((contestant) => (
                    <ContestantCard
                      key={contestant.id}
                      contestant={contestant}
                      position={position}
                      hasVoted={hasVoted}
                      onVoteSuccess={handleVoteSuccess}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200">
        <div className="app-container py-4 flex items-center gap-4">
          <div className="mr-auto">
            {timeLeft && (
              <div className="text-sm font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl">
                Time left: <span className="font-mono">{timeLeft}</span>
              </div>
            )}
          </div>

          {!allVoted && (
            <p className="text-sm text-slate-600 font-bold hidden sm:block">
              Vote in all {totalCount} positions to submit your ballot.
            </p>
          )}
          {!user.hasVoted && 
           <button
            disabled={!allVoted || completing || completed}
            onClick={handleCompleteVoting}
            className={
              !allVoted || completing || completed
                ? "app-btnDisabled px-6 py-3 rounded-2xl"
                : "app-btnPrimary px-6 py-3 rounded-2xl"
            }
          >
            {completing ? "Submitting..." : completed ? "Ballot submitted" : "Submit ballot"}
          </button> }
        
        </div>
      </div>
    </div>
  );
};

export default VotingPage;