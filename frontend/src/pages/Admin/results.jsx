import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const ProgressBar = ({ labelLeft, labelRight, value, total, accent = "bg-brand-600" }) => {
  const safeTotal = total > 0 ? total : 1;
  const pct = Math.min(100, Math.max(0, Math.round((value / safeTotal) * 100)));

  return (
    <div className="app-card p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-extrabold text-slate-900">{labelLeft}</p>
        <p className="text-sm font-extrabold text-slate-700">
          {value} <span className="text-slate-400 font-semibold">/ {total}</span>
        </p>
      </div>

      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${accent} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>

      <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
        <span>{labelRight}</span>
        <span className="font-bold">{pct}%</span>
      </div>
    </div>
  );
};

const WinnerCard = ({ position, winner }) => {
  return (
    <div className="app-card border-b border-black ">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">
            Position
          </p>
          <p className="text-base font-extrabold text-slate-900">{position}</p>
        </div>

        <span className="text-xs font-extrabold rounded-full bg-brand-50 text-brand-800 border border-brand-200 px-3 py-1">
          Top candidate
        </span>
      </div>

      <div className="p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0 border border-slate-200">
          {winner?.image ? (
            <img src={winner.image} alt={winner.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-slate-500 text-lg font-extrabold">
              {(winner?.name || "?")[0]?.toUpperCase()}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-slate-900 font-extrabold truncate">{winner?.name || "—"}</p>
          <p className="text-slate-500 text-xs truncate">
            {winner?.department || "Department —"} • {winner?.party || "Party —"}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Votes</span>
            <span className="text-xs font-extrabold text-brand-800 bg-brand-50 border border-brand-200 rounded-full px-3 py-1">
              {winner?.votes ?? 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResultsPage = () => {
  const { user } = useAuth();

  const [contestants, setContestants] = useState([]);
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdmin = !!user && user.role === "admin";

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("adminToken");

    const fetchAll = async () => {
      setLoading(true);
      setError("");

      try {
        const [cRes, vRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/admin/getContestant?page=1&limit=10000`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${import.meta.env.VITE_API_URL}/admin/voters?page=1&limit=10000`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const cData = await cRes.json();
        const vData = await vRes.json();

        if (!cRes.ok) throw new Error(cData?.error || "Failed to load contestants");
        if (!vRes.ok) throw new Error(vData?.error || "Failed to load voters");

        setContestants(cData?.contestants || []);
        setVoters(vData?.voters || []);
      } catch (err) {
        setError(err.message || "Failed to load results");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [isAdmin]);

  const totalVoters = voters.length;
  const votedCount = voters.filter((v) => v.hasVoted).length;
  const pendingCount = Math.max(0, totalVoters - votedCount);
  const totalContestants = contestants.length;

  const winnersByPosition = useMemo(() => {
    const map = new Map();
    for (const c of contestants) {
      const pos = (c.position || "Unspecified").trim() || "Unspecified";
      const current = map.get(pos);

      const cVotes = c.votes ?? 0;
      const curVotes = current?.votes ?? 0;

      if (!current || cVotes > curVotes) map.set(pos, c);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [contestants]);

  const contestantsPerPosition = useMemo(() => {
    const counts = new Map();
    for (const c of contestants) {
      const pos = (c.position || "Unspecified").trim() || "Unspecified";
      counts.set(pos, (counts.get(pos) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([position, count]) => ({ position, count }))
      .sort((a, b) => b.count - a.count);
  }, [contestants]);

  if (!isAdmin) {
    return (
      <div className="app-page flex items-center justify-center">
        <div className="app-alertError">Access denied. Admins only.</div>
      </div>
    );
  }

  return (
    <div className="app-page py-8">
      <div className="app-container">
       

        {error && <div className="app-alertError mb-5">{error}</div>}

        {loading ? (
          <div className="app-card p-10">
            <div className="text-sm text-slate-500">Loading results...</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="app-card p-5">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                  Total voters
                </p>
                <p className="text-3xl font-extrabold text-slate-900 mt-2">{totalVoters}</p>
                <p className="text-xs text-slate-500 mt-1">Registered voters</p>
              </div>

              <div className="app-card p-5">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                  Voted
                </p>
                <p className="text-3xl font-extrabold text-brand-700 mt-2">{votedCount}</p>
                <p className="text-xs text-slate-500 mt-1">Completed voting</p>
              </div>

              <div className="app-card p-5">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                  Total contestants
                </p>
                <p className="text-3xl font-extrabold text-slate-900 mt-2">{totalContestants}</p>
                <p className="text-xs text-slate-500 mt-1">Registered candidates</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <div className="space-y-4">
                <ProgressBar
                  labelLeft="Voter participation"
                  labelRight="Total voters"
                  value={votedCount}
                  total={totalVoters}
                  accent="bg-brand-600"
                />
                <ProgressBar
                  labelLeft="Pending voters"
                  labelRight="Total voters"
                  value={pendingCount}
                  total={totalVoters}
                  accent="bg-slate-500"
                />
              </div>

              <div className="app-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-extrabold text-slate-900">
                    Contestants by position
                  </p>
                  <span className="text-xs font-bold text-slate-500">
                    {contestantsPerPosition.length} positions
                  </span>
                </div>

                {contestantsPerPosition.length === 0 ? (
                  <p className="text-slate-500 text-sm">No contestants yet.</p>
                ) : (
                  <div className="space-y-3">
                    {contestantsPerPosition.slice(0, 10).map((row) => {
                      const max = contestantsPerPosition[0]?.count || 1;
                      const pct = Math.round((row.count / max) * 100);

                      return (
                        <div key={row.position}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-700 font-bold truncate">
                              {row.position}
                            </span>
                            <span className="text-slate-500 font-extrabold">
                              {row.count}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-600 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}

                    {contestantsPerPosition.length > 10 && (
                      <p className="text-xs text-slate-500 pt-1">
                        Showing top 10 positions by contestant count.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-3 flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-lg font-extrabold text-slate-900">Winners by position</h2>
              <p className="text-xs text-slate-500 font-bold">Highest votes per position</p>
            </div>

            {winnersByPosition.length === 0 ? (
              <div className="app-card p-6 text-slate-500">
                No results yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {winnersByPosition.map(([position, winner]) => (
                  <WinnerCard key={position} position={position} winner={winner} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;