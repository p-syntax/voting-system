// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CheckPermission from './context/checkRole.jsx';
// import { AdminProvider } from './context/AdminContext';
// import { VoterProvider } from './context/VoterContext';

// // Admin Pages
// import AdminLogin from './pages/admin/AdminLogin';
// import AdminDashboard from './pages/admin/Dashboard';
// import AdminLayout from './layouts/AdminLayout';

// Voter Pages
import VoterLogin from './pages/voter/login.jsx';
import AdminLogin from './pages/Admin/login.jsx';
import AdminDashboard from './pages/Admin/dashboard.jsx';
import VoterRegistration from './pages/Admin/voterRegistration.jsx';
import VotingPage from './pages/voter/votingPage.jsx';
import AddContestant from './pages/Admin/ContestantRegistration.jsx';
// import VotingInterface from './pages/voter/VotingInterface';
// import ThankYou from './pages/voter/ThankYou';

// import './App.css';

function App() {
  return (
    
   
      <Routes>
            {/* Default Route - Voter Login */}
            <Route path='/' element={<VoterLogin />} />
             {/* Default Route - Voter Login */}
            <Route path='/votingPage' element={<VotingPage/>} />
           
            {/*admin routes */}
            <Route path='/admin/login' element={<AdminLogin />} />
            <Route
              path='/admin/register'
              element={
                <CheckPermission allowedRoles={["admin"]}>
                  <VoterRegistration />
                </CheckPermission>
              }
            />
            <Route
              path='/admin/AddContestant'
              element={
                <CheckPermission allowedRoles={["admin"]}>
                  <AddContestant/>
                </CheckPermission>
              }
            />
            <Route
              path='/admin/dashboard'
              element={
                <CheckPermission allowedRoles={["admin"]}>
                 <AdminDashboard/>
                </CheckPermission>
              }
            />
            
      </Routes >     
   
  );
}

export default App;