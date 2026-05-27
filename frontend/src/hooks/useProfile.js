import { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import api, { setAuthToken } from '../api';

export default function useProfile() {
  const auth = useAuth();
  const [djangoUser, setDjangoUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (auth.isAuthenticated && auth.user?.access_token) {
      // Configure global HTTP headers with access token
      setAuthToken(auth.user.access_token);
      
      const fetchProfile = async () => {
        try {
          setLoading(true);
          const response = await api.get('/api/users/me/');
          setDjangoUser(response.data);
        } catch (err) {
          console.error("Failed to load user profile:", err);
          setError(err);
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [auth.isAuthenticated, auth.user]);

  // Process visual helpers
  const userName = djangoUser?.first_name 
    ? `${djangoUser.first_name} ${djangoUser.last_name || ''}`.trim() 
    : (auth.user?.profile?.name || auth.user?.profile?.preferred_username || auth.user?.profile?.email || "User");
  
  const userInitials = userName ? userName.substring(0, 2).toUpperCase() : "US";

  return {
    djangoUser,
    userName,
    userInitials,
    loading,
    error,
    isAuthenticated: auth.isAuthenticated,
    auth
  };
}
