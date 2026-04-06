import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Phone, Lock, User, Plus, X, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

const Signup = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [contacts, setContacts] = useState([{ name: "", phone: "" }]);
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  const handleAddContact = () => {
    setContacts([...contacts, { name: "", phone: "" }]);
  };

  const handleRemoveContact = (index) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const handleContactChange = (index, field, value) => {
    const newContacts = [...contacts];
    newContacts[index][field] = value;
    setContacts(newContacts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔥 BASIC VALIDATION (prevents backend crash)
    if (!name || !phone || !password) {
      return toast.error("Please fill all required fields");
    }

    if (contacts.some(c => !c.name || !c.phone)) {
      return toast.error("Please fill all emergency contacts properly");
    }

    try {
      const response = await axios.post(`${API}/auth/signup`, {
        name,
        phone,
        password,
        emergencyContacts: contacts,
      });

      toast.success("Account created successfully!");
      navigate("/login");

    } catch (err) {
      console.error("Signup error:", err);

      toast.error(
        err.response?.data?.message ||
        err.message ||
        "Signup failed. Try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100">

        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Join SheSafe</h1>
          <p className="text-slate-500">Secure your journey today</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div className="relative">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4"
              required
            />
          </div>

          {/* Phone */}
          <div className="relative">
            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4"
              required
            />
          </div>

          {/* Contacts */}
          <div className="pt-4">
            <label className="text-sm font-bold text-slate-700 block mb-2">
              Emergency Contacts
            </label>

            {contacts.map((contact, index) => (
              <div key={index} className="flex gap-2 mb-2">

                <input
                  type="text"
                  placeholder="Name"
                  value={contact.name}
                  onChange={(e) =>
                    handleContactChange(index, "name", e.target.value)
                  }
                  className="flex-1 bg-slate-50 border rounded-xl px-4 py-2"
                  required
                />

                <input
                  type="text"
                  placeholder="Phone"
                  value={contact.phone}
                  onChange={(e) =>
                    handleContactChange(index, "phone", e.target.value)
                  }
                  className="flex-1 bg-slate-50 border rounded-xl px-4 py-2"
                  required
                />

                {contacts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveContact(index)}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddContact}
              className="text-primary flex items-center mt-2"
            >
              <Plus size={16} /> Add Contact
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-primary text-white py-4 rounded-2xl mt-4 flex items-center justify-center"
          >
            JOIN NOW <ArrowRight size={20} className="ml-2" />
          </button>

        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-bold">
            Log In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Signup;