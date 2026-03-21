
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
// import { useNavigate } from "react-router-dom";

const AddContestant = () => {
  const { user, logout } = useAuth();


  const [form, setForm] = useState({
    registrationNumber: "",
    name: "",
    image: "",
    position: "",
    department: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  //Restrict non-admins
  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-screen text-red-500 text-lg">
        Access Denied — Admins Only
      </div>
    );
  }

  // Handle input change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    setLoading(true);

    try {
      const token = localStorage.getItem("adminToken");

      const res = await fetch("http://localhost:5555/admin/addContestant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to add contestant");

      setSuccess("Contestant added successfully");

      // reset form
      setForm({
        registrationNumber: "",
        name: "",
        image: "",
        position: "",
        department: "",
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      
      {/* Header */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Add Contestant
        </h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Card */}
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-xl p-6">
        
        {/* Messages */}
        {error && <p className="text-red-500 mb-3">{error}</p>}
        {success && <p className="text-green-600 mb-3">{success}</p>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <input
            type="text"
            name="registrationNumber"
            placeholder="Registration Number"
            value={form.registrationNumber}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            name="image"
            placeholder="Image URL"
            value={form.image}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            name="position"
            placeholder="Position (e.g Chairperson)"
            value={form.position}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            name="department"
            placeholder="Department"
            value={form.department}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            {loading ? "Adding..." : "Add Contestant"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddContestant;