import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

const Voters = () => {
    const [voters, setVoters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        if (!user || user.role !== 'admin') return;

        const fetchVoters = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('adminToken');
                const response = await fetch(
                    `http://localhost:5555/admin/voters?page=${currentPage}&search=${searchTerm}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                if (response.status === 401) throw new Error('Unauthorized: Please log in again');
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

    if (!user || user.role !== 'admin') {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-red-100">
                    <div className="text-5xl mb-4">🚫</div>
                    <h2 className="text-xl font-bold text-red-500">Access Denied</h2>
                    <p className="text-gray-500 mt-1 text-sm">This page is restricted to admins only.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
                        Voters Management
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        View and manage registered voters
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-5">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search by name, email or ID..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full sm:w-80 pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>
                </div>

                {/* States */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
                        ⚠️ {error}
                    </div>
                )}

                {/* Table */}
                {!loading && !error && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Desktop Table */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Reg. Number
                                        </th>
                                        <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Full Name
                                        </th>
                                        <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {voters.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="text-center py-12 text-gray-400 text-sm">
                                                No voters found.
                                            </td>
                                        </tr>
                                    ) : (
                                        voters.map((voter, index) => (
                                            <tr
                                                key={voter.id}
                                                className={`hover:bg-blue-50/40 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                                            >
                                                <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                                    {voter.registrationNumber}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-xs flex-shrink-0">
                                                            {voter.fullName?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium text-gray-800">{voter.fullName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">{voter.email ?? '—'}</td>
                                                <td className="px-6 py-4">
                                                    <button className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline transition">
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="sm:hidden divide-y divide-gray-100">
                            {voters.length === 0 ? (
                                <p className="text-center py-10 text-gray-400 text-sm">No voters found.</p>
                            ) : (
                                voters.map((voter) => (
                                    <div key={voter.id} className="p-4 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                            {voter.fullName?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-800 truncate">{voter.fullName}</p>
                                            <p className="text-xs text-gray-400 font-mono">{voter.registrationNumber}</p>
                                            {voter.email && (
                                                <p className="text-xs text-gray-500 truncate">{voter.email}</p>
                                            )}
                                        </div>
                                        <button className="text-xs font-medium text-blue-600 hover:underline flex-shrink-0">
                                            View
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {!loading && !error && totalPages > 1 && (
                    <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
                        <p className="text-sm text-gray-500">
                            Page <span className="font-semibold text-gray-700">{currentPage}</span> of{' '}
                            <span className="font-semibold text-gray-700">{totalPages}</span>
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                                className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                ← Prev
                            </button>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => p + 1)}
                                className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Voters;