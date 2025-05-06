import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import HowToPage from './pages/HowToPage';
import { FaGithub } from 'react-icons/fa';
import './index.css'; 

function App() {
  const githubUrl = "https://github.com/sanmatte/italian-brainrot-generator";

  return (
    <Router>
      <div className="animated-galaxy-background flex flex-col font-sans flex-container-for-footer">

        <nav className="bg-black/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10 flex-shrink-0">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <span className="font-bold text-lg text-white">
              Italian Brainrot Generator 🇮🇹
            </span>
            <div className="flex items-center space-x-4"> 
              <Link to="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Generate</Link>

              <Link to="/guide" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">How To Use it</Link>

              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1.5 border border-gray-600 rounded-md shadow-sm text-xs font-medium text-gray-200 bg-gray-700/80 hover:bg-gray-600/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors"
                title="View Source Code on GitHub"
              >
                <FaGithub className="w-4 h-4 mr-1.5" />
                View Source
              </a>

              <Link to="/privacy" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Privacy</Link>
            </div>
          </div>
        </nav>

        <main className="container mx-auto p-4 flex-grow relative z-[1]">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/guide" element={<HowToPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
          </Routes>
        </main>

        <footer className="bg-black/60 backdrop-blur-sm text-gray-400 p-4 mt-auto text-center text-xs border-t border-gray-700/50 flex-shrink-0">
           Warning: May Cause Brainrot // Use Responsibly? &copy; {new Date().getFullYear()} GNU General Public License v3.0
        </footer>

      </div>
    </Router>
  );
}

export default App;
