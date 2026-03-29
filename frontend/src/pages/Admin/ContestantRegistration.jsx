import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const AddContestant = () => {
  const { user } = useAuth();

  const [form, setForm] = useState({
    registrationNumber: "",
    name: "",
    image: null,
    position: "",
    department: "",
    party: "",
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!user || user.role !== "admin") {
    return (
      <div className="app-page flex items-center justify-center">
        <div className="app-alertError">Access denied. Admins only.</div>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, image: file });
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const formData = new FormData();
      formData.append("registrationNumber", form.registrationNumber);
      formData.append("name", form.name);
      formData.append("position", form.position);
      formData.append("department", form.department);
      formData.append("party", form.party);
      formData.append("image", form.image);

      const res = await fetch("http://localhost:5555/admin/addContestant", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Server error: Expected JSON response");
      }

      if (!res.ok) throw new Error(data?.error || "Failed to add contestant");

      setSuccess("Contestant added successfully");
      setForm({
        registrationNumber: "",
        name: "",
        image: null,
        position: "",
        department: "",
        party: "",
      });
      setPreview(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-page py-10">
      <div className="app-container">
        <div className="max-w-2xl mx-auto app-card">
          <div className="app-cardHeaderBrand">
            <h2 className="text-white font-extrabold text-lg tracking-tight">
              Register Contestant
            </h2>
            <p className="text-brand-100 text-sm mt-1">
              Fill all fields to register a contestant
            </p>
          </div>

          <div className="px-6 py-6">
            {error && <div className="app-alertError mb-4">{error}</div>}
            {success && <div className="app-alertSuccess mb-4">{success}</div>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="app-label">Registration Number</label>
                <input
                  type="text"
                  name="registrationNumber"
                  placeholder="e.g. STU-2024-001"
                  value={form.registrationNumber}
                  onChange={handleChange}
                  className="app-inputSoft"
                />
              </div>

              <div>
                <label className="app-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Contestant full name"
                  value={form.name}
                  onChange={handleChange}
                  className="app-inputSoft"
                />
              </div>

              <div>
                <label className="app-label">Photo</label>
                <div className="flex items-start gap-4">
                  <label className="flex-1 cursor-pointer rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/40 px-4 py-5 text-center hover:bg-brand-50">
                    <div className="text-sm font-bold text-brand-800">
                      Upload image
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      PNG, JPG, WEBP
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {preview && (
                    <img
                      src={preview}
                      alt="preview"
                      className="w-20 h-20 object-cover rounded-xl border border-slate-200"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="app-label">Position</label>
                <input
                  type="text"
                  name="position"
                  placeholder="e.g. President"
                  value={form.position}
                  onChange={handleChange}
                  className="app-inputSoft"
                />
              </div>

              <div>
                <label className="app-label">Department</label>
                <input
                  type="text"
                  name="department"
                  placeholder="e.g. Computer Science"
                  value={form.department}
                  onChange={handleChange}
                  className="app-inputSoft"
                />
              </div>

              <div>
                <label className="app-label">Party</label>
                <input
                  type="text"
                  name="party"
                  placeholder="e.g. Progressive Alliance"
                  value={form.party}
                  onChange={handleChange}
                  className="app-inputSoft"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={loading ? "app-btnDisabled w-full" : "app-btnPrimary w-full"}
                >
                  {loading ? "Adding..." : "Add Contestant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddContestant;