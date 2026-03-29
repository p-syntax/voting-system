
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AddContestant from "./ContestantRegistration.jsx";
import Contestants from "./Contestants.jsx";
import VoterRegistration from "./voterRegistration.jsx";
import SetVotingTime from "./setVoteTimePage.jsx";
import ResultsPage from "./results.jsx";
import Voters from "./voters.jsx";
import toast from "react-hot-toast";



const Icon = ({ d, size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Icons = {
  overview: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  contestants: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  voters: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  votes: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3",
  positions: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  add: "M12 5v14M5 12h14",
  chart: "M18 20V10M12 20V4M6 20v-6",
  register: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6",
};

const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={[
      "flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-left transition-colors border",
      active
        ? "bg-brand-50 text-brand-800 border-brand-200"
        : "bg-white text-slate-700 border-transparent hover:bg-brand-50/50 hover:text-slate-900 hover:border-brand-200",
    ].join(" ")}
    style={{ fontSize: 13 }}
  >
    <Icon d={icon} size={16} color={active ? "#66c743" : "#475569"} />
    <span className="font-bold">{label}</span>
  </button>
);

const StatCard = ({ title, value, sub, icon }) => (
  <div className="app-cardTint">
    <div className="p-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-slate-600 font-extrabold uppercase tracking-wide text-xs">{title}</span>
        <span className="rounded-xl flex p-2 bg-white border border-brand-100">
          <Icon d={icon} size={16} color="#66c743" />
        </span>
      </div>
      <p className="text-slate-900 font-extrabold m-0 text-3xl">{value}</p>
      {sub && <p className="text-slate-600 m-0 mt-1 text-xs font-semibold">{sub}</p>}
    </div>
    <div className="h-1" style={{ backgroundColor: "#66c743" }} />
  </div>
);

const ActionBtn = ({ onClick, icon, label }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold border border-brand-200 bg-white text-brand-800 transition-colors hover:bg-brand-50/40"
  >
    <Icon d={icon} size={15} color="#66c743" />
    {label}
  </button>
);

const Badge = ({ voted }) => (
  <span className={[
    "text-[10px] font-extrabold rounded-full px-2.5 py-1 border",
    voted ? "bg-brand-50 text-brand-800 border-brand-200" : "bg-white text-slate-600 border-slate-200",
  ].join(" ")}>
    {voted ? "Voted" : "Pending"}
  </span>
);

const SectionHeader = ({ title, onViewAll }) => (
  <div className="px-5 py-4 flex items-center justify-between bg-white/70">
    <div className="flex items-center gap-3">
      <span className="inline-block w-1.5 h-5 rounded-full" style={{ backgroundColor: "#66c743" }} />
      <h2 className="m-0 text-slate-900 font-extrabold text-sm">{title}</h2>
    </div>
    <button
      onClick={onViewAll}
      className="text-xs font-extrabold text-brand-700 bg-transparent border-none cursor-pointer hover:text-brand-800 transition-colors"
    >
      View all
    </button>
  </div>
);

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [contestants, setContestants] = useState([]);
  const [voters, setVoters] = useState([]);

  useEffect(() => {
   if (!user || user.role !== "admin") {
      toast("Please log in as an admin to continue", {
        id: "admin-login-required",
      });
      navigate("/");
      return; 
    }
    const token = localStorage.getItem("adminToken");
    const fetchData = async () => {
      setLoading(true); setError("");
      try {
        const [cRes, vRes] = await Promise.all([
          fetch(`http://localhost:5555/admin/getContestant?page=1&limit=1000`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`http://localhost:5555/admin/voters?page=1&limit=1000`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (cRes.status === 401 || vRes.status === 401) { navigate("/admin/login"); return; }
        const cData = await cRes.json();
        const vData = await vRes.json();
        if (!cRes.ok) throw new Error(cData.error || "Failed to load contestants");
        if (!vRes.ok) throw new Error(vData.error || "Failed to load voters");
        setContestants(cData.contestants || []);
        setVoters(vData.voters || []);
      } catch (err) { setError(err.message || "Failed to load data"); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [user, navigate]);

  const totalContestants = contestants.length;
  const totalVoters = voters.length;
  const votesCast = contestants.reduce((s, c) => s + (c.votes || 0), 0);
  const positions = Array.from(new Set(contestants.map((c) => c.position))).length;
  const completedVoters = voters.filter((v) => v.hasVoted).length;
  const turnout = totalVoters ? Math.round((completedVoters / totalVoters) * 100) : 0;

  const recentContestants = [...contestants].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  const recentVoters = [...voters].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

  const renderPage = () => {
    switch (activePage) {
      case "contestants": return <Contestants onAddContestant={() => setActivePage("addContestant")} />;
      case "voters": return <Voters onAddVoter={() => setActivePage("registerVoter")} />;
      case "results": return <ResultsPage />;
      case "addContestant": return <AddContestant />;
      case "registerVoter": return <VoterRegistration />;
      case "votingTime": return <SetVotingTime />;
      default: return renderOverview();
    }
  };

  const renderOverview = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard title="Contestants" value={loading ? "–" : totalContestants} sub="Registered candidates" icon={Icons.contestants} />
        <StatCard title="Voters" value={loading ? "–" : totalVoters} sub="Registered voters" icon={Icons.voters} />
        <StatCard title="Votes cast" value={loading ? "–" : votesCast} sub={`${turnout}% turnout`} icon={Icons.votes} />
        <StatCard title="Positions" value={loading ? "–" : positions} sub={`${completedVoters} completed`} icon={Icons.positions} />
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <ActionBtn onClick={() => setActivePage("addContestant")} icon={Icons.add} label="Add contestant" />
        <ActionBtn onClick={() => setActivePage("contestants")} icon={Icons.contestants} label="Manage contestants" />
        <ActionBtn onClick={() => setActivePage("registerVoter")} icon={Icons.register} label="Register voter" />
        <ActionBtn onClick={() => setActivePage("voters")} icon={Icons.voters} label="Manage voters" />
        <ActionBtn onClick={() => setActivePage("votingTime")} icon={Icons.add} label="Set voting time" />
      </div>

      {error && <div className="app-alertError mb-5">{error}</div>}

      <div className="app-cardTint mb-6 p-5">
        <div className="flex justify-between mb-3">
          <span className="text-slate-900 font-extrabold text-sm">Voter turnout</span>
          <span className="font-extrabold text-brand-800 text-sm">{turnout}%</span>
        </div>

        <div className="bg-white rounded-full overflow-hidden border border-brand-100" style={{ height: 10 }}>
          <div className="h-full" style={{ width: `${turnout}%`, backgroundColor: "#66c743" }} />
        </div>

        <p className="text-slate-600 m-0 mt-2 text-xs font-semibold">
          {completedVoters} of {totalVoters} voters have submitted their votes
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="app-cardTint lg:col-span-2">
          <SectionHeader title="Recent contestants" onViewAll={() => setActivePage("contestants")} />
          <div className="h-px bg-brand-100" />
          <div className="p-4 bg-white/70">
            {loading ? (
              <p className="text-slate-600 text-sm font-semibold">Loading...</p>
            ) : recentContestants.length === 0 ? (
              <p className="text-slate-600 text-sm font-semibold">No contestants yet.</p>
            ) : (
              <table className="w-full" style={{ borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    {["Name", "Position", "Department", "Votes", "Added"].map((h) => (
                      <th key={h} className="app-th" style={{ fontSize: 11 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentContestants.map((c) => (
                    <tr key={c._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td className="text-slate-900 font-extrabold" style={{ padding: "10px 8px" }}>{c.name}</td>
                      <td className="text-slate-700 font-semibold" style={{ padding: "10px 8px" }}>{c.position}</td>
                      <td className="text-slate-700 font-semibold" style={{ padding: "10px 8px" }}>{c.department}</td>
                      <td style={{ padding: "10px 8px" }}>
                        <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-extrabold text-brand-800">
                          {c.votes ?? 0}
                        </span>
                      </td>
                      <td className="text-slate-600 font-semibold" style={{ padding: "10px 8px" }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="app-cardTint">
          <SectionHeader title="Recent voters" onViewAll={() => setActivePage("voters")} />
          <div className="h-px bg-brand-100" />

          <div className="p-4 bg-white/70">
            {loading ? (
              <p className="text-slate-600 text-sm font-semibold">Loading...</p>
            ) : recentVoters.length === 0 ? (
              <p className="text-slate-600 text-sm font-semibold">No voters yet.</p>
            ) : (
              <div className="app-tableWrap">
                <div className="overflow-x-auto">
                  <table className="app-table">
                    <thead>
                      <tr>
                        <th className="app-th" style={{ fontSize: 11 }}>
                          Full name
                        </th>
                        <th className="app-th" style={{ fontSize: 11 }}>
                          Reg. number
                        </th>
                        <th className="app-th" style={{ fontSize: 11 }}>
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentVoters.map((v) => (
                        <tr key={v._id} className="app-tr app-trHover">
                          <td className="app-td">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-brand-50 border border-brand-200 text-brand-800 flex items-center justify-center font-extrabold text-sm flex-shrink-0">
                                {(v.fullName || v.registrationNumber || "?")[0].toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="m-0 text-slate-900 font-extrabold text-sm truncate">
                                  {v.fullName || "—"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="app-td font-mono text-xs font-bold text-slate-700">
                            {v.registrationNumber}
                          </td>

                          <td className="app-td">
                            <Badge voted={v.hasVoted} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="app-page">
      <div className="flex min-h-screen">
        <aside className="fixed top-0 left-0 bottom-0 z-10 flex flex-col bg-white border-r border-slate-200" style={{ width: 250, padding: "18px 12px", gap: 8 }}>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#66c743" }}>
              <Icon d={Icons.votes} size={18} color="#ffffff" />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-slate-900 leading-tight">VoteAdmin</div>
              <div className="text-xs font-semibold text-slate-600">Admin console</div>
            </div>
          </div>

          <div className="px-3 pt-2">
            <p className="m-0 font-extrabold text-slate-600 uppercase" style={{ fontSize: 10, letterSpacing: 1 }}>
              Menu
            </p>
          </div>

          <div className="px-2 flex flex-col gap-2">
            <NavItem icon={Icons.overview} label="Overview" active={activePage === "overview"} onClick={() => setActivePage("overview")} />
            <NavItem icon={Icons.contestants} label="Contestants" active={activePage === "contestants"} onClick={() => setActivePage("contestants")} />
            <NavItem icon={Icons.voters} label="Voters" active={activePage === "voters"} onClick={() => setActivePage("voters")} />
            <NavItem icon={Icons.chart} label="Results" active={activePage === "results"} onClick={() => setActivePage("results")} />
          </div>

          <div className="mt-auto px-2 pb-2">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-danger-700 bg-danger-700 text-white font-extrabold px-4 py-3 transition-colors hover:bg-danger-800"
              style={{ fontSize: 13 }}
            >
              <Icon d={Icons.logout} size={16} color="#ffffff" />
              Logout
            </button>
          </div>
        </aside>

        <main className="flex-1" style={{ marginLeft: 250, padding: "26px 18px", maxWidth: "calc(100vw - 250px)" }}>
          <div className="max-w-6xl mx-auto">
            <header className="flex justify-between items-start mb-6 flex-wrap gap-3">
              <div>
                <h1 className="m-0 font-extrabold text-slate-900" style={{ fontSize: 22 }}>
                  Welcome back, {user?.username || user?.fullName || "Admin"}
                </h1>
                <p className="text-slate-600 m-0 mt-1 font-semibold" style={{ fontSize: 13 }}>
                  Manage election data and monitor participation.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl text-slate-700 font-extrabold px-4 py-2 text-sm">
                {new Date().toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </header>

            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;