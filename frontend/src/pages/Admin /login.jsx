import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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

            // login successful, store token and navigate
            localStorage.setItem("adminToken", data.token);
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
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-center mb-4">Admin Login</h2>

                {error && <p className="text-red-600 text-sm text-center mb-3">{error}</p>}

                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                    className="w-full border border-black rounded-md px-3 py-2 mb-4"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                    type="password"
                    className="w-full border border-black rounded-md px-3 py-2 mb-4"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </div>
        </div>
    );
};

export default AdminLogin;