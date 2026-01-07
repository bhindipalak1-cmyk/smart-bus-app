import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { Bus, Users, Armchair, ShieldCheck, LogOut, Navigation, Navigation as NavIcon, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';

// --- CONFIGURATION ---
// 1. COPY THE URL FROM YOUR FIREBASE "REALTIME DATABASE" TAB
// 2. PASTE IT HERE EXACTLY (e.g., https://my-project-default-rtdb.firebaseio.com)
const FIREBASE_DB_URL = "https://smartbussystem-334b2-default-rtdb.asia-southeast1.firebasedatabase.app/"; 

const app = initializeApp({ databaseURL: FIREBASE_DB_URL });
const db = getDatabase(app);

export default function App() {
  const [view, setView] = useState('home'); 
  const [busData, setBusData] = useState({ passengers: 0, seats: { seat1: 0, seat2: 0, seat3: 0 }, route: 'VIT Pune ➔ Swargate' });
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('connecting'); // 'connecting', 'connected', 'error'
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    console.log("Connecting to Firebase at:", FIREBASE_DB_URL);
    const busRef = ref(db, 'buses/23A');
    
    const unsubscribe = onValue(busRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log("[Firebase Data Received]:", data);
        setStatus('connected');
        setLastUpdate(new Date().toLocaleTimeString());
        
        setBusData({
          passengers: data.passengers || 0,
          seats: data.seats || { seat1: 0, seat2: 0, seat3: 0 },
          route: data.route || 'VIT Pune ➔ Swargate'
        });
      } else {
        console.warn("No data found at buses/23A. Database is empty or path is wrong.");
        setStatus('connected'); // Connected but empty
      }
    }, (error) => {
      console.error("Firebase Read Error:", error);
      setStatus('error');
    });

    return () => unsubscribe();
  }, []);

  const updateCloud = (updates) => {
    update(ref(db, `buses/23A`), updates);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* NAVBAR */}
      <nav className="bg-slate-900 text-white p-4 shadow-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Bus className="text-white h-6 w-6" />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase italic">Transit<span className="text-blue-500">Hub</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black border transition-colors ${
              status === 'connected' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
              status === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
              'bg-blue-500/10 text-blue-500 border-blue-500/20'
            }`}>
              <Activity size={12} className={status === 'connected' ? "animate-pulse" : ""} />
              {status === 'connected' ? "SYSTEM ONLINE" : status === 'error' ? "LINK FAILED" : "ESTABLISHING LINK..."}
            </div>

            {user ? (
              <button onClick={() => setUser(null)} className="bg-slate-800 hover:bg-red-600 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition flex items-center gap-2 border border-white/10">
                <LogOut size={14} /> DISCONNECT
              </button>
            ) : (
              <button onClick={() => setView(view === 'login' ? 'home' : 'login')} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition shadow-lg shadow-blue-500/20">
                {view === 'login' ? 'BACK' : 'STAFF LOGIN'}
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6">
        {view === 'login' ? (
          <div className="mt-20 bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-sm mx-auto text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={32} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-black mb-2">Staff Portal</h2>
            <p className="text-slate-400 text-xs mb-8 font-medium">Authorized personnel only</p>
            <form onSubmit={(e) => { e.preventDefault(); setUser({id: 'Admin'}); setView('home'); }} className="space-y-4 text-left">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Conductor ID</label>
                <input required className="w-full mt-1 p-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 transition-all font-bold text-sm" placeholder="e.g. C-8821" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pin Code</label>
                <input type="password" required className="w-full mt-1 p-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 transition-all font-bold text-sm" placeholder="••••" />
              </div>
              <button className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-blue-600 transition shadow-xl shadow-slate-900/10 mt-4">Establish Secure Link</button>
            </form>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* CONNECTION ALERT */}
            {status === 'error' && (
              <div className="bg-red-50 border-2 border-red-100 p-4 rounded-3xl flex items-center gap-4 text-red-600">
                <AlertTriangle size={24} />
                <div>
                  <p className="font-black text-xs uppercase tracking-widest">Firebase Connection Error</p>
                  <p className="text-[11px] font-medium opacity-80">Please verify the FIREBASE_DB_URL in App.jsx and your Database Rules.</p>
                </div>
              </div>
            )}

            {/* MAIN DASHBOARD */}
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
              <div className="bg-slate-900 p-10 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="text-blue-500" size={16} />
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Active Route</span>
                    </div>
                    <h2 className="text-5xl font-black italic tracking-tighter">BUS 23A</h2>
                    <p className="text-slate-400 font-bold text-sm mt-2 flex items-center gap-2">
                      <NavIcon size={14} className="text-blue-500" /> {busData.route}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                    <div className="bg-blue-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter">
                      In Transit
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* PASSENGERS */}
                <div className="bg-slate-50 p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-center relative group">
                   <Users size={32} className="text-blue-600 mb-4" />
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Boarded</p>
                   <p className="text-7xl font-black tracking-tighter">{busData.passengers}</p>
                   {user && (
                     <div className="flex gap-4 mt-8">
                       <button onClick={() => busData.passengers > 0 && updateCloud({ passengers: busData.passengers - 1 })} className="w-12 h-12 bg-white shadow-lg rounded-2xl font-black text-xl text-red-500 hover:bg-red-50 transition-colors border border-slate-100">-</button>
                       <button onClick={() => updateCloud({ passengers: busData.passengers + 1 })} className="w-12 h-12 bg-white shadow-lg rounded-2xl font-black text-xl text-green-500 hover:bg-green-50 transition-colors border border-slate-100">+</button>
                     </div>
                   )}
                </div>

                {/* SEAT AVAILABILITY */}
                <div className="bg-slate-50 p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                   <Armchair size={32} className="text-green-600 mb-4" />
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vacant Seats</p>
                   <div className="flex items-baseline gap-1">
                    <p className="text-7xl font-black tracking-tighter">
                      {3 - (busData.seats.seat1 + busData.seats.seat2 + busData.seats.seat3)}
                    </p>
                    <p className="text-3xl font-black text-slate-300">/3</p>
                   </div>
                </div>
              </div>

              {/* SEAT MAP */}
              <div className="px-10 pb-12">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-px flex-1 bg-slate-100"></div>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Smart Seat Layout</span>
                  <div className="h-px flex-1 bg-slate-100"></div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  {[1, 2, 3].map(n => {
                    const isOccupied = busData.seats[`seat${n}`] === 1;
                    return (
                      <div 
                        key={n} 
                        onClick={() => user && updateCloud({ [`seats/seat${n}`]: isOccupied ? 0 : 1 })}
                        className={`p-8 rounded-[2rem] flex flex-col items-center gap-4 border-4 transition-all duration-500 cursor-pointer ${
                          isOccupied 
                          ? 'bg-slate-900 border-slate-900 text-white scale-105 shadow-2xl shadow-slate-900/20' 
                          : 'bg-white border-slate-50 text-slate-200 hover:border-blue-400 hover:text-blue-500 hover:scale-105'
                        }`}
                      >
                        <Armchair size={36} className={isOccupied ? "text-blue-400" : "text-slate-100"} />
                        <div className="text-center">
                          <span className="block text-[10px] font-black uppercase tracking-widest mb-1">Seat {n}</span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${isOccupied ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-100 text-slate-400'}`}>
                            {isOccupied ? 'Reserved' : 'Available'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* FOOTER STATS */}
              <div className="bg-slate-50 p-6 flex justify-between items-center border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-400">
                  <Activity size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Last Telemetry: {lastUpdate || 'Waiting...'}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-900"></div>
                    <span className="text-[9px] font-black uppercase text-slate-400">Occupied</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-white border border-slate-200"></div>
                    <span className="text-[9px] font-black uppercase text-slate-400">Empty</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}