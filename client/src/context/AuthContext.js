import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Create Auth Context
const AuthContext = createContext();

// Auth Actions
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SIGNUP_START: 'SIGNUP_START',
  SIGNUP_SUCCESS: 'SIGNUP_SUCCESS',
  SIGNUP_FAILURE: 'SIGNUP_FAILURE',
  LOAD_USER: 'LOAD_USER',
  UPDATE_PROFILE: 'UPDATE_PROFILE'
};

// Initial State
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

// Auth Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.SIGNUP_START:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.SIGNUP_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.SIGNUP_FAILURE:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    
    case AUTH_ACTIONS.LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    
    case AUTH_ACTIONS.LOAD_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false
      };
    
    case AUTH_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        user: action.payload,
        loading: false
      };
    
    default:
      return state;
  }
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set auth token in axios headers
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Load user on app start
  useEffect(() => {
    if (state.token) {
      loadUser();
    } else {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, []);

  // Load User
  const loadUser = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER,
        payload: res.data.user
      });
    } catch (error) {
      console.error('Load user error:', error);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Login
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      
      if (res.data.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: res.data.user,
            token: res.data.token
          }
        });
        
        toast.success('Login successful!');
        return { success: true };
      } else {
        dispatch({
           type: AUTH_ACTIONS.LOGIN_FAIL,
           payload: res.data.message || 'Login failed'
         });
        toast.error(res.data.message || 'Login failed');
        return { success: false, message: res.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: message
      });
      
      toast.error(message);
      return { success: false, message };
    }
  };

  // Signup
  const signup = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.SIGNUP_START });
    
    try {
      const res = await axios.post('/api/auth/signup', userData);
      
      dispatch({
        type: AUTH_ACTIONS.SIGNUP_SUCCESS,
        payload: {
          user: res.data.user,
          token: res.data.token
        }
      });
      
      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed';
      
      dispatch({
        type: AUTH_ACTIONS.SIGNUP_FAILURE,
        payload: message
      });
      
      toast.error(message);
      return { success: false, message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success('Logged out successfully!');
    }
  };

  // Get Profile
  const getProfile = async () => {
    try {
      const res = await axios.get('/api/me/profile');
      return res.data.profile;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  };

  // Update Profile
  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put('/api/me/profile', profileData);
      return res.data.profile;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  // Upload Documents
  const uploadDocuments = async (formData) => {
    try {
      const res = await axios.post('/api/me/profile/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update user profile in context with new document data
      dispatch({
        type: AUTH_ACTIONS.UPDATE_PROFILE,
        payload: res.data.profile
      });
      
      toast.success('Documents uploaded successfully!');
      return res.data;
    } catch (error) {
      console.error('Upload documents error:', error);
      const message = error.response?.data?.message || 'Document upload failed';
      toast.error(message);
      throw error;
    }
  };

  // Download Document
  const downloadDocument = async (documentType) => {
    try {
      const res = await axios.get(`/api/me/profile/documents/${documentType}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = res.headers['content-disposition'];
      let filename = `${documentType}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/); 
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Document downloaded successfully!');
    } catch (error) {
      console.error('Download document error:', error);
      const message = error.response?.data?.message || 'Document download failed';
      toast.error(message);
      throw error;
    }
  };

  // Delete Document
  const deleteDocument = async (documentType) => {
    try {
      await axios.delete(`/api/me/profile/documents/${documentType}`);
      
      // Refresh profile to update document status
      const updatedProfile = await getProfile();
      dispatch({
        type: AUTH_ACTIONS.UPDATE_PROFILE,
        payload: updatedProfile
      });
      
      toast.success('Document deleted successfully!');
    } catch (error) {
      console.error('Delete document error:', error);
      const message = error.response?.data?.message || 'Document deletion failed';
      toast.error(message);
      throw error;
    }
  };

  const value = {
    ...state,
    login,
    signup,
    logout,
    getProfile,
    updateProfile,
    uploadDocuments,
    downloadDocument,
    deleteDocument,
    loadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };
export default AuthContext;