import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-zinc-900 text-zinc-400 py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Data Sources */}
          <div>
            <h3 className="text-white font-semibold mb-3">Data Sources</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.themoviedb.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  TMDB
                </a>
              </li>
              <li>
                <a 
                  href="https://www.omdbapi.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  OMDb API
                </a>
              </li>
            </ul>
          </div>

          {/* Legal
          <div>
            <h3 className="text-white font-semibold mb-3">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#"
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div> */}

          {/* Resources
          <div>
            <h3 className="text-white font-semibold mb-3">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#"
                  className="hover:text-white transition-colors"
                >
                  API Documentation
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  className="hover:text-white transition-colors"
                >
                  Support
                </a>
              </li>
            </ul>
          </div> */}

          {/* Attribution */}
          <div>
            <h3 className="text-white font-semibold mb-3">Attribution</h3>
            <p className="text-sm">
              This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
            <img 
              src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg" 
              alt="TMDB Logo"
              className="h-12 mt-2"
            />
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-zinc-800 text-center text-sm">
          <p>
            © {new Date().getFullYear()} Pirata Amnis. All rights reserved.
          </p>
          <p className="mt-2">
            We do not host any content. All video content is hosted by third parties.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;