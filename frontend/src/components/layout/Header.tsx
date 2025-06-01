import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  toggleMobileSidebar: () => void;
  title: string;
}

const Header: React.FC<HeaderProps> = ({ toggleMobileSidebar, title }) => {
  const { authState } = useAuth();
  const user = authState.user;

  return (
    <header className="bg-white shadow-sm py-4 px-4 sm:px-6">
      <div className="flex items-center justify-between">
        {/* Mobile menu button */}
        <button
          className="md:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900"
          onClick={toggleMobileSidebar}
        >
          <span className="sr-only">Open sidebar</span>
          <svg
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>

        {/* User dropdown */}
        <div className="relative">
          <div className="flex items-center space-x-3">
            <span className="hidden md:block text-sm font-medium text-gray-700">
              {user?.firstName} {user?.lastName}
            </span>
            <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;