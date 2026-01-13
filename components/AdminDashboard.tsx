
import React, { useState, useMemo } from 'react';
import { Member, Position, AttendanceRecord } from '../types';
import { POSITIONS } from '../constants';
import { Star, UserCog, UserMinus, Calendar, Search, Filter, PieChart } from 'lucide-react';

interface Props {
  members: Member[];
  attendance: AttendanceRecord[];
  onUpdateSkill: (id: string, score: number) => void;
  onUpdatePosition: (id: string, position: Position) => void;
}

const AdminDashboard: React.FC<Props> = ({ members, attendance, onUpdateSkill, onUpdatePosition }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter members who attended on the selected date
  const attendeesOnDate = useMemo(() => {
    const attendeeIds = new Set(
      attendance
        .filter(record => record.date === selectedDate)
        .map(record => record.memberId)
    );

    return members.filter(m => attendeeIds.has(m.id));
  }, [members, attendance, selectedDate]);

  // Position distribution stats
  const stats = useMemo(() => {
    const counts: Record<string, number> = { GK: 0, DF: 0, MF: 0, FW: 0 };
    attendeesOnDate.forEach(m => {
      counts[m.preferredPosition]++;
    });
    return counts;
  }, [attendeesOnDate]);

  // Apply search filter and stable sort
  const filteredAttendees = useMemo(() => {
    return attendeesOnDate
      .filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [attendeesOnDate, searchTerm]);

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-red-600 bg-red-50 border-red-100';
    if (score >= 3.5) return 'text-orange-600 bg-orange-50 border-orange-100';
    if (score >= 2.5) return 'text-green-600 bg-green-50 border-green-100';
    return 'text-blue-600 bg-blue-50 border-blue-100';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Controls */}
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
          <div>
            <div className="flex items-center gap-3">
              <UserCog className="w-8 h-8 text-amber-500" />
              <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">Coach Control</h2>
            </div>
            <p className="text-slate-400 font-bold mt-2 text-sm uppercase tracking-wider">특정 날짜 출석자 명단 관리 및 실력 평정</p>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-3 bg-slate-900 px-6 py-3 rounded-2xl border border-slate-800 shadow-xl group">
              <Calendar className="w-4 h-4 text-amber-500" />
              <div className="flex flex-col">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Target Date</label>
                <input 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)} 
                  className="bg-transparent border-0 font-black text-white focus:ring-0 text-sm outline-none" 
                />
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm focus-within:ring-2 focus-within:ring-amber-500 transition-all">
              <Search className="w-4 h-4 text-slate-300" />
              <input 
                type="text" 
                placeholder="선수 이름 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-0 font-bold text-slate-800 focus:ring-0 text-sm outline-none w-40"
              />
            </div>
          </div>
        </div>

        {/* Attendance Summary Bar */}
        {attendeesOnDate.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10 bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
              <span className="text-2xl font-black text-slate-900">{attendeesOnDate.length}</span>
            </div>
            {POSITIONS.map(pos => (
              <div key={pos} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{pos}</span>
                <span className={`text-2xl font-black ${stats[pos] > 0 ? 'text-amber-600' : 'text-slate-300'}`}>{stats[pos]}</span>
              </div>
            ))}
          </div>
        )}

        {/* Member Grid */}
        {filteredAttendees.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAttendees.map(member => (
              <div key={member.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                      {member.name}
                      <span className="text-[10px] px-2 py-1 bg-slate-900 text-amber-500 rounded-lg font-black uppercase tracking-tighter">
                        {member.ageGroup}
                      </span>
                    </h3>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Total Appearances: {member.totalAttendance}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 transition-all ${getScoreColor(member.skillScore)}`}>
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-sm font-black italic">{member.skillScore.toFixed(1)}</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Skill Evaluation</label>
                      <span className="text-xs font-black text-slate-800 italic">{member.skillScore.toFixed(1)} / 5.0</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="5"
                      step="0.1"
                      value={member.skillScore}
                      onChange={(e) => onUpdateSkill(member.id, parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Core Position</label>
                    <div className="grid grid-cols-4 gap-2">
                      {POSITIONS.map(pos => (
                        <button
                          key={pos}
                          onClick={() => onUpdatePosition(member.id, pos)}
                          className={`py-2 rounded-xl text-[10px] font-black border transition-all ${
                            member.preferredPosition === pos
                              ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                              : 'bg-white text-slate-300 border-slate-100 hover:border-slate-300'
                          }`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center gap-6">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 animate-pulse">
              <UserMinus className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-black text-slate-800 uppercase italic">No Players Found</p>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
                {selectedDate} 날짜에 출석한 선수가 없거나 검색 결과가 없습니다.
              </p>
            </div>
            <button 
              onClick={() => {setSelectedDate(new Date().toISOString().split('T')[0]); setSearchTerm('');}}
              className="mt-4 px-8 py-3 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
