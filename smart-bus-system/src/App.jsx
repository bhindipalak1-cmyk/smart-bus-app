import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { Bus, Users, Armchair, ShieldCheck, LogOut, Navigation, Navigation as NavIcon, Activity } from 'lucide-react';

// --- CONFIGURATION ---
// 1. COPY THE URL FROM YOUR FIREBASE "REALTIME DATABASE" TAB
// 2. PASTE IT HERE EXACTLY
const FIREBASE_DB_URL = "https://console.firebase.google.com/u/1/project/smartbussystem-334b2/database/smartbussystem-334b2-default-rtdb/data/~2F"; 

const app = initializeApp({ databaseURL: FIREBASE_DB_URL });
const db = getDatabase(app);

export default function App() {
  const [view, setView] = useState('home'); 
  const [busData, setBusData] = useState({ passengers: 0, seats: { seat1: 0, seat2: 0, seat3: 0 }, route: 'VIT Pune ➔ Swargate' });
  const [user, setUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log("Connecting to Firebase at:", FIREBASE_DB_URL);
    const busRef = ref(db, 'buses/23A');
    
    // This listens to the exact same path your NodeMCU is now writing to
    const unsubscribe = onValue(busRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log("[Firebase Data Received]:", data);
        setIsConnected(true);
        
        setBusData({
          passengers: data.passengers || 0,
          seats: data.seats || { seat1: 0, seat2: 0, seat3: 0 },
          route: data.route || 'VIT Pune ➔ Swargate'
        });
      } else {
        console.warn("No data found at buses/23A. Check your Hardware paths!");
        setIsConnected(false);
      }
    }, (error) => {
      console.error("Firebase Read Error:", error);
    });

    return () => unsubscribe();
  }, []);

  const updateCloud = (updates) => {
    update(ref(db, `buses/23A`), updates);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* NAVBAR */}
      <nav className="bg-slate-900 text-white p-4 shadow-xl">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Bus className="text-blue-500 h-8 w-8" />
            <span className="font-black text-xl tracking-tighter uppercase italic">Transit<span className="text-blue-500">Hub</span></span>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold border ${isConnected ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
              <Activity size={12} className={isConnected ? "animate-pulse" : ""} />
              {isConnected ? "CLOUD CONNECTED" : "OFFLINE"}
            </div>
            {user ? (
              <button onClick={() => setUser(null)} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2">
                <LogOut size={16} /> LOGOUT
              </button>
            ) : (
              <button onClick={() => setView(view === 'login' ? 'home' : 'login')} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-xs font-bold transition">
                {view === 'login' ? 'BACK' : 'STAFF LOGIN'}
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6">
        {view === 'login' ? (
          <div className="mt-20 bg-white p-10 rounded-[2rem] shadow-2xl border border-slate-100 max-w-sm mx-auto text-center">
            <ShieldCheck size={48} className="mx-auto text-blue-500 mb-4" />
            <h2 className="text-2xl font-black mb-6">Staff Access</h2>
            <form onSubmit={(e) => { e.preventDefault(); setUser({id: 'Admin'}); setView('home'); }} className="space-y-4">
              <input required className="w-full p-4 bg-slate-50 rounded-xl outline-none border focus:border-blue-500" placeholder="Conductor ID" />
              <input type="password" required className="w-full p-4 bg-slate-50 rounded-xl outline-none border focus:border-blue-500" placeholder="Password" />
              <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition">Establish Link</button>
            </form>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* STATUS CARD */}
            <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
              <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-4xl font-black italic">BUS 23A</h2>
                  <p className="text-blue-400 font-bold text-sm tracking-widest flex items-center gap-2 mt-1">
                    <NavIcon size={14} /> {busData.route}
                  </p>
                </div>
                <div className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-[10px] font-black border border-blue-500/30 uppercase tracking-widest">
                  Live Telemetry
                </div>
              </div>

              {!isConnected && (
                <div className="p-4 bg-orange-50 border-b border-orange-100 text-orange-600 text-[10px] font-bold text-center uppercase tracking-widest">
                  Waiting for data from Hardware... Check your Firebase URL in App.jsx
                </div>
              )}

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* PASSENGERS */}
                <div className="bg-slate-50 p-8 rounded-[2rem] flex flex-col items-center justify-center text-center">
                   <Users size={32} className="text-blue-600 mb-2" />
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Passengers</p>
                   <p className="text-6xl font-black">{busData.passengers}</p>
                   {user && (
                     <div className="flex gap-4 mt-6">
                       <button onClick={() => busData.passengers > 0 && updateCloud({ passengers: busData.passengers - 1 })} className="w-10 h-10 bg-white shadow rounded-full font-bold">-</button>
                       <button onClick={() => updateCloud({ passengers: busData.passengers + 1 })} className="w-10 h-10 bg-white shadow rounded-full font-bold">+</button>
                     </div>
                   )}
                </div>

                {/* SEAT AVAILABILITY */}
                <div className="bg-slate-50 p-8 rounded-[2rem] flex flex-col items-center justify-center text-center">
                   <Armchair size={32} className="text-green-600 mb-2" />
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Available Seats</p>
                   <p className="text-6xl font-black">
                     {3 - (busData.seats.seat1 + busData.seats.seat2 + busData.seats.seat3)}
                     <span className="text-2xl text-slate-300">/3</span>
                   </p>
                </div>
              </div>

              {/* SEAT MAP */}
              <div className="px-8 pb-10">
                <div className="grid grid-cols-3 gap-6">
                  {[1, 2, 3].map(n => {
                    const isOccupied = busData.seats[`seat${n}`] === 1;
                    return (
                      <div 
                        key={n} 
                        onClick={() => user && updateCloud({ [`seats/seat${n}`]: isOccupied ? 0 : 1 })}
                        className={`p-6 rounded-3xl flex flex-col items-center gap-3 border-4 transition-all duration-500 cursor-pointer ${isOccupied ? 'bg-slate-900 border-slate-900 text-white scale-105 shadow-lg' : 'bg-white border-slate-100 text-slate-300 hover:border-blue-400 hover:text-blue-500'}`}
                      >
                        <Armchair size={32} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Seat {n}</span>
                        <span className={`text-[9px] font-black uppercase ${isOccupied ? 'text-blue-400' : 'text-slate-300'}`}>{isOccupied ? 'Occupied' : 'Empty'}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}