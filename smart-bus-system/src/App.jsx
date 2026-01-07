import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, update, set } from "firebase/database";
import { Bus, Users, Armchair, ShieldCheck, LogOut, Navigation, Navigation as NavIcon, Activity, RefreshCw } from 'lucide-react';

const FIREBASE_DB_URL = "https://smartbussystem-334b2-default-rtdb.asia-southeast1.firebasedatabase.app/"; 

const app = initializeApp({ databaseURL: FIREBASE_DB_URL });
const db = getDatabase(app);

export default function App() {
  const [view, setView] = useState('home'); 
  const [busData, setBusData] = useState({ 
    passengers: 0, 
    seats: { seat1: 0, seat2: 0, seat3: 0 }, 
    overrides: { seat1: false, seat2: false, seat3: false },
    route: 'VIT Pune ➔ Swargate' 
  });
  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ id: '', pass: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const busRef = ref(db, 'buses/23A');
    return onValue(busRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setBusData({
          passengers: Number(data.passengers) || 0,
          seats: data.seats || { seat1: 0, seat2: 0, seat3: 0 },
          overrides: data.overrides || { seat1: false, seat2: false, seat3: false },
          route: data.route || 'VIT Pune ➔ Swargate'
        });
      }
    });
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.id === "23A" && loginForm.pass === "1234") {
      setUser({ id: '23A' });
      setView('home');
      setError('');
    } else {
      setError('Invalid Bus ID or Password');
    }
  };

  const handleLogout = () => {
    // CRITICAL: When logging out, we remove all overrides so sensors work normally again
    update(ref(db, 'buses/23A/overrides'), {
      seat1: false,
      seat2: false,
      seat3: false
    });
    setUser(null);
  };

  const toggleSeatOverride = (seatKey, currentStatus) => {
    if (!user) return;
    const newStatus = currentStatus === 1 ? 0 : 1;
    
    // Set the status and the override flag
    // Hardware will see 'overrides/seatX = true' and stop sending sensor data
    update(ref(db, `buses/23A`), {
      [`seats/${seatKey}`]: newStatus,
      [`overrides/${seatKey}`]: true
    });
  };

  const updatePassengers = (newVal) => {
    set(ref(db, 'buses/23A/passengers'), newVal);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="bg-slate-900 text-white p-4 shadow-xl">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Bus className="text-blue-500 h-8 w-8" />
            <span className="font-black text-xl tracking-tighter uppercase italic">Transit<span className="text-blue-500">Hub</span></span>
          </div>
          {user ? (
            <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest flex items-center gap-2 transition hover:bg-red-600">
              <LogOut size={14} /> EXIT STAFF MODE
            </button>
          ) : (
            <button onClick={() => setView('login')} className="bg-blue-600 px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest transition hover:bg-blue-700">
              STAFF LOGIN
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6">
        {view === 'login' ? (
          <div className="mt-20 bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-sm mx-auto border border-slate-100">
            <ShieldCheck size={48} className="mx-auto text-blue-500 mb-4" />
            <h2 className="text-2xl font-black text-center mb-6 tracking-tight">Staff Portal</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold" 
                placeholder="Bus ID (e.g. 23A)" 
                onChange={e => setLoginForm({...loginForm, id: e.target.value})}
              />
              <input 
                type="password"
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold" 
                placeholder="Password" 
                onChange={e => setLoginForm({...loginForm, pass: e.target.value})}
              />
              {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
              <button className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-blue-600 transition">Login</button>
              <button type="button" onClick={() => setView('home')} className="w-full text-slate-400 font-bold text-sm">Cancel</button>
            </form>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-slate-100">
              <div className="bg-slate-900 p-10 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-5xl font-black italic tracking-tighter">BUS 23A</h2>
                  <p className="text-blue-400 font-bold text-sm mt-2 flex items-center gap-2"><NavIcon size={14} /> {busData.route}</p>
                </div>
                {user && (
                   <div className="bg-orange-500/20 text-orange-400 px-4 py-2 rounded-full text-[10px] font-black border border-orange-500/30 uppercase tracking-widest animate-pulse">
                      Manual Override Active
                   </div>
                )}
              </div>

              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-slate-50 p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                   <Users size={32} className="text-blue-600 mb-4" />
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Boarded Passengers</p>
                   <p className="text-7xl font-black tracking-tighter">{busData.passengers}</p>
                   {user && (
                     <div className="flex gap-4 mt-6">
                       <button onClick={() => updatePassengers(Math.max(0, busData.passengers - 1))} className="w-12 h-12 bg-white shadow rounded-2xl font-black text-xl">-</button>
                       <button onClick={() => updatePassengers(busData.passengers + 1)} className="w-12 h-12 bg-white shadow rounded-2xl font-black text-xl">+</button>
                     </div>
                   )}
                </div>

                <div className="bg-slate-50 p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                   <Armchair size={32} className="text-green-600 mb-4" />
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vacant Seats</p>
                   <p className="text-7xl font-black tracking-tighter">
                     {3 - Object.values(busData.seats).filter(s => s === 1).length}
                     <span className="text-2xl text-slate-300">/3</span>
                   </p>
                </div>
              </div>

              <div className="px-10 pb-12">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] text-center mb-8 italic">Internal Cabin Layout</p>
                <div className="grid grid-cols-3 gap-6">
                  {[1, 2, 3].map(n => {
                    const seatKey = `seat${n}`;
                    const isOccupied = busData.seats[seatKey] === 1;
                    const isOverridden = busData.overrides?.[seatKey];

                    return (
                      <div 
                        key={n} 
                        onClick={() => toggleSeatOverride(seatKey, isOccupied)}
                        className={`p-8 rounded-[2rem] flex flex-col items-center gap-4 border-4 transition-all duration-300 cursor-pointer relative ${
                          isOccupied 
                          ? 'bg-slate-900 border-slate-900 text-white' 
                          : 'bg-white border-slate-100 text-slate-200'
                        } ${user ? 'hover:scale-105 active:scale-95' : 'cursor-default'}`}
                      >
                        {isOverridden && user && (
                          <div className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full shadow-lg shadow-orange-500/50"></div>
                        )}
                        <Armchair size={36} />
                        <div className="text-center">
                          <span className="block text-[10px] font-black uppercase tracking-widest">Seat {n}</span>
                          <span className={`text-[9px] font-black uppercase ${isOccupied ? 'text-blue-400' : 'text-slate-300'}`}>
                            {isOccupied ? 'Occupied' : 'Available'}
                          </span>
                        </div>
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