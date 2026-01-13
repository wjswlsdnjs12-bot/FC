
import React, { useState } from 'react';
import { AgeGroup, Position } from '../types';
import { AGE_GROUPS, POSITIONS, PITCHES } from '../constants';
import { UserCheck, Calendar, MapPin, ShieldCheck } from 'lucide-react';

interface Props {
  onRegister: (name: string, ageGroup: AgeGroup, position: Position, date: string, pitch: string) => void;
}

const AttendanceForm: React.FC<Props> = ({ onRegister }) => {
  const [name, setName] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('30s');
  const [position, setPosition] = useState<Position>('MF');
  const [pitch, setPitch] = useState(PITCHES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onRegister(name, ageGroup, position, date, pitch);
    setName('');
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden max-w-xl mx-auto">
      <div className="luxury-gradient p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <ShieldCheck className="w-32 h-32 rotate-12" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-black italic tracking-tighter">ELITE ATTENDANCE</h2>
          </div>
          <p className="text-amber-400 font-bold uppercase tracking-widest text-[10px]">FC상암 DMC Premium Management</p>
          <p className="text-slate-400 text-sm mt-4 font-medium">선착순 22명 정규 쿼터 우선 배정</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-10 space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Calendar className="w-3 h-3 text-amber-500" />
              DATE
            </label>
            <input 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-amber-500 font-bold outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <MapPin className="w-3 h-3 text-amber-500" />
              PITCH
            </label>
            <select 
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-amber-500 font-bold outline-none transition-all appearance-none"
            >
              {PITCHES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">PLAYER NAME</label>
          <input 
            type="text"
            required
            placeholder="성함을 입력하세요"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-amber-500 transition-all font-black text-xl placeholder:text-slate-300 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">AGE GROUP</label>
            <div className="grid grid-cols-3 gap-2">
              {AGE_GROUPS.map(age => (
                <button
                  key={age}
                  type="button"
                  onClick={() => setAgeGroup(age)}
                  className={`py-2.5 rounded-xl border text-[10px] font-black transition-all ${
                    ageGroup === age 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                      : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                  }`}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">FAVORITE POSITION</label>
            <div className="grid grid-cols-2 gap-2">
              {POSITIONS.map(pos => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setPosition(pos)}
                  className={`py-2.5 rounded-xl border text-[10px] font-black transition-all ${
                    position === pos 
                      ? 'bg-amber-500 text-slate-900 border-amber-500 shadow-lg' 
                      : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-6 rounded-2xl transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 text-lg active:scale-95 group"
        >
          <UserCheck className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform" />
          REGISTRATION COMPLETE
        </button>
      </form>
    </div>
  );
};

export default AttendanceForm;
