import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart2, PlusCircle, Layers } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showNav = true }) => {
  return (
    <div className="flex flex-col h-full bg-brand-900 text-slate-100 max-w-md mx-auto relative shadow-2xl overflow-hidden">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      {showNav && (
        <nav className="absolute bottom-0 left-0 right-0 bg-brand-800 border-t border-brand-600 h-16 flex items-center justify-around px-2 z-50">
          <NavLink 
            to="/" 
            className={({ isActive }) => `flex flex-col items-center p-2 ${isActive ? 'text-accent-500' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Home size={24} />
            <span className="text-[10px] mt-1 font-medium">Home</span>
          </NavLink>

          <NavLink 
            to="/library" 
            className={({ isActive }) => `flex flex-col items-center p-2 ${isActive ? 'text-accent-500' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <PlusCircle size={24} />
            <span className="text-[10px] mt-1 font-medium">Extra</span>
          </NavLink>

          <NavLink 
            to="/progress" 
            className={({ isActive }) => `flex flex-col items-center p-2 ${isActive ? 'text-accent-500' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <BarChart2 size={24} />
            <span className="text-[10px] mt-1 font-medium">Progress</span>
          </NavLink>

          <NavLink 
            to="/routines" 
            className={({ isActive }) => `flex flex-col items-center p-2 ${isActive ? 'text-accent-500' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Layers size={24} />
            <span className="text-[10px] mt-1 font-medium">Routines</span>
          </NavLink>
        </nav>
      )}
    </div>
  );
};

export default Layout;
