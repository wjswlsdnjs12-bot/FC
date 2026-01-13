
import React from 'react';
import { Member } from '../types';
import { Crown, Medal, Award, TrendingUp, ShieldCheck } from 'lucide-react';

interface Props {
  members: Member[];
}

const StatsBoard: React.FC<Props> = ({ members }) => {
  const sortedByAttendance = [...members].sort((a, b) => b.totalAttendance - a.totalAttendance);
  const totalAtts = members.reduce((sum, m) => sum + m.totalAttendance, 0);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-10 h-10 text-amber-500 animate-bounce" />;
      case 1: return <Medal className="w-10 h-10 text-slate-300" />;
      case 2: return <Medal className="w-10 h-10 text-amber-700" />;
      default: return <Award className="w-8 h-8 text-slate-100" />;
    }
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="luxury-gradient p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
          <ShieldCheck className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10" />
          <p className="text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Squad Capacity</p>
          <p className="text-5xl font-black italic tracking-tighter">{members.length}<span className="text-xl ml-2 font-bold opacity-50">MEMBERS</span></p>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Total Deployments</p>
          <p className="text-5xl font-black italic tracking-tighter text-slate-900">{totalAtts}<span className="text-xl ml-2 font-bold opacity-30 italic uppercase">Records</span></p>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">DMC Core Age</p>
          <p className="text-5xl font-black italic tracking-tighter text-slate-900">35.4<span className="text-xl ml-2 font-bold opacity-30 italic uppercase">Avg</span></p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-50 overflow-hidden">
        <div className="luxury-gradient p-10 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase flex items-center gap-4">
              <TrendingUp className="w-8 h-8 text-amber-500" />
              Elite Attendance Hall of Fame
            </h2>
            <p className="text-amber-500/80 font-bold text-[10px] uppercase tracking-widest mt-1">FC상암 DMC Season Rankings</p>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {sortedByAttendance.length === 0 ? (
            <div className="p-20 text-center">
              <p className="text-slate-300 font-black uppercase italic tracking-widest">No history recorded</p>
            </div>
          ) : (
            sortedByAttendance.map((member, index) => (
              <div key={member.id} className="flex items-center justify-between p-8 hover:bg-slate-50 transition-all duration-300 group">
                <div className="flex items-center gap-10">
                  <div className="w-12 flex justify-center scale-110 group-hover:scale-125 transition-transform duration-500">
                    {getRankIcon(index)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight italic">{member.name}</h3>
                      {index === 0 && <span className="bg-amber-500 text-slate-900 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Top Elite</span>}
                    </div>
                    <div className="flex gap-3 mt-2">
                      <span className="text-[10px] bg-slate-900 text-white px-3 py-1 rounded-lg font-black uppercase tracking-tighter">{member.preferredPosition}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-3 py-1 rounded-lg font-black uppercase tracking-tighter">{member.ageGroup}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black text-slate-900 italic tracking-tighter group-hover:text-amber-600 transition-colors">{member.totalAttendance}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Appearances</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsBoard;
