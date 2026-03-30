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
        const res = await fetch(`${import.meta.env.VITE_API_URL}/voter/getcontestants`, {
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
    setVotedPositions((prev) =>
      prev.includes(position) ? prev : [...prev, position]
    );
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
  const progressPct =
    totalCount > 0 ? Math.round((votedCount / totalCount) * 100) : 0;

  const handleCompleteVoting = async () => {
    if (!allVoted) return;
    setCompleting(true);
    setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/voter/completeVoting`, {
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
     
      <div className="absolute inset-0 -z-10 bg-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(900px_400px_at_50%_-50%,rgba(102,199,67,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-200/70 via-slate-100 to-slate-100" />
      </div>

   
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/75 backdrop-blur-md">
        <div className="app-container h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="inline-block w-1.5 h-6 rounded-full"
              style={{ backgroundColor: "#66c743" }}
            />
            <div className="leading-tight">
              <div className="font-extrabold text-slate-900 tracking-tight">
                Student election portal
              </div>
              <div className="text-xs font-semibold text-slate-600">Ballot</div>
            </div>
          </div>

          <button onClick={handleLogout} className="app-btnOutline">
            Sign out
          </button>
        </div>
      </header>

      <main className="app-container pt-6 pb-36">
       
        <div className="mx-auto max-w-5xl">
       
          <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm mb-6">
            <div className="px-6 py-6 sm:px-8 sm:py-7 bg-gradient-to-br from-slate-900 via-slate-900 to-brand-900 text-white">
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div>
                  <p className="m-0 text-xs font-extrabold uppercase tracking-wider text-white/70">
                    Voting progress
                  </p>
                  <h1 className="m-0 mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Cast your vote
                  </h1>
                  <p className="m-0 mt-2 text-sm font-semibold text-white/80">
                    Vote once per position, then submit your ballot.
                  </p>
                </div>

                <div className="min-w-[260px] rounded-2xl bg-white/10 border border-white/15 px-4 py-4">
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-extrabold leading-none">
                      {votedCount}
                    </span>
                    <span className="text-sm font-bold text-white/80 mb-0.5">
                      / {totalCount} positions
                    </span>
                  </div>

                  <div className="mt-3 h-2.5 rounded-full bg-white/15 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${progressPct}%`,
                        backgroundColor: "#66c743",
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] font-extrabold text-white/75">
                    <span>{progressPct}%</span>
                    <span>{allVoted ? "Ready to submit" : "In progress"}</span>
                  </div>
                </div>
              </div>

              {allVoted && !completed && (
                <div className="mt-5 inline-flex items-center rounded-full border border-brand-200 bg-brand-50/20 px-3 py-1 text-xs font-extrabold text-white">
                  All positions covered
                </div>
              )}
            </div>
          </div>

          {successMsg && <div className="app-alertSuccess mb-5">{successMsg}</div>}

          <div className="flex flex-col gap-6">
            {allPositions.map((position) => {
              const group = positions[position];
              const hasVoted = group.hasVoted || votedPositions.includes(position);

              return (
                <section key={position} className="app-card shadow-sm">
                  <div className="px-6 py-5 border-b border-slate-100 bg-white/70 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-block w-1.5 h-5 rounded-full"
                        style={{ backgroundColor: "#66c743" }}
                      />
                      <h3 className="m-0 text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                        {position}
                      </h3>
                    </div>

                    {hasVoted && (
                      <span className="text-xs font-extrabold text-brand-800 bg-brand-50 border border-brand-200 px-3 py-1 rounded-full">
                        Voted
                      </span>
                    )}
                  </div>

                  <div className="p-6 bg-white/80">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="app-container py-4 flex items-center gap-4 flex-wrap">
          <div className="mr-auto">
            {timeLeft && (
              <div className="text-xs sm:text-sm font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl">
                Time left: <span className="font-mono">{timeLeft}</span>
              </div>
            )}
          </div>

          {!allVoted && (
            <p className="text-sm text-slate-600 font-bold hidden md:block">
              Vote in all {totalCount} positions to submit your ballot.
            </p>
          )}

          {!user.hasVoted && (
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
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VotingPage;