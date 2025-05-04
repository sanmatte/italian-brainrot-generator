// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import { FaGithub } from 'react-icons/fa'; // Import the GitHub icon
import './index.css'; // Make sure this imports styles including .animated-galaxy-background

function App() {
  // GitHub URL for the link
  const githubUrl = "https://github.com/sanmatte/italian-brainrot-generator";

  return (
    <Router>
      {/* Apply the galaxy background class and flex properties */}
      <div className="animated-galaxy-background flex flex-col font-sans flex-container-for-footer">

        {/* Navbar: Dark semi-transparent style */}
        <nav className="bg-black/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10 flex-shrink-0">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <span className="font-bold text-lg text-white">
              Italian Brainrot Generator 🇮🇹
            </span>
            {/* Updated links section */}
            <div className="flex items-center space-x-4"> {/* Use flex to align items */}
              <Link to="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Generate</Link>

              {/* GitHub Button Link */}
              <a
                href={githubUrl}
                target="_blank" // Opens in new tab
                rel="noopener noreferrer" // Security measure
                className="inline-flex items-center px-3 py-1.5 border border-gray-600 rounded-md shadow-sm text-xs font-medium text-gray-200 bg-gray-700/80 hover:bg-gray-600/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors" // Button styling
                title="View Source Code on GitHub" // Tooltip
              >
                <FaGithub className="w-4 h-4 mr-1.5" /> {/* Icon */}
                View Source
              </a>

              <Link to="/privacy" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Privacy</Link>
            </div>
          </div>
        </nav>

        {/* Main content area */}
        <main className="container mx-auto p-4 flex-grow relative z-[1]">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
          </Routes>
        </main>

        {/* Footer: Dark semi-transparent style */}
        <footer className="bg-black/60 backdrop-blur-sm text-gray-400 p-4 mt-auto text-center text-xs border-t border-gray-700/50 flex-shrink-0">
           Warning: May Cause Brainrot // Use Responsibly? &copy; {new Date().getFullYear()}
        </footer>

      </div>
    </Router>
  );
}

export default App;
