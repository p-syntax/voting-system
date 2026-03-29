import { Routes, Route } from 'react-router-dom';
import CheckPermission from './context/checkRole.jsx';

import VoterLogin from './pages/voter/login.jsx';
import AdminLogin from './pages/Admin/login.jsx';
import AdminDashboard from './pages/Admin/dashboard.jsx';
import VotingPage from './pages/voter/votingPage.jsx';
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      {/* Correct placement */}
      <Toaster position="top-right" />

      <Routes>
        {/* Default Route - Voter Login */}
        <Route path='/' element={<VoterLogin />} />

        {/* Voting Page */}
        <Route path='/votingPage' element={<VotingPage />} />

        {/* Admin routes */}
        <Route path='/admin/login' element={<AdminLogin />} />

        <Route
          path='/admin/dashboard'
          element={
            <CheckPermission allowedRoles={["admin"]}>
              <AdminDashboard />
            </CheckPermission>
          }
        />
      </Routes>
    </>
  );
}

export default App;