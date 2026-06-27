/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import DashboardLayout from './components/DashboardLayout';
import { UserProfile } from './types';
import { dbService } from './lib/db';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if an authorization session already exists on page reload
    const storedUser = dbService.getCurrentUser();
    if (storedUser) {
      setCurrentUser(storedUser);
    }
    setCheckingAuth(false);
  }, []);

  const handleLoginSuccess = () => {
    setCurrentUser(dbService.getCurrentUser());
  };

  const handleLogoutSuccess = () => {
    setCurrentUser(null);
  };

  if (checkingAuth) {
    return (
      <div id="loading" className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen antialiased bg-slate-950 font-sans text-slate-100">
      {currentUser ? (
        <DashboardLayout currentUser={currentUser} onLogout={handleLogoutSuccess} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}
