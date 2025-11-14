// RequireRegistration.jsx
import { Navigate } from "react-router-dom";
import { useApp } from "./DigiWearHouseApp1/context/Context";

export default function RequireRegistration({ children }) {
  const { loading, currentUser, userData } = useApp();

   if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }
  if (!currentUser) return <Navigate to="/login" replace />;

  // If no vendor profile or not completed, push to register
  if (!userData || userData.registrationCompleted !== true) {
    return <Navigate to="/register" replace />;
  }

  return children;
}

