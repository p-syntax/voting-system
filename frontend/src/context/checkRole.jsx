import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const CheckPermission = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  if (loading){
    alert("loading")
    return null;
  }  // or a spinner
  if (!user) return <Navigate to="/admin/login" replace />;
  if (allowedRoles.length && !allowedRoles.includes(user.role)){
    alert("unauthorized user ")
    return <Navigate to="/" replace />;
  } 
  return children;
};

export default CheckPermission;