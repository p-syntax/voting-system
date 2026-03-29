import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";


const CheckPermission = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  if (loading){
    alert("loading")
    return null;
  }  // or a spinner

  if (!user) {
  toast("Unauthorized user");
    return <Navigate to="/admin/login" replace />;
  } 
 if (allowedRoles.length && !allowedRoles.includes(user.role)){
    alert("unauthorized user ")
    return <Navigate to="/" replace />;
  } 
  return children;
};

export default CheckPermission;