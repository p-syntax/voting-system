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
import AdminLogin from './pages/Admin /login.jsx';
import AdminDashboard from './pages/Admin /dashboard.jsx';
import VoterRegistration from './pages/Admin /voterRegistration.jsx';

// import VotingInterface from './pages/voter/VotingInterface';
// import ThankYou from './pages/voter/ThankYou';

// import './App.css';

function App() {
  return (
    // <BrowserRouter>
    //   {/* <AdminProvider>
    //     <VoterProvider> */}
    //       <Routes>
    //         {/* Default Route - Voter Login */}
    //         <Route path='/' element={<VoterLogin />} />
            
    //         {/* Voter Routes */}
    //         <Route path='/vote' element={<VotingInterface />} />
    //         <Route path='/thank-you' element={<ThankYou />} />
            
    //         {/* Admin Routes */}
    //         <Route path='/admin/login' element={<AdminLogin />} />
    //         <Route path='/admin/dashboard' element={<AdminDashboard />} />
    //         <Route path='/admin/voters' element={<div>Voters Management</div>} />
    //         <Route path='/admin/contestants' element={<div>Contestants Management</div>} />
    //         <Route path='/admin/results' element={<div>Results</div>} />
            
    //         {/* 404 Redirect */}
    //         <Route path='*' element={<Navigate to='/' replace />} />
    //       </Routes>
    //     </VoterProvider>
    // //   </AdminProvider>
    // // </BrowserRouter>
   
      <Routes>
            {/* Default Route - Voter Login */}
            <Route path='/' element={<VoterLogin />} />
           
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