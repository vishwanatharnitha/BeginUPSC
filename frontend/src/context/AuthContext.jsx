import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const [hasAcceptedPledge, setHasAcceptedPledge] = useState(
    localStorage.getItem('pledgeAccepted') === 'true'
  );

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setProfile(data.profile);
        setAchievements(data.achievements || []);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    setProfile(data.profile);
    return data.user;
  };

  const register = async (username, email, password, role = 'student') => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    setProfile(data.profile);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setProfile(null);
    setAchievements([]);
    localStorage.removeItem('pledgeAccepted');
    setHasAcceptedPledge(false);
  };

  const acceptPledge = () => {
    localStorage.setItem('pledgeAccepted', 'true');
    setHasAcceptedPledge(true);
  };

  const updateStreak = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/auth/streak`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        // re-fetch profile to load achievements update
        fetchProfile();
      }
    } catch (err) {
      console.error('Streak update failed:', err);
    }
  };

  const refreshUserData = () => {
    if (token) fetchProfile();
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      achievements,
      token,
      loading,
      hasAcceptedPledge,
      acceptPledge,
      login,
      register,
      logout,
      updateStreak,
      refreshUserData,
      API_URL
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
