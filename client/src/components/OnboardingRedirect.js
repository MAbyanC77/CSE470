import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const OnboardingRedirect = ({ children }) => {
  const { user, getProfile } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user || user.role !== 'student') {
      setLoading(false);
      return;
    }

    try {
      const profile = await getProfile();
      setNeedsOnboarding(!profile.onboardingCompleted);
    } catch (error) {
      // If profile doesn't exist, user needs onboarding
      setNeedsOnboarding(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Checking your profile..." />;
  }

  if (needsOnboarding && user?.role === 'student') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default OnboardingRedirect;