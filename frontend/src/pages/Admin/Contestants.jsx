import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const Contestants = ({ onAddContestant }) => {
  const { user } = useAuth();

  const [contestants, setContestants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });

  const [editingContestant, setEditingContestant] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    position: "",
    department: "",
    party: "",
  });

  const limit = 50;

  const fetchContestants = async (pageNum = 1, searchTerm = "") => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      let url = `http://localhost:5555/admin/getContestant?page=${pageNum}&limit=${limit}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setContestants(data.contestants || []);
      setPagination(data.pagination || { total: 0, pages: 1, page: pageNum });
    } catch (err) {
      setError(err.message);
      setContestants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContestants(1, "");
  }, []);

  const handleDeleteContestant = async (contestant) => {
    const token = localStorage.getItem("adminToken");

    // ✅ confirm first (simple “alert before deleting”)
    const ok = window.confirm(
      `You are about to delete:\n\nName: ${contestant.name}\nReg No: ${contestant.registrationNumber}\nPosition: ${contestant.position}\n\nContinue?`
    );
    if (!ok) return;

    try {
      const res = await fetch(
        `http://localhost:5555/admin/deleteContestant/${contestant._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to delete contestant");
      }

      toast.success(data.message || "Contestant deleted");
      setContestants((prev) =>
        prev.filter((item) => item._id !== contestant._id)
      );
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  };

  const handleEditContestant = (contestant) => {
    setEditingContestant(contestant);
    setEditForm({
      name: contestant.name,
      position: contestant.position,
      department: contestant.department,
      party: contestant.party,
    });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdateSubmit = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `http://localhost:5555/admin/updateContestant/${editingContestant._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editForm),
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || "Update failed");

      setEditingContestant(null);
      fetchContestants(pagination.page, search);
      toast.success("Contestant updated");
    } catch (err) {
      toast.error(err.message || "Update failed");
    }
  };

  if (!user || user.role !== "admin") {
    return <div className="app-alertError">Access denied. Admins only.</div>;
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div className="w-full flex flex-wrap items-end justify-between gap-3">
          <div className="w-full max-w-md">
            <label className="app-label">Search</label>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                fetchContestants(1, e.target.value);
              }}
              placeholder="Search by name, position, department"
              className="app-input"
            />
          </div>

          <button
            type="button"
            onClick={() => onAddContestant?.()}
            className="app-btnPrimary whitespace-nowrap"
          >
            Add contestant
          </button>
        </div>
      </div>

      {error && <div className="app-alertError mb-4">{error}</div>}

      {loading ? (
        <div className="app-card p-8">
          <p className="text-sm font-semibold text-slate-600">
            Loading contestants...
          </p>
        </div>
      ) : (
        <>
          <div className="app-tableWrap">
            <table className="app-table">
              <thead>
                <tr>
                  <th className="app-th w-10">#</th>
                  <th className="app-th">Reg No</th>
                  <th className="app-th">Name</th>
                  <th className="app-th">Position</th>
                  <th className="app-th">Department</th>
                  <th className="app-th">Party</th>
                  <th className="app-th">Image</th>
                  <th className="app-th">Actions</th>
                </tr>
              </thead>

              <tbody>
                {contestants.length === 0 ? (
                  <tr className="app-tr">
                    <td
                      colSpan={8}
                      className="app-td text-center py-14 text-slate-500 font-semibold"
                    >
                      No contestants found
                    </td>
                  </tr>
                ) : (
                  contestants.map((c, i) => (
                    <tr key={c._id} className="app-tr app-trHover">
                      <td className="app-td text-slate-600 font-semibold">
                        {i + 1}
                      </td>
                      <td className="app-td font-mono text-xs text-slate-700 font-bold">
                        {c.registrationNumber}
                      </td>
                      <td className="app-td font-extrabold text-slate-900">
                        {c.name}
                      </td>
                      <td className="app-td">
                        <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-extrabold text-brand-800">
                          {c.position}
                        </span>
                      </td>
                      <td className="app-td font-semibold">{c.department}</td>
                      <td className="app-td font-semibold">{c.party}</td>
                      <td className="app-td">
                        <img
                          src={c.image}
                          alt={c.name}
                          className="w-14 h-14 rounded-full object-cover border border-slate-100"
                        />
                      </td>

                      <td className="app-td">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleEditContestant(c)}
                            className="app-btnOutline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteContestant(c)}
                            className="app-btnOutline text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination.total > 0 && (
            <p className="text-xs text-slate-600 mt-3 text-right font-semibold">
              Showing {contestants.length} of {pagination.total} contestants
            </p>
          )}
        </>
      )}

      {editingContestant && (
        <div className="app-modalOverlay">
          <div className="app-modalPanel">
            <div className="px-6 py-5 bg-brand-50/60 border-b border-slate-100">
              <h2 className="text-lg font-extrabold text-slate-900">
                Edit contestant
              </h2>
              <p className="text-sm text-slate-600 font-semibold mt-1">
                Update the details below
              </p>
            </div>

            <div className="px-6 py-6 flex flex-col gap-4">
              {[
                { label: "Full Name", name: "name", placeholder: "Contestant full name" },
                { label: "Position", name: "position", placeholder: "e.g. President" },
                { label: "Department", name: "department", placeholder: "e.g. Computer Science" },
                { label: "Party", name: "party", placeholder: "e.g. Progressive Alliance" },
              ].map(({ label, name, placeholder }) => (
                <div key={name}>
                  <label className="app-label">{label}</label>
                  <input
                    name={name}
                    value={editForm[name]}
                    onChange={handleEditChange}
                    placeholder={placeholder}
                    className="app-input"
                  />
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditingContestant(null)}
                  className="app-btnOutline flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateSubmit}
                  className="app-btnPrimary flex-1"
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contestants;