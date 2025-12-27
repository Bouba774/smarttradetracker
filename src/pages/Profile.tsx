import React from 'react';
import { Navigate } from 'react-router-dom';

// Profile page now redirects to unified Settings page with profile tab
const Profile: React.FC = () => {
  return <Navigate to="/settings" replace />;
};

export default Profile;
