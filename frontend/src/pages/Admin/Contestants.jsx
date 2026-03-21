import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const Contestants = () => {
  const { user, logout } = useAuth();
  
  const [contestants, setContestants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    page: 1,
  });
  const limit = 50;

  // -----------------------------
  // FETCH CONTESTANTS
  // -----------------------------

  const fetchContestants = async (pageNum = 1, searchTerm = "") => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("adminToken");

      let url = `http://localhost:5555/admin/getContestant?page=${pageNum}&limit=${limit}`;
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch contestants");
      }

      setContestants(data.contestants || []);
      setPagination(data.pagination || { total: 0, pages: 1, page: pageNum });

      if (data.contestants && data.contestants.length > 0) {
        setSuccess(`Loaded ${data.contestants.length} contestants`);
      }
    } catch (err) {
      setError(err.message);
      setContestants([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchContestants(1, "");
  }, []);

  // Restrict non-admins
  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-screen text-red-500 text-lg font-semibold">
        ❌ Access Denied — Admins Only
      </div>
    );
  }

 

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchContestants(1, value);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      fetchContestants(newPage, search);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearch("");
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchContestants(1, "");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Contestants Management
            </h1>
            <p className="text-gray-600 mt-2">
              View and manage all registered contestants for voting positions
            </p>
          </div>
          <button
            onClick={logout}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out transform hover:scale-105"
          >
            🚪 Logout
          </button>
        </div>

        {/* Main Content Card */}
        <div className="bg-white shadow-xl rounded-lg p-6 sm:p-8">
          
          {/* Messages Section */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
              <p className="font-semibold">❌ Error</p>
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded">
              <p className="font-semibold">✅ Success</p>
              <p>{success}</p>
            </div>
          )}

          {/* Search Bar Section */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="🔍 Search by name, position, department or registration number..."
                value={search}
                onChange={handleSearch}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>
            {search && (
              <button
                onClick={handleClearSearch}
                className="px-4 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition"
              >
                Clear
              </button>
            )}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-gray-600 text-sm">Total Contestants</p>
              <p className="text-2xl font-bold text-blue-600">{pagination.total}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
              <p className="text-gray-600 text-sm">Current Page</p>
              <p className="text-2xl font-bold text-purple-600">{pagination.page}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <p className="text-gray-600 text-sm">Total Pages</p>
              <p className="text-2xl font-bold text-green-600">{pagination.pages}</p>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600 font-semibold">Loading contestants...</p>
            </div>
          )}

          {/* Table Section */}
          {!loading && contestants.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800">
                      #
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800">
                      Registration Number
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800">
                      Position
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800">
                      Department
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800">
                      Image
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800">
                      Added Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {contestants.map((contestant, index) => (
                    <tr
                      key={contestant._id}
                      className="border-b border-gray-200 hover:bg-blue-50 transition"
                    >
                      <td className="px-4 py-3 text-gray-700 font-semibold">
                        {(pagination.page - 1) * limit + index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold">
                          {contestant.registrationNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-800 font-medium">
                        {contestant.name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                          {contestant.position}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-xs font-semibold">
                          {contestant.department}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {contestant.image ? (
                          <a
                            href={contestant.image}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block"
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-gray-300 hover:border-blue-500 transition cursor-pointer">
                              <img
                                src={contestant.image}
                                alt={contestant.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                              <div
                                className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs"
                                style={{ display: "none" }}
                              >
                                N/A
                              </div>
                            </div>
                          </a>
                        ) : (
                          <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded text-xs font-semibold">
                            No Image
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {contestant.createdAt ? (
                          new Date(contestant.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {!loading && contestants.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-4xl mb-4">📭</p>
              <p className="text-gray-600 font-semibold text-lg">
                No contestants found
              </p>
              <p className="text-gray-500 mt-2">
                {search ? "Try adjusting your search criteria" : "There are no registered contestants yet"}
              </p>
            </div>
          )}

          {/* Pagination Section */}
          {!loading && contestants.length > 0 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-gray-600 text-sm">
                Showing <span className="font-semibold">{contestants.length}</span> of{" "}
                <span className="font-semibold">{pagination.total}</span> contestants
              </div>
              
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-800 font-semibold rounded-lg transition"
                >
                  ⬅️ Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-lg font-semibold transition ${
                          pagination.page === pageNum
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-800 font-semibold rounded-lg transition"
                >
                  Next ➡️
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contestants;