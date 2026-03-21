import { useState } from "react";

const ContestantCard = ({ contestant, position, hasVoted, onVoteSuccess }) => {


  const [voting, setVoting] = useState(false);
  // Tracks whether the vote request is in progress

  const [error, setError] = useState("");
  // Stores any error message from the vote request

  const [voted, setVoted] = useState(false);
  // Tracks if the user has voted for this contestant locally

  const handleVote = async () => {

    if (hasVoted || voted) return;
    // Prevent voting again if already voted

    setVoting(true);
    // Show loading state

    setError("");
    // Clear previous error

    try {

      const token = localStorage.getItem("voterToken");
      // Retrieve authentication token

      const res = await fetch(
        `http://localhost:5555/voter/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            contestantId: contestant._id || contestant.id
          })
        }
      );

      const data = await res.json();
      // Convert response to JSON

      if (!res.ok) {
        throw new Error(data.error || "Vote failed");
      }

      setVoted(true);
      // Mark card as voted

      if (onVoteSuccess) {
        onVoteSuccess(position);
      }
      // Inform parent component

    } catch (err) {

      setError(err.message);
      // Show error message

    } finally {

      setVoting(false);
      // Stop loading state

    }

  };

  const disabled = hasVoted || voted || voting;
  // Button disabled condition

  return (

    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-64 shadow-lg flex flex-col items-center">

      {/* Avatar */}

      <div className="relative">

        {contestant.image ? (

          <img
            src={contestant.image}
            alt={contestant.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-700"
          />

        ) : (

          <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
            {contestant.name?.charAt(0)}
          </div>

        )}

        {(voted || hasVoted) && (
          <div className="absolute bottom-0 right-0 bg-green-500 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full">
            ✓
          </div>
        )}

      </div>

      {/* Name */}

      <h3 className="mt-3 text-white font-semibold">
        {contestant.name}
      </h3>

      {/* Registration Number */}

      <p className="text-gray-400 text-sm">
        #{contestant.registrationNumber}
      </p>

      {/* Department */}

      <p className="text-gray-500 text-sm">
        {contestant.department}
      </p>

      {/* Position */}

      <span className="mt-1 px-3 py-1 text-xs bg-gray-800 text-indigo-400 rounded-full">
        {position}
      </span>

      {/* Vote count */}

      <div className="mt-3 text-center">

        <p className="text-xl font-bold text-white">
          {contestant.votes ?? 0}
        </p>

        <p className="text-xs text-gray-500">
          votes
        </p>

      </div>

      {/* Error message */}

      {error && (
        <p className="text-red-400 text-xs mt-2">
          {error}
        </p>
      )}

      {/* Vote button */}

      <button
        onClick={handleVote}
        disabled={disabled}
        className={`mt-4 w-full py-2 rounded-lg font-semibold
        ${disabled
          ? "bg-gray-800 text-gray-500 cursor-not-allowed"
          : "bg-indigo-600 hover:bg-indigo-500 text-white"}
        `}
      >

        {voting
          ? "Voting..."
          : voted || hasVoted
          ? "✓ Voted"
          : "Cast Vote"}

      </button>

    </div>

  );

};

export default ContestantCard;