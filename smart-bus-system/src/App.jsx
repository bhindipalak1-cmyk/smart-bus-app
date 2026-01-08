import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, update, set } from "firebase/database";
import { Bus, Users, Armchair, ShieldCheck, LogOut, Navigation, Activity, Lock, Unlock } from 'lucide-react';

// --- CONFIGURATION ---
const FIREBASE_DB_URL = "https://smartbussystem-334b2-default-rtdb.asia-southeast1.firebasedatabase.app/"; // REPLACE ME

const app = initializeApp({ databaseURL: FIREBASE_DB_URL });
const db = getDatabase(app);

export default function App() {
  const [view, setView] = useState('home'); 
  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ id: '', pass: '' });
  const [error, setError] = useState('');
  const [busData, setBusData] = useState({ 
    passengers: 0, 
    seats: { seat1: 0, seat2: 0, seat3: 0 }, 
    overrides: { seat1: false, seat2: false, seat3: false }
  });

  useEffect(() => {
    const busRef = ref(db, 'buses/23A');
    return onValue(busRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setBusData({
          passengers: data.passengers || 0,
          seats: data.seats || { seat1: 0, seat2: 0, seat3: 0 },
          overrides: data.overrides || { seat1: false, seat2: false, seat3: false }
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
      setError('Incorrect Credentials');
    }
  };

  const logout = () => {
    // Release all overrides so sensors take back control
    update(ref(db, 'buses/23A/overrides'), { seat1: false, seat2: false, seat3: false });
    setUser(null);
  };

  const toggleSeat = (seatKey, currentVal) => {
    if (!user) return;
    const newVal = currentVal === 1 ? 0 : 1;
    update(ref(db, 'buses/23A'), {
      [`seats/${seatKey}`]: newVal,
      [`overrides/${seatKey}`]: true // Lock this seat so hardware can't change it
    });
  };

  const adjustPpl = (delta) => {
    const next = Math.max(0, busData.passengers + delta);
    set(ref(db, 'buses/23A/passengers'), next);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="bg-slate-900 text-white p-4 shadow-xl flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bus className="text-blue-500" />
          <span className="font-black italic uppercase">TransitHub</span>
        </div>
        {user ? (
          <button onClick={logout} className="bg-red-500 px-3 py-1.5 rounded-lg text-[10px] font-bold">LOGOUT STAFF</button>
        ) : (
          <button onClick={() => setView('login')} className="bg-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-bold">STAFF LOGIN</button>
        )}
      </nav>

      <main className="max-w-md mx-auto p-4">
        {view === 'login' ? (
          <form onSubmit={handleLogin} className="mt-20 bg-white p-8 rounded-3xl shadow-xl space-y-4">
            <h2 className="text-xl font-black text-center">Staff Access</h2>
            <input className="w-full p-3 bg-slate-100 rounded-xl outline-none" placeholder="Bus ID (23A)" onChange={e=>setLoginForm({...loginForm, id:e.target.value})} />
            <input type="password" className="w-full p-3 bg-slate-100 rounded-xl outline-none" placeholder="Password" onChange={e=>setLoginForm({...loginForm, pass:e.target.value})} />
            {error && <p className="text-red-500 text-center text-xs font-bold">{error}</p>}
            <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">Verify & Connect</button>
            <button type="button" onClick={()=>setView('home')} className="w-full text-slate-400 text-sm">Cancel</button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
              <div className="bg-slate-900 p-6 text-white">
                <h1 className="text-3xl font-black italic">ROUTE 23A</h1>
                <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mt-1">VIT Pune ➔ Swargate</p>
              </div>

              <div className="p-6 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-6 rounded-2xl text-center">
                  <Users size={24} className="mx-auto text-blue-600 mb-2" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Passengers</p>
                  <p className="text-4xl font-black">{busData.passengers}</p>
                  {user && (
                    <div className="flex gap-2 justify-center mt-3">
                      <button onClick={()=>adjustPpl(-1)} className="w-8 h-8 bg-white border rounded-lg font-bold shadow-sm">-</button>
                      <button onClick={()=>adjustPpl(1)} className="w-8 h-8 bg-white border rounded-lg font-bold shadow-sm">+</button>
                    </div>
                  )}
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl text-center">
                  <Armchair size={24} className="mx-auto text-green-600 mb-2" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Available</p>
                  <p className="text-4xl font-black">{3 - Object.values(busData.seats).filter(s=>s===1).length}<span className="text-sm text-slate-300">/3</span></p>
                </div>
              </div>

              <div className="px-6 pb-8">
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map(n => {
                    const key = `seat${n}`;
                    const active = busData.seats[key] === 1;
                    const overridden = busData.overrides[key];
                    return (
                      <div 
                        key={n} 
                        onClick={() => toggleSeat(key, busData.seats[key])}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all relative ${active ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-200'} ${user ? 'cursor-pointer' : 'cursor-default'}`}
                      >
                        {user && overridden && <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
                        <Armchair size={24} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Seat {n}</span>
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