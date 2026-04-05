import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("sheSafeUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (phone, password) => {
    const res = await axios.post("http://localhost:5000/api/auth/login", { phone, password });
    setUser(res.data);
    localStorage.setItem("sheSafeUser", JSON.stringify(res.data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sheSafeUser");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
