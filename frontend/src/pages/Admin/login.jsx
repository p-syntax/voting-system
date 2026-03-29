import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import voteWall from "../../assets/Vote.jpg";
import { useAuth } from "../../context/AuthContext";
const FieldIcon = ({ children }) => (
  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-700 pointer-events-none">
    {children}
  </span>
);

const IconUser = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
  </svg>
);

const IconLock = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const year = useMemo(() => new Date().getFullYear(), []);

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5555/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || "Login failed");
        return;
      }

      localStorage.setItem("adminToken", data.token);
      login("adminToken", data.token)
      alert("Login successful!");
      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-100 shadow-sm bg-white grid grid-cols-1 lg:grid-cols-2">
        {/* Image panel (shows on mobile; sits on top when stacked) */}
        <div className="relative block h-64 sm:h-80 lg:h-auto">
          <img
            src={voteWall}
            alt="Vote background"
            className="absolute inset-0 w-full h-full object-cover object-[center_30%]"
          />
          <div className="absolute inset-0 bg-slate-900/40" />

          <div className="relative h-full p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
            <div className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: "#66c743" }}
                />
              </div>
              <div className="text-white">
                <p className="m-0 font-extrabold tracking-tight text-lg">
                  VoteAdmin
                </p>
                <p className="m-0 text-white/80 text-xs font-semibold">
                  Murang&apos;a University of Technology
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-white text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight m-0">
                Secure election administration
              </h2>
              <p className="text-white/85 text-sm font-semibold mt-3 max-w-md">
                Manage contestants, voters, voting window and results with a
                consistent MUT experience.
              </p>

              <div className="mt-6 sm:mt-8 flex items-center gap-3">
                <span
                  className="h-1.5 w-12 rounded-full"
                  style={{ backgroundColor: "#66c743" }}
                />
                <span className="h-1.5 w-5 rounded-full bg-white/30" />
                <span className="h-1.5 w-5 rounded-full bg-white/30" />
              </div>

              <p className="text-white/70 text-xs font-semibold mt-6 mb-0">
                © {year} MUT elections
              </p>
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className="relative p-7 sm:p-10">
          <div
            className="absolute left-0 top-0 bottom-0 w-1.5"
            style={{ backgroundColor: "#66c743" }}
          />

          <div className="pl-2">
            <div className="mb-7">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-brand-50 border border-brand-200 px-3 py-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: "#66c743" }}
                />
                <span className="text-xs font-extrabold text-brand-800 uppercase tracking-wider">
                  Admin login
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">
                Sign in
              </h1>
              <p className="text-sm text-slate-600 font-semibold mt-1">
                Enter your admin credentials to continue.
              </p>
            </div>

            {error && <div className="app-alertError mb-5">{error}</div>}

            <div className="space-y-4">
              <div>
                <label className="app-label">Username</label>
                <div className="relative">
                  <FieldIcon>
                    <IconUser />
                  </FieldIcon>
                  <input
                    className="app-input pl-10"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                  />
                </div>
              </div>

              <div>
                <label className="app-label">Password</label>
                <div className="relative">
                  <FieldIcon>
                    <IconLock />
                  </FieldIcon>
                  <input
                    type="password"
                    className="app-input pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className={
                  loading
                    ? "app-btnDisabled w-full py-3 rounded-2xl"
                    : "app-btnPrimary w-full py-3 rounded-2xl"
                }
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <div className="text-xs text-slate-500 font-semibold">
                Use your authorized admin credentials.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;