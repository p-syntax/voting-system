import { useState } from "react";

const ContestantCard = ({ contestant, position, hasVoted, onVoteSuccess }) => {
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState("");
  const [voted, setVoted] = useState(false);

  const handleVote = async () => {
    if (hasVoted || voted) return;
    setVoting(true);
    setError("");
    try {
      const token = localStorage.getItem("voterToken");
      const res = await fetch(`http://localhost:5555/voter/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contestantId: contestant._id || contestant.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Vote failed");
      setVoted(true);
      if (onVoteSuccess) onVoteSuccess(position);
    } catch (err) {
      setError(err.message);
    } finally {
      setVoting(false);
    }
  };

  const disabled = hasVoted || voted || voting;
  const isVotedCard = voted || hasVoted;

  return (
    <div
      className={[
        "relative flex flex-col items-center w-52 rounded-2xl p-6 border shadow-sm transition-colors",
        isVotedCard
          ? "bg-brand-50 border-brand-300"
          : "bg-brand-50/40 border-slate-200 hover:border-brand-200 hover:bg-brand-50/60",
      ].join(" ")}
    >
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-brand-500" />

      <div className="relative mt-1">
        {contestant.image ? (
          <img
            src={contestant.image}
            alt={contestant.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-brand-100"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-brand-600 flex items-center justify-center text-white text-2xl font-extrabold">
            {contestant.name?.charAt(0)}
          </div>
        )}

        {isVotedCard && (
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-brand-600 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-extrabold">
            ✓
          </div>
        )}
      </div>

      <h3 className="mt-3 text-sm font-extrabold text-slate-900 text-center leading-tight">
        {contestant.name}
      </h3>

      <p className="text-xs text-brand-800 font-semibold mt-1">
        #{contestant.registrationNumber}
      </p>

      <p className="text-xs text-slate-600 mt-1 text-center">
        {contestant.department}
      </p>

      <span className="mt-2 px-3 py-1 text-xs font-extrabold text-brand-800 bg-white border border-brand-200 rounded-full">
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
            ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
            : isVotedCard
              ? "bg-brand-100 text-brand-800 border-brand-200 cursor-not-allowed"
              : "bg-brand-600 text-white border-brand-600 hover:bg-brand-700",
        ].join(" ")}
      >
        {voting ? "Casting..." : isVotedCard ? "Vote cast" : "Cast vote"}
      </button>
    </div>
  );
};

export default ContestantCard;