import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import voteWall from "../../assets/Vote.jpg";

const ThankYou = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [seconds, setSeconds] = useState(120);

  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    const t = setTimeout(() => {
      localStorage.removeItem("voterToken");
      setUser(null);
      navigate("/", { replace: true });
    }, 120000);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, [navigate, setUser]);

  const handleFinish = () => {
    localStorage.removeItem("voterToken");
    setUser(null);
    navigate("/", { replace: true });
  };

  const mins = Math.floor(seconds / 60);
  const secs = String(seconds % 60).padStart(2, "0");

  return (
    <div className="app-page relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-slate-100">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-200/70 via-slate-100 to-slate-100" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_420px_at_50%_-50%,rgba(102,199,67,0.25),transparent_60%)]" />
      </div>

      <div className="app-container min-h-screen flex items-center justify-center py-12">
        <div className="w-full max-w-2xl">

          {/* Hero image */}
          <div className="app-card overflow-hidden mb-5">
            <div className="relative h-52 sm:h-64">
              <img
                src={voteWall}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-[center_35%]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-900/50 to-slate-900/80" />

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="m-0 text-xs font-extrabold uppercase tracking-[0.3em] text-brand-400 mb-2">
                  ✦ ballot submitted ✦
                </p>
                <h1
                  className="m-0 text-white font-black uppercase leading-none text-center"
                  style={{
                    fontSize: "clamp(52px, 12vw, 88px)",
                    letterSpacing: "-2px",
                    fontFamily: "'Impact', 'Arial Black', sans-serif",
                    textShadow: "0 2px 24px rgba(102,199,67,0.35), 3px 3px 0 rgba(0,0,0,0.4)",
                    WebkitTextStroke: "1px rgba(102,199,67,0.3)",
                  }}
                >
                  THANK <br />YOU.
                </h1>
                <div className="flex items-center gap-2 mt-4">
                  <span className="h-1.5 w-10 rounded-full bg-brand-500" />
                  <span className="h-1.5 w-4 rounded-full bg-white/30" />
                  <span className="h-1.5 w-4 rounded-full bg-white/30" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom panel */}
          <div className="app-cardTint p-6 sm:p-8 text-center">
            <p className="m-0 text-slate-500 text-sm font-semibold">
              Your voice has been heard. Results drop once voting closes.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
              <button onClick={() => navigate("/", { replace: true })} className="app-btnOutline flex-1">
                Home
              </button>
              <button onClick={handleFinish} className="app-btnPrimary flex-1">
                Finish →
              </button>
            </div>

            {/* Countdown */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/60 px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <p className="m-0 text-xs font-extrabold text-slate-600">
                Redirecting to home in{" "}
                <span className="text-slate-900">{mins}:{secs}</span>
              </p>
            </div>

            <p className="mt-4 text-[11px] uppercase tracking-widest text-slate-400 font-semibold">
              Student Election System
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ThankYou;