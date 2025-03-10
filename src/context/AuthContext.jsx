import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:4000/api/admin", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data.user || { isAuthenticated: true });
      } catch (error) {
        localStorage.removeItem("token"); // Use jwtToken here too
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:4000/api/admin/login",
        credentials
      );
      if (res.data && res.data.token) {
        localStorage.setItem("token", res.data.token); // Changed to jwtToken
        // Also set the user name for the navbar
        if (res.data.user && res.data.user.name) {
          localStorage.setItem("User Name", res.data.user.name);
        } else {
          localStorage.setItem("User Name", "Admin");
        }
        setUser(res.data.user || { isAuthenticated: true });
        return true;
      }
      return false;
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token"); // Changed to jwtToken
    localStorage.removeItem("User Name"); // Also remove the user name
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
