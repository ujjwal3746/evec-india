
import React, { useState, useEffect, useCallback } from 'react';
import { searchChargingStations } from './services/geminiService';
import { ChargingStation, SearchResult } from './types';
import Header from './components/Header';
import StationCard from './components/StationCard';
import AdBanner from './components/AdBanner';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => console.warn("Location access denied", err)
      );
    }
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await searchChargingStations(query, userLocation || undefined);
      setResults(data);
    } catch (err) {
      setError("Failed to fetch results. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {/* Top Ad */}
        <AdBanner type="leaderboard" />

        {/* Hero Search Section */}
        <section className="text-center mb-16 relative py-12">
            <div className="absolute inset-0 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
                Empowering Your <span className="gradient-text">Electric Journey</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
                The most advanced EV charging network in India. Powered by AI to find your next charge in seconds.
            </p>

            <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group">
                <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search e.g., 'Fast chargers near Mumbai Airport'..."
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-5 px-6 pl-14 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-lg shadow-2xl"
                />
                <i className="fas fa-bolt absolute left-5 top-1/2 -translate-y-1/2 text-blue-500 text-xl"></i>
                <button 
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50"
                >
                    {loading ? <i className="fas fa-circle-notch animate-spin"></i> : 'Find Now'}
                </button>
            </form>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
                {['Hyperchargers', 'Malls & Hotels', 'Highway Points', 'Tesla Superchargers'].map(tag => (
                    <button 
                        key={tag}
                        onClick={() => { setQuery(tag); setTimeout(handleSearch, 100); }}
                        className="px-4 py-1.5 rounded-full bg-slate-800 text-slate-400 text-sm font-medium hover:bg-slate-700 hover:text-white transition-all border border-slate-700"
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-8 space-y-8">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-3">
                        <i className="fas fa-triangle-exclamation"></i>
                        {error}
                    </div>
                )}

                {!results && !loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-morphism rounded-3xl p-8 flex flex-col justify-center text-center space-y-4">
                            <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-map-location-dot text-blue-400 text-2xl"></i>
                            </div>
                            <h3 className="text-xl font-bold">Real-time Network</h3>
                            <p className="text-slate-400 text-sm">Access live status of 5,000+ stations across 200 cities in India.</p>
                        </div>
                        <div className="glass-morphism rounded-3xl p-8 flex flex-col justify-center text-center space-y-4">
                            <div className="w-16 h-16 bg-emerald-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-route text-emerald-400 text-2xl"></i>
                            </div>
                            <h3 className="text-xl font-bold">Smart Planning</h3>
                            <p className="text-slate-400 text-sm">Plan long trips with automatic charging stop suggestions.</p>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-400 animate-pulse font-medium">Scanning network for optimal chargers...</p>
                    </div>
                )}

                {results && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Available Chargers</h2>
                            <span className="text-slate-500 text-sm">{results.stations.length} locations found</span>
                        </div>

                        {/* Summary Box */}
                        <div className="bg-blue-600/10 border border-blue-500/20 p-5 rounded-2xl">
                             <h4 className="text-blue-400 font-bold text-sm uppercase mb-2">AI Insights</h4>
                             <p className="text-slate-300 leading-relaxed text-sm">
                                {results.text}
                             </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {results.stations.map((station) => (
                                <StationCard key={station.id} station={station} />
                            ))}
                        </div>

                        {results.stations.length === 0 && (
                            <div className="text-center py-20 bg-slate-800/30 rounded-3xl border border-dashed border-slate-700">
                                <i className="fas fa-search text-slate-600 text-4xl mb-4"></i>
                                <p className="text-slate-400">No charging stations found for this query.</p>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Mid-content Ad */}
                <AdBanner type="rectangle" />
            </div>

            {/* Sidebar Area */}
            <aside className="lg:col-span-4 space-y-8">
                {/* Stats Card */}
                <div className="glass-morphism rounded-3xl p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <i className="fas fa-chart-line text-blue-500"></i>
                        Network Status
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Total Stations</span>
                            <span className="font-bold">12,482</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Active Now</span>
                            <span className="font-bold text-emerald-400">98.4%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">New This Week</span>
                            <span className="font-bold text-blue-400">+142</span>
                        </div>
                    </div>
                    <button className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold transition-all border border-slate-700">
                        View Network Map
                    </button>
                </div>

                {/* Sidebar Ad */}
                <AdBanner type="sidebar" />

                {/* Mobile App Promo */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 relative overflow-hidden group">
                    <i className="fas fa-mobile-screen absolute -right-4 -bottom-4 text-9xl text-white/10 rotate-12 group-hover:rotate-6 transition-all"></i>
                    <h3 className="text-xl font-bold mb-2 relative z-10 text-white">Get the Mobile App</h3>
                    <p className="text-blue-100 text-sm mb-6 relative z-10">Real-time occupancy and seamless payments.</p>
                    <div className="flex gap-3 relative z-10">
                        <button className="bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-50 transition-all">
                            App Store
                        </button>
                        <button className="bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-50 transition-all">
                            Play Store
                        </button>
                    </div>
                </div>
            </aside>
        </div>
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 py-12 mt-20">
        <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                            <i className="fas fa-bolt text-white text-xl"></i>
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-white">EVEC<span className="text-blue-500">.IN</span></span>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Leading the charge for India's green revolution. Providing seamless access to high-speed EV charging infrastructure nationwide.
                    </p>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-6">Platform</h4>
                    <ul className="space-y-4 text-slate-400 text-sm">
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Find Chargers</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Route Planner</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Business Solutions</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">API for Developers</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-6">Company</h4>
                    <ul className="space-y-4 text-slate-400 text-sm">
                        <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Press Kit</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-6">Connect</h4>
                    <div className="flex gap-4 mb-6">
                        <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-all text-slate-400 hover:text-white">
                            <i className="fab fa-twitter"></i>
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-all text-slate-400 hover:text-white">
                            <i className="fab fa-linkedin-in"></i>
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-all text-slate-400 hover:text-white">
                            <i className="fab fa-instagram"></i>
                        </a>
                    </div>
                    <p className="text-slate-500 text-xs uppercase font-bold tracking-widest mb-2">Subscribe</p>
                    <div className="flex gap-2">
                        <input type="email" placeholder="Your email" className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        <button className="bg-blue-600 px-4 rounded-lg hover:bg-blue-500 transition-all">
                            <i className="fas fa-paper-plane text-white text-xs"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs">
                <p>&copy; 2024 EVEC India. All rights reserved.</p>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
