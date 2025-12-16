import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusSquare, Settings, LogOut, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const isActive = (path: string) => location.pathname === path;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-background text-text flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-surface border-b border-border p-4 flex justify-between items-center sticky top-0 z-30">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            ViralArc
        </h1>
        <button onClick={toggleSidebar} className="text-text">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed md:sticky top-0 h-full w-64 bg-surface border-r border-border flex-shrink-0 flex flex-col z-40 transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-6 border-b border-border hidden md:block">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            ViralArc
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link 
            to="/" 
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/') ? 'bg-primary/20 text-primary' : 'hover:bg-surfaceHighlight text-textMuted hover:text-text'
            }`}
          >
            <Home size={20} />
            <span>Library</span>
          </Link>
          
          <Link 
            to="/create" 
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/create') ? 'bg-primary/20 text-primary' : 'hover:bg-surfaceHighlight text-textMuted hover:text-text'
            }`}
          >
            <PlusSquare size={20} />
            <span>Create New</span>
          </Link>
          
          <Link 
            to="/settings" 
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/settings') ? 'bg-primary/20 text-primary' : 'hover:bg-surfaceHighlight text-textMuted hover:text-text'
            }`}
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-border">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-textMuted hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;