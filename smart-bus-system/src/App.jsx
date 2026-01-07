import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { 
  Bus, Users, Armchair, ShieldCheck, LogOut, 
  MapPin, ChevronRight, Navigation, LayoutDashboard,
  AlertCircle, CheckCircle2, Clock, Activity, Info, Bell
} from 'lucide-react';

// --- CONFIGURATION ---
// IMPORTANT: Paste your Firebase URL here
const FIREBASE_DB_URL = "https://YOUR_PROJECT_ID.firebasedatabase.app"; 

const app = initializeApp({ databaseURL: FIREBASE_DB_URL });
const db = getDatabase(app);

const INITIAL_DATA = {
  '23A': { id: '23A', route: 'VIT Pune ➔ Swargate', crowd: 0, s1: 0, s2: 0, s3: 0 },
};

export default function App() {
  const [view, setView] = useState('home'); 
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [buses, setBuses] = useState(INITIAL_DATA);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!FIREBASE_DB_URL.includes("YOUR_PROJECT_ID")) {
      const busesRef = ref(db, 'buses');
      return onValue(busesRef, (snapshot) => {
        if (snapshot.exists()) setBuses(snapshot.val());
      });
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const id = e.target.busId.value.toUpperCase();
    const pass = e.target.password.value;
    if (pass === 'admin') {
      setUser({ id });
      setSelectedBusId(id);
      setView('dashboard');
    } else {
      alert("Invalid Password. Use 'admin'");
    }
  };

  const updateCloud = (busId, data) => {
    update(ref(db, `buses/${busId}`), data);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100">
      {/* GLASSMORPHISM NAVBAR */}
      <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-2xl">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => !user && setView('home')}>
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <Bus className="text-white h-6 w-6" />
            </div>
            <div>
              <span className="font-black text-2xl tracking-tighter uppercase italic leading-none block">Transit<span className="text-blue-500">Hub</span></span>
              <span className="text-[10px] text-slate-500 font-bold tracking-[0.3em] uppercase">Smart City IoT</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Operator</span>
                  <span className="text-sm font-bold text-blue-400">ID: {user.id}</span>
                </div>
                <button onClick={() => {setUser(null); setView('home');}} className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-2.5 rounded-2xl transition-all duration-300">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              view !== 'login' && (
                <button onClick={() => setView('login')} className="group flex items-center gap-3 bg-white text-slate-900 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-blue-500/10">
                  <ShieldCheck size={16} className="group-hover:rotate-12 transition-transform" /> Staff Access
                </button>
              )
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-12">
        
        {/* VIEW: HOME LIST */}
        {view === 'home' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <Activity size={12} className="animate-pulse" /> Live System Status
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[0.9]">Smart Fleet<span className="text-blue-600">.</span></h2>
                <p className="text-slate-500 max-w-xl text-lg font-medium leading-relaxed">
                  Advanced crowd analytics and seat sensor telemetry transmitted in real-time.
                </p>
              </div>
              <div className="hidden lg:flex items-center gap-2 text-slate-400 text-xs font-bold border-l-2 border-slate-200 pl-6 h-12">
                <Bell size={16} /> Notification server active
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {Object.values(buses).map(bus => (
                <div 
                  key={bus.id} 
                  onClick={() => { setSelectedBusId(bus.id); setView('detail'); }}
                  className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:border-blue-500/30 transition-all duration-500 cursor-pointer group hover:-translate-y-3 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-10">
                      <div className="bg-slate-900 text-white px-6 py-4 rounded-3xl shadow-xl group-hover:bg-blue-600 transition-colors duration-500">
                        <h3 className="text-4xl font-black tabular-nums tracking-tighter">{bus.id}</h3>
                      </div>
                      <Badge crowd={bus.crowd} />
                    </div>
                    
                    <div className="flex items-center gap-3 text-slate-400 mb-10 font-bold text-sm">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                        <MapPin size={18} />
                      </div>
                      <span className="truncate">{bus.route}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-50">
                      <Stat icon={<Users size={20} className="text-blue-500" />} label="Passengers" value={bus.crowd} />
                      <Stat icon={<Armchair size={20} className="text-green-500" />} label="Availability" value={3 - (bus.s1 + bus.s2 + bus.s3)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: DETAIL */}
        {view === 'detail' && selectedBusId && (
          <div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-500">
            <button onClick={() => setView('home')} className="mb-10 flex items-center gap-3 text-slate-400 hover:text-blue-600 font-black text-xs tracking-widest transition group">
              <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ChevronRight size={18} className="rotate-180" />
              </div>
              RETURN TO HUB
            </button>
            
            <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100">
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-16 text-white relative">
                <div className="absolute bottom-0 right-0 p-16 opacity-10 rotate-12">
                  <Bus size={200} />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="inline-block bg-blue-500 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Vehicle Profile</div>
                  <h1 className="text-8xl font-black tabular-nums tracking-tighter">{buses[selectedBusId].id}</h1>
                  <p className="text-blue-300 flex items-center gap-3 font-bold uppercase tracking-widest text-sm">
                    <Navigation size={20} /> {buses[selectedBusId].route}
                  </p>
                </div>
              </div>

              <div className="p-16">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16">
                  <div className="space-y-2">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Telemetry Data</p>
                    <p className="text-7xl font-black text-slate-900">{buses[selectedBusId].crowd} <span className="text-2xl text-slate-300 font-medium">PASSENGERS</span></p>
                  </div>
                  <Badge crowd={buses[selectedBusId].crowd} large />
                </div>

                <div className="bg-[#f1f5f9] rounded-[3rem] p-12 border border-slate-100">
                   <div className="flex items-center justify-between mb-12">
                    <h3 className="font-black text-slate-800 uppercase tracking-[0.2em] text-xs flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                        <Armchair size={16} />
                      </div>
                      Internal Seat Diagnostics
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-10">
                    {[1, 2, 3].map(n => (
                      <Seat key={n} id={n} status={buses[selectedBusId][`s${n}`]} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: STAFF PORTAL */}
        {view === 'login' && (
          <div className="max-w-md mx-auto mt-20 animate-in fade-in slide-in-from-bottom-12 duration-700">
            <div className="bg-white p-14 rounded-[3.5rem] shadow-2xl border border-slate-100 relative">
              <div className="text-center mb-12 space-y-4">
                <div className="bg-slate-900 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl rotate-3">
                  <ShieldCheck size={40} className="text-blue-500" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Operator Login</h2>
                <p className="text-slate-400 font-bold text-sm">Secure biometric or key authentication</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-6">
                <input name="busId" required className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition font-bold text-lg placeholder:text-slate-300" placeholder="Bus Identifier (23A)" />
                <input name="password" type="password" required className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition font-bold text-lg placeholder:text-slate-300" placeholder="Console Password" />
                <button type="submit" className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-6 rounded-2xl shadow-2xl transition-all duration-500 uppercase tracking-[0.2em] text-xs active:scale-95">
                  Establish Link
                </button>
              </form>
              <button onClick={() => setView('home')} className="w-full text-center mt-10 text-slate-300 font-bold text-xs uppercase tracking-widest hover:text-slate-500 transition-colors">Cancel Connection</button>
            </div>
          </div>
        )}

        {/* VIEW: DASHBOARD */}
        {view === 'dashboard' && user && buses[user.id] && (
          <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
            <div className="bg-slate-900 rounded-[3rem] p-12 text-white flex flex-col lg:flex-row justify-between items-center gap-10 shadow-2xl border border-slate-800">
              <div className="flex items-center gap-10 text-center md:text-left">
                <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-8 rounded-[2rem] shadow-2xl shadow-blue-500/40 rotate-6">
                  <LayoutDashboard size={48} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-5xl font-black tracking-tight leading-none uppercase italic">{user.id} <span className="text-blue-500">Console</span></h2>
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.3em]">Master Hardware Override Active</p>
                </div>
              </div>
              <div className="px-8 py-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl text-[10px] font-black tracking-[0.4em] flex items-center gap-4">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse-slow" /> CLOUD SYNC: 100%
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* CROWD OVERRIDE */}
              <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-200">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-12 flex items-center gap-4">
                  <Users size={18} className="text-blue-500" /> Passenger Load Manual Entry
                </h3>
                <div className="flex items-center justify-between bg-slate-50 rounded-[3rem] p-10 mb-12 border border-slate-100">
                  <button onClick={() => buses[user.id].crowd > 0 && updateCloud(user.id, { crowd: buses[user.id].crowd - 1 })} className="w-24 h-24 bg-white rounded-[2rem] shadow-xl text-red-500 text-5xl font-black hover:bg-red-500 hover:text-white transition-all duration-300">-</button>
                  <span className="text-9xl font-black text-slate-800 tabular-nums tracking-tighter">{buses[user.id].crowd}</span>
                  <button onClick={() => updateCloud(user.id, { crowd: buses[user.id].crowd + 1 })} className="w-24 h-24 bg-white rounded-[2rem] shadow-xl text-green-500 text-5xl font-black hover:bg-green-500 hover:text-white transition-all duration-300">+</button>
                </div>
                <button onClick={() => updateCloud(user.id, { crowd: 0 })} className="w-full py-6 text-[10px] font-black text-slate-400 bg-slate-50 rounded-3xl border border-slate-100 uppercase tracking-[0.4em] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all">Clear Occupancy Buffer</button>
              </div>

              {/* SEAT OVERRIDE */}
              <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-200">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-12 flex items-center gap-4">
                  <Armchair size={18} className="text-indigo-500" /> Sensor Data Override
                </h3>
                <div className="grid grid-cols-3 gap-8">
                  {[1, 2, 3].map(n => {
                    const occupied = buses[user.id][`s${n}`] === 1;
                    return (
                      <button 
                        key={n}
                        onClick={() => updateCloud(user.id, { [`s${n}`]: occupied ? 0 : 1 })}
                        className={`aspect-square rounded-[2.5rem] flex flex-col items-center justify-center gap-4 border-4 transition-all duration-300 active:scale-90 ${occupied ? 'bg-slate-900 border-slate-900 text-white shadow-2xl shadow-slate-300' : 'bg-white border-slate-50 text-slate-200 hover:border-blue-400 hover:text-blue-600'}`}
                      >
                        <span className="text-[10px] font-black uppercase opacity-40">S{n}</span>
                        {occupied ? <AlertCircle size={28} className="text-blue-400" /> : <CheckCircle2 size={28} />}
                      </button>
                    )
                  })}
                </div>
                <div className="mt-12 bg-blue-50/50 p-8 rounded-3xl flex items-start gap-6 border border-blue-100/50">
                   <Info className="text-blue-600 mt-1 shrink-0" size={24} />
                   <p className="text-xs font-bold text-blue-900/40 leading-relaxed uppercase tracking-widest">Manual state overrides will bypass hardware IR sensors until the vehicle mainboard is reset.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// --- SUBCOMPONENTS ---

function Stat({ icon, label, value }) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{label}</p>
      <div className="flex items-center gap-4 text-3xl font-black text-slate-900 tabular-nums">
        <div className="p-2 bg-slate-50 rounded-lg">{icon}</div> {value}
      </div>
    </div>
  );
}

function Badge({ crowd, large }) {
  let style = "bg-emerald-50 text-emerald-600 border-emerald-100";
  let text = "Available";
  let Icon = CheckCircle2;

  if (crowd > 5) {
    style = "bg-rose-50 text-rose-600 border-rose-100";
    text = "Full Capacity";
    Icon = AlertCircle;
  } else if (crowd > 0) {
    style = "bg-amber-50 text-amber-600 border-amber-100";
    text = "Moderate Load";
    Icon = Clock;
  }

  return (
    <div className={`flex items-center gap-3 font-black uppercase tracking-[0.2em] rounded-full border ${style} ${large ? 'px-8 py-4 text-xs' : 'px-4 py-2 text-[8px]'}`}>
      <Icon size={large ? 18 : 12} className={large ? "animate-pulse" : ""} /> {text}
    </div>
  );
}

function Seat({ id, status }) {
  return (
    <div className={`aspect-square rounded-[3rem] flex flex-col items-center justify-center gap-4 border-4 transition-all duration-1000 ${status ? 'bg-slate-900 border-slate-900 text-white scale-105 shadow-2xl' : 'bg-white border-slate-100 text-slate-200'}`}>
      <Armchair size={48} strokeWidth={status ? 2.5 : 1} />
      <div className="text-center">
        <span className="block text-[9px] font-black uppercase opacity-30 mb-1 tracking-widest">Sensor {id}</span>
        <span className={`block text-[11px] font-black uppercase tracking-widest ${status ? 'text-blue-400' : 'text-slate-400'}`}>{status ? 'Occupied' : 'Vacant'}</span>
      </div>
    </div>
  );
}