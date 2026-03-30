import { useState } from "react";

const ContestantCard = ({ contestant, position, hasVoted, onVoteSuccess }) => {
  const token = localStorage.getItem("voterToken");
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState("");

  const disabled = voting || hasVoted;

  const handleVote = async () => {
    setError("");
    setVoting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/voter/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contestantId: contestant.id,
          position,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Vote failed");

      onVoteSuccess(position);
    } catch (err) {
      setError(err.message);
    } finally {
      setVoting(false);
    }
  };

  const isVotedCard = hasVoted;

  return (
    <div className="relative rounded-3xl border border-slate-200 bg-white/85 backdrop-blur-sm shadow-sm overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600" />

      <div className="p-5 flex flex-col items-center text-center">
        <div className="relative mt-2">
          <img
            src={contestant.image}
            alt={contestant.name}
            className="w-20 h-20 rounded-full object-cover border border-slate-200 bg-slate-100"
          />
          {isVotedCard && (
            <span className="absolute -right-1 -bottom-1 w-7 h-7 rounded-full bg-brand-600 text-white border-2 border-white flex items-center justify-center text-xs font-extrabold">
              ✓
            </span>
          )}
        </div>

        <h4 className="mt-4 text-sm font-extrabold text-slate-900">
          {contestant.name}
        </h4>

        <p className="m-0 mt-1 text-xs font-bold text-slate-600">
          #{contestant.registrationNumber}
        </p>

        <p className="m-0 mt-1 text-xs font-semibold text-slate-500">
          {contestant.department}
        </p>

        <span className="mt-3 px-3 py-1 text-xs font-extrabold text-brand-800 bg-brand-50 border border-brand-200 rounded-full">
          {position}
        </span>

        <div className="w-full h-px bg-slate-200/70 mt-4" />

        {error && (
          <p className="text-danger-600 text-xs mt-3 text-center">{error}</p>
        )}

        <button
          onClick={handleVote}
          disabled={disabled}
          className={[
            "mt-4 w-full py-2.5 rounded-xl text-sm font-extrabold transition-colors border",
            voting
              ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
              : isVotedCard
                ? "bg-brand-50 text-brand-800 border-brand-200 cursor-not-allowed"
                : "bg-brand-600 text-white border-brand-600 hover:bg-brand-700",
          ].join(" ")}
        >
          {voting ? "Casting..." : isVotedCard ? "Vote cast" : "Cast vote"}
        </button>
      </div>
    </div>
  );
};

export default ContestantCard;