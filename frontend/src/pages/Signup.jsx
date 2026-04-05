import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Phone, Lock, User, Plus, X, ArrowRight } from "lucide-material";
import { toast } from "react-toastify";
import axios from "axios";

const Signup = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [contacts, setContacts] = useState([{ name: "", phone: "" }]);
  const navigate = useNavigate();

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
    try {
      await axios.post("http://localhost:5000/api/auth/signup", {
        name,
        phone,
        password,
        emergencyContacts: contacts.filter(c => c.name && c.phone)
      });
      toast.success("Account created successfully!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create account");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Join SheSafe</h1>
          <p className="text-slate-500 font-medium">Secure your journey today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
              required
            />
          </div>

          <div className="relative">
            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
              required
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
              required
            />
          </div>

          <div className="pt-4">
            <label className="text-sm font-bold text-slate-700 mb-2 block uppercase tracking-wider">Emergency Contacts</label>
            {contacts.map((contact, index) => (
              <div key={index} className="flex gap-2 mb-2 group">
                <input
                  type="text"
                  placeholder="Name"
                  value={contact.name}
                  onChange={(e) => handleContactChange(index, "name", e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={contact.phone}
                  onChange={(e) => handleContactChange(index, "phone", e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
                {contacts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveContact(index)}
                    className="p-2 text-slate-400 hover:text-danger rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddContact}
              className="text-primary text-sm font-bold flex items-center hover:bg-primary/5 p-2 rounded-xl transition-all"
            >
              <Plus size={16} className="mr-1" />
              Add Another Contact
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-secondary text-white font-bold py-4 rounded-2xl flex items-center justify-center transition-all shadow-lg hover:shadow-primary/30 mt-4"
          >
            <span>JOIN NOW</span>
            <ArrowRight size={20} className="ml-2" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
