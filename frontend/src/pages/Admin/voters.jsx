import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";

const Voters = ({ onAddVoter }) => {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const fetchVoters = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("adminToken");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/admin/voters?page=${currentPage}&search=${searchTerm}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.status === 401) throw new Error("Unauthorized: Please log in again");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setVoters(data.voters);
        setTotalPages(data.totalPages);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchVoters();
  }, [currentPage, searchTerm, user]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async (voter) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${voter.fullName}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(voter._id);
    setDeleteError(null);

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/deleteVoter/${voter._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

     
      setVoters((prev) => prev.filter((v) => v._id !== voter._id));
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (!user || user.role !== "admin") {
    return <div className="app-alertError">Access denied. Admins only.</div>;
  }

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
        <div className="w-full flex flex-wrap items-end justify-between gap-3">
          <div className="w-full max-w-md">
            <label className="app-label">Search</label>
            <input
              type="text"
              placeholder="Search by name, email or ID"
              value={searchTerm}
              onChange={handleSearch}
              className="app-input"
            />
          </div>

          <button
            type="button"
            onClick={() => onAddVoter?.()}
            className="app-btnPrimary whitespace-nowrap"
          >
            Add voter
          </button>
        </div>
      </div>

      {loading && (
        <div className="app-card p-8">
          <p className="text-sm font-semibold text-slate-600">Loading voters...</p>
        </div>
      )}

      {error && <div className="app-alertError mb-4">{error}</div>}
      {deleteError && <div className="app-alertError mb-4">{deleteError}</div>}

      {!loading && !error && (
        <div className="app-tableWrap">
          <div className="hidden sm:block overflow-x-auto">
            <table className="app-table">
              <thead>
                <tr>
                  <th className="app-th">Reg. Number</th>
                  <th className="app-th">Full Name</th>
                  <th className="app-th">Action</th>
                </tr>
              </thead>
              <tbody>
                {voters.length === 0 ? (
                  <tr className="app-tr">
                    <td colSpan={4} className="app-td text-center py-14 text-slate-500 font-semibold">
                      No voters found.
                    </td>
                  </tr>
                ) : (
                  voters.map((voter, index) => (
                    <tr
                      key={voter._id}
                      className={`app-tr app-trHover ${index % 2 === 0 ? "bg-white" : "bg-brand-50/10"}`}
                    >
                      <td className="app-td font-mono text-xs text-slate-700 font-bold">
                        {voter.registrationNumber}
                      </td>
                      <td className="app-td">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-200 text-brand-800 flex items-center justify-center font-extrabold text-xs">
                            {voter.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-extrabold text-slate-900">{voter.fullName}</span>
                        </div>
                      </td>
                      <td className="app-td">
                        <button
                          onClick={() => handleDelete(voter)}
                          disabled={deletingId === voter._id}
                          className={deletingId === voter._id ? "app-btnDisabled" : "app-btnOutline"}
                        >
                          {deletingId === voter._id ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="sm:hidden divide-y divide-slate-100">
            {voters.length === 0 ? (
              <p className="text-center py-10 text-slate-500 text-sm font-semibold">No voters found.</p>
            ) : (
              voters.map((voter) => (
                <div key={voter._id} className="p-4 flex items-center gap-4 bg-white/70">
                  <div className="w-10 h-10 rounded-full bg-brand-50 border border-brand-200 text-brand-800 flex items-center justify-center font-extrabold text-sm">
                    {voter.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-slate-900 truncate">{voter.fullName}</p>
                    <p className="text-xs text-slate-600 font-mono font-bold">{voter.registrationNumber}</p>
                    {voter.email && (
                      <p className="text-xs text-slate-700 truncate font-semibold">{voter.email}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(voter)}
                    disabled={deletingId === voter._id}
                    className={deletingId === voter._id ? "app-btnDisabled" : "app-btnOutline"}
                  >
                    {deletingId === voter._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {!loading && !error && totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-slate-600 font-semibold">
            Page <span className="font-extrabold">{currentPage}</span> of{" "}
            <span className="font-extrabold">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className={currentPage === 1 ? "app-btnDisabled" : "app-btnOutline"}
            >
              Prev
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className={currentPage === totalPages ? "app-btnDisabled" : "app-btnOutline"}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Voters;