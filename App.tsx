import React, { useState, useEffect } from 'react';
import { searchChargingStations } from './services/geminiService';
import { ChargingStation, SearchResult } from './types';
import Header from './components/Header';
import StationCard from './components/StationCard';
import AdBanner from './components/AdBanner';
import PrivacyPolicy from './components/PrivacyPolicy';
import CookieConsent from './components/CookieConsent';

type Page = 'home' | 'privacy';

const App: React.FC = () => {
  const [view, setView] = useState<Page>('home');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ADSENSE_CONFIG = {
    publisherId: "ca-pub-8240089325914529", 
    slots: {
      topBanner: "", 
      midContent: "", 
      sidebar: "", 
    }
  };

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
    setView('home');
    try {
      const data = await searchChargingStations(query, userLocation || undefined);
      setResults(data);
      // Precise scroll to results
      const resultsElement = document.getElementById('results-view');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-blue-500/30 bg-[#0f172a]">
      <Header onNavigateHome={() => setView('home')} />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {view === 'home' ? (
          <>
            <div className="mb-12">
              <AdBanner 
                type="leaderboard" 
                publisherId={ADSENSE_CONFIG.publisherId}
                adSlot={ADSENSE_CONFIG.slots.topBanner} 
              />
            </div>

            <section className="text-center mb-16 relative py-16 md:py-24">
                <div className="absolute inset-0 bg-blue-600/10 blur-[160px] rounded-full pointer-events-none opacity-50"></div>
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 animate-fade-in">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                    India's Most Advanced Network
                  </div>
                  <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9] text-white">
                    Premium EV <br /><span className="gradient-text">Infrastructure</span>
                  </h1>
                  <p className="text-slate-400 text-lg md:text-2xl max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
                    Access the elite network of hyperchargers across the subcontinent. 
                    AI-driven routing for the discerning electric vehicle owner.
                  </p>

                  <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative group">
                      <div className="absolute inset-0 bg-blue-600/20 blur-2xl group-focus-within:bg-blue-600/40 transition-all opacity-0 group-focus-within:opacity-100"></div>
                      <div className="relative flex items-center bg-slate-900/80 border border-slate-700/50 rounded-[2rem] p-2 backdrop-blur-xl shadow-2xl focus-within:border-blue-500/50 transition-all">
                        <i className="fas fa-search absolute left-6 text-slate-500 text-xl"></i>
                        <input 
                            type="text" 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Find Hyperchargers in Mumbai, Bangalore, Delhi..."
                            className="w-full bg-transparent py-6 px-6 pl-14 text-white placeholder:text-slate-600 focus:outline-none text-xl font-medium"
                        />
                        <button 
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all disabled:opacity-50 active:scale-95 shadow-xl shadow-blue-900/20"
                        >
                            {loading ? <i className="fas fa-circle-notch animate-spin"></i> : 'Execute'}
                        </button>
                      </div>
                  </form>

                  <div className="mt-12 flex flex-wrap justify-center gap-4">
                      {['Mumbai Hyper', 'NH44 Corridor', 'Delhi South', 'Bangalore Tech'].map(tag => (
                          <button 
                              key={tag}
                              onClick={() => { setQuery(tag); setTimeout(() => handleSearch(), 100); }}
                              className="px-5 py-2.5 rounded-2xl bg-slate-900/50 text-slate-500 text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all border border-slate-800 uppercase tracking-[0.15em] hover:border-blue-500/50"
                          >
                              {tag}
                          </button>
                      ))}
                  </div>
                </div>
            </section>

            <div id="results-view" className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-12">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-8 rounded-[2rem] flex items-center gap-6 animate-shake">
                            <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center">
                              <i className="fas fa-exclamation-triangle text-xl"></i>
                            </div>
                            <div>
                              <p className="font-black uppercase tracking-widest text-xs mb-1">System Error</p>
                              <p className="font-medium text-slate-300">{error}</p>
                            </div>
                        </div>
                    )}

                    {!results && !loading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="glass-morphism rounded-[2.5rem] p-12 border-blue-500/10 hover:border-blue-500/30 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl"></div>
                                <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <i className="fas fa-bolt-lightning text-blue-500 text-3xl"></i>
                                </div>
                                <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Tier-1 Hardware</h3>
                                <p className="text-slate-500 text-base leading-relaxed font-medium">We prioritize 120kW+ liquid-cooled dispensers for the fastest possible turnaround times.</p>
                            </div>
                            <div className="glass-morphism rounded-[2.5rem] p-12 border-emerald-500/10 hover:border-emerald-500/30 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 rounded-full blur-3xl"></div>
                                <div className="w-16 h-16 bg-emerald-600/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <i className="fas fa-shield-halved text-emerald-500 text-3xl"></i>
                                </div>
                                <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Verified Uptime</h3>
                                <p className="text-slate-500 text-base leading-relaxed font-medium">Real-time status updates ensure you never arrive at a non-functional charging point.</p>
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div className="flex flex-col items-center justify-center py-32 space-y-8 glass-morphism rounded-[3rem]">
                            <div className="relative">
                              <div className="w-24 h-24 border-2 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <i className="fas fa-satellite text-blue-500 text-2xl animate-pulse"></i>
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-white font-black uppercase tracking-[0.4em] text-xs mb-2">Analyzing Grid</p>
                              <p className="text-slate-500 text-sm font-medium">Connecting to EVEC.IN infrastructure...</p>
                            </div>
                        </div>
                    )}

                    {results && (
                        <div className="space-y-10 animate-fade-in">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-2 h-10 bg-blue-600 rounded-full"></div>
                                  <h2 className="text-3xl font-black text-white tracking-tight">
                                    Live Nodes
                                  </h2>
                                </div>
                                <span className="bg-blue-600/10 text-blue-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                                  {results.stations.length} Active Stations
                                </span>
                            </div>

                            <div className="bg-gradient-to-br from-slate-900 to-[#0f172a] border border-white/5 p-10 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
                                 <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] group-hover:bg-blue-600/10 transition-all"></div>
                                 <div className="flex items-center gap-3 mb-6">
                                   <i className="fas fa-microchip text-blue-500 text-xs"></i>
                                   <h4 className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">AI Synthesis Agent</h4>
                                 </div>
                                 <p className="text-white leading-[1.8] text-lg font-medium italic">
                                    "{results.text}"
                                 </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {results.stations.map((station) => (
                                    <StationCard key={station.id} station={station} />
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <AdBanner 
                      type="rectangle" 
                      publisherId={ADSENSE_CONFIG.publisherId}
                      adSlot={ADSENSE_CONFIG.slots.midContent} 
                    />
                </div>

                <aside className="lg:col-span-4 space-y-12">
                    <div className="glass-morphism rounded-[2.5rem] p-10 border-slate-800/50 sticky top-28">
                        <div className="flex items-center justify-between mb-10">
                          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 flex items-center gap-2">
                              System Monitoring
                          </h3>
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                        </div>
                        
                        <div className="space-y-10">
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <p className="text-slate-400 text-[11px] font-black uppercase tracking-wider">Grid Load</p>
                                    <p className="text-xl font-black text-white">84.2%</p>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                  <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-full w-[84%] relative">
                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                  </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-slate-800/30 p-5 rounded-3xl border border-white/5">
                                <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Active Users</p>
                                <p className="text-lg font-bold text-white">4.8k</p>
                              </div>
                              <div className="bg-slate-800/30 p-5 rounded-3xl border border-white/5">
                                <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Stations</p>
                                <p className="text-lg font-bold text-white">12k+</p>
                              </div>
                            </div>

                            <div className="pt-6 border-t border-slate-800">
                               <p className="text-slate-500 text-[10px] font-medium leading-relaxed">
                                 The evec.in network is currently routing 12.4 megawatts of energy across India's highways.
                               </p>
                            </div>
                        </div>
                        
                        <div className="mt-12">
                           <AdBanner 
                            type="sidebar" 
                            publisherId={ADSENSE_CONFIG.publisherId}
                            adSlot={ADSENSE_CONFIG.slots.sidebar} 
                          />
                        </div>
                    </div>
                </aside>
            </div>
          </>
        ) : (
          <PrivacyPolicy />
        )}
      </main>

      <footer className="bg-[#0b1222] border-t border-slate-800/50 pt-24 pb-12 mt-32">
        <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
                <div className="md:col-span-5">
                    <div className="flex items-center gap-4 mb-10 cursor-pointer" onClick={() => setView('home')}>
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/30">
                            <i className="fas fa-bolt-lightning text-white text-xl"></i>
                        </div>
                        <span className="text-3xl font-black tracking-tighter text-white">EVEC<span className="text-blue-500">.IN</span></span>
                    </div>
                    <p className="text-slate-500 text-lg leading-relaxed font-medium max-w-md">
                        Pioneering India's luxury electric transition with zero-compromise charging infrastructure for elite business and personal fleets.
                    </p>
                    <div className="mt-10 flex gap-6">
                      {['twitter', 'linkedin', 'instagram'].map(platform => (
                        <a key={platform} href="#" className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500 transition-all group">
                          <i className={`fab fa-${platform} group-hover:scale-110 transition-transform`}></i>
                        </a>
                      ))}
                    </div>
                </div>
                <div className="md:col-span-2">
                    <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-10">Navigation</h4>
                    <ul className="space-y-5 text-slate-500 text-sm font-bold">
                        <li><button onClick={() => setView('home')} className="hover:text-blue-500 transition-colors">Station Grid</button></li>
                        <li><a href="#" className="hover:text-blue-500 transition-colors">Hyper-Route</a></li>
                        <li><a href="#" className="hover:text-blue-500 transition-colors">Fleet Solutions</a></li>
                        <li><a href="#" className="hover:text-blue-500 transition-colors">Partner Access</a></li>
                    </ul>
                </div>
                <div className="md:col-span-2">
                    <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-10">Company</h4>
                    <ul className="space-y-5 text-slate-500 text-sm font-bold">
                        <li><button onClick={() => setView('privacy')} className="hover:text-blue-500 transition-colors">Privacy Shield</button></li>
                        <li><a href="#" className="hover:text-blue-500 transition-colors">T&C</a></li>
                        <li><a href="#" className="hover:text-blue-500 transition-colors">Transparency</a></li>
                        <li><a href="#" className="hover:text-blue-500 transition-colors">Media Kit</a></li>
                    </ul>
                </div>
                <div className="md:col-span-3">
                    <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-10">Network Intelligence</h4>
                    <p className="text-slate-600 text-xs font-medium mb-6 leading-relaxed">Subscribe for weekly insights into the expansion of India's elite EV corridors.</p>
                    <div className="relative group">
                        <input type="email" placeholder="corporate@domain.com" className="bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-4 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500/50 pr-14 transition-all" />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/40">
                            <i className="fas fa-arrow-right text-white text-xs"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div className="border-t border-slate-800/30 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-700 text-[9px] font-black uppercase tracking-[0.4em]">
                <p>&copy; 2024 EVEC INDIA NETWORK. ALL ASSETS PROTECTED.</p>
                <div className="flex gap-10">
                  <a href="#" className="hover:text-blue-500 transition-colors">Global Connectivity</a>
                  <a href="#" className="hover:text-blue-500 transition-colors">Security Audit</a>
                  <a href="#" className="hover:text-blue-500 transition-colors">Sustainability Score</a>
                </div>
            </div>
        </div>
      </footer>

      <CookieConsent />
    </div>
  );
};

export default App;