
import React, { useState, useMemo } from 'react';
import { Member, AttendanceRecord, TeamResult, Position } from '../types';
import { PITCHES, POSITIONS } from '../constants';
import { balanceTeams } from '../utils/balancing';
// Added Info to lucide-react imports
import { Shuffle, Clock, MapPin, Calendar, CheckCircle2, History, RotateCcw, ArrowRight, ArrowLeft, Star, Shield, Info } from 'lucide-react';

interface Props {
  members: Member[];
  attendance: AttendanceRecord[];
}

interface MatchHistoryRecord {
  matchNumber: number;
  teams: TeamResult;
  playerIds: string[];
}

const TeamGenerator: React.FC<Props> = ({ members, attendance }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPitch, setSelectedPitch] = useState(PITCHES[0]);
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());
  const [matchHistory, setMatchHistory] = useState<MatchHistoryRecord[]>([]);
  const [currentMatchResult, setCurrentMatchResult] = useState<TeamResult | null>(null);

  // 1. Filter attendees by date/pitch and sort by original attendance arrival
  const allAttendees = useMemo(() => {
    return attendance
      .filter(record => record.date === selectedDate && record.pitch === selectedPitch)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(record => {
        const member = members.find(m => m.id === record.memberId);
        return member ? { ...member } : null;
      })
      .filter((m): m is Member => m !== null);
  }, [attendance, members, selectedDate, selectedPitch]);

  // 2. Count match participation in current session
  const playerStats = useMemo(() => {
    const stats: Record<string, number> = {};
    allAttendees.forEach(p => stats[p.id] = 0);
    matchHistory.forEach(match => {
      match.playerIds.forEach(id => {
        if (stats[id] !== undefined) stats[id]++;
      });
    });
    return stats;
  }, [allAttendees, matchHistory]);

  // 3. Selection Logic: FAIR ROTATION
  // Priority 1: Played fewer matches today
  // Priority 2: Arrived earlier (first-come first-served)
  const playingSquad = useMemo(() => {
    const available = allAttendees.filter(p => !excludedIds.has(p.id));
    
    const sortedForSelection = [...available].sort((a, b) => {
      const countA = playerStats[a.id] || 0;
      const countB = playerStats[b.id] || 0;
      // prioritize those with fewer matches
      if (countA !== countB) return countA - countB;
      return 0; // maintain relative arrival order (stable sort)
    });

    // Select top 22 for a standard full match
    const squad = sortedForSelection.slice(0, 22);
    
    // Auto-assign GK for the latest arrivals in the squad (optional hint, can be manually changed)
    if (squad.length >= 2) {
      return squad.map((player, index) => {
        if (index >= squad.length - 2 && player.preferredPosition !== 'GK') {
          return { ...player, preferredPosition: 'GK' as Position };
        }
        return player;
      });
    }
    return squad;
  }, [allAttendees, excludedIds, playerStats]);

  const handleGenerate = () => {
    if (playingSquad.length < 2) {
      alert('최소 2명 이상의 인원이 필요합니다.');
      return;
    }
    const teams = balanceTeams(playingSquad);
    setCurrentMatchResult(teams);
  };

  const handleMovePlayer = (playerId: string, fromTeam: 'A' | 'B') => {
    if (!currentMatchResult) return;
    const newResult = { ...currentMatchResult };
    let playerToMove: Member | undefined;

    if (fromTeam === 'A') {
      playerToMove = newResult.teamA.find(p => p.id === playerId);
      if (playerToMove) {
        newResult.teamA = newResult.teamA.filter(p => p.id !== playerId);
        newResult.teamB = [...newResult.teamB, playerToMove];
      }
    } else {
      playerToMove = newResult.teamB.find(p => p.id === playerId);
      if (playerToMove) {
        newResult.teamB = newResult.teamB.filter(p => p.id !== playerId);
        newResult.teamA = [...newResult.teamA, playerToMove];
      }
    }
    newResult.scoreA = newResult.teamA.reduce((sum, p) => sum + p.skillScore, 0);
    newResult.scoreB = newResult.teamB.reduce((sum, p) => sum + p.skillScore, 0);
    setCurrentMatchResult(newResult);
  };

  const handleUpdatePosition = (playerId: string, team: 'A' | 'B', newPos: Position) => {
    if (!currentMatchResult) return;
    const newResult = { ...currentMatchResult };
    const teamKey = team === 'A' ? 'teamA' : 'teamB';
    newResult[teamKey] = newResult[teamKey].map(p => 
      p.id === playerId ? { ...p, preferredPosition: newPos } : p
    );
    setCurrentMatchResult(newResult);
  };

  const handleSaveMatch = () => {
    if (!currentMatchResult) return;
    const newMatch: MatchHistoryRecord = {
      matchNumber: matchHistory.length + 1,
      teams: currentMatchResult,
      playerIds: [...currentMatchResult.teamA.map(p => p.id), ...currentMatchResult.teamB.map(p => p.id)]
    };
    setMatchHistory(prev => [...prev, newMatch]);
    setCurrentMatchResult(null);
    alert(`${newMatch.matchNumber}쿼터 경기 기록 완료!`);
  };

  const resetToday = () => {
    if (confirm('오늘의 모든 매치 기록을 초기화하시겠습니까?')) {
      setMatchHistory([]);
      setCurrentMatchResult(null);
      setExcludedIds(new Set());
    }
  };

  const toggleExclusion = (id: string) => {
    setExcludedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setCurrentMatchResult(null);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
          <div>
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-amber-500" />
              <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">Quarter Manager</h2>
              <span className="bg-slate-900 text-amber-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-amber-500/30">Match {matchHistory.length + 1}</span>
            </div>
            <p className="text-slate-400 font-bold mt-2 text-sm uppercase tracking-wider">Fair Rotation Algorithm Enabled</p>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
              <Calendar className="w-4 h-4 text-amber-600" />
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent border-0 font-bold focus:ring-0 text-sm outline-none" />
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
              <MapPin className="w-4 h-4 text-amber-600" />
              <select value={selectedPitch} onChange={(e) => setSelectedPitch(e.target.value)} className="bg-transparent border-0 font-bold focus:ring-0 text-sm outline-none appearance-none cursor-pointer">
                {PITCHES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <button onClick={resetToday} className="p-4 text-slate-300 hover:text-red-500 transition-all hover:bg-red-50 rounded-2xl" title="Reset Session">
              <RotateCcw className="w-6 h-6" />
            </button>
            <button 
              onClick={handleGenerate}
              className="bg-slate-900 hover:bg-slate-800 text-white font-black px-8 py-4 rounded-2xl transition-all flex items-center gap-3 shadow-2xl shadow-slate-300 disabled:opacity-30 group"
              disabled={playingSquad.length === 0}
            >
              <Shuffle className="w-5 h-5 text-amber-500 group-hover:rotate-180 transition-transform duration-500" />
              팀 생성 ({playingSquad.length}명)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
          <div className="xl:col-span-3 space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 px-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Player Attendance & Match Counts
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {allAttendees.map((p, i) => {
                const isExcluded = excludedIds.has(p.id);
                const isInPlayingSquad = playingSquad.some(sq => sq.id === p.id);
                const matchesPlayed = playerStats[p.id] || 0;
                const isLateGK = isInPlayingSquad && (playingSquad.indexOf(playingSquad.find(sq => sq.id === p.id)!) >= playingSquad.length - 2);
                
                return (
                  <div 
                    key={p.id} 
                    onClick={() => toggleExclusion(p.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                      isExcluded ? 'bg-slate-50 border-slate-100 opacity-30 scale-95 grayscale' : 
                      isInPlayingSquad ? (isLateGK ? 'bg-amber-50 border-amber-200 ring-4 ring-amber-50 shadow-lg' : 'bg-white border-slate-900 shadow-md scale-[1.02]') :
                      'bg-slate-100 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-black ${isInPlayingSquad ? 'bg-slate-900 text-amber-400' : 'bg-slate-300 text-white'}`}>
                        {i + 1}
                      </span>
                      <span className={`font-black text-slate-800 ${isExcluded ? 'line-through' : ''}`}>{p.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-lg border border-amber-500/30">
                        <span className="text-[10px] font-black text-amber-500">{matchesPlayed}회</span>
                      </div>
                      {isLateGK && <span className="text-[8px] bg-slate-900 text-white px-2 py-1 rounded-md font-black italic tracking-tighter">GK 예정</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                 <History className="w-24 h-24" />
               </div>
              <h4 className="font-black text-amber-500 text-xs uppercase tracking-widest flex items-center gap-2 mb-6">
                QUARTER HISTORY
              </h4>
              <div className="space-y-3 relative z-10">
                {matchHistory.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-[10px] text-slate-500 font-bold uppercase italic">No matches recorded yet</p>
                  </div>
                ) : (
                  matchHistory.map(m => (
                    <div key={m.matchNumber} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex justify-between items-center group hover:border-amber-500/50 transition-colors">
                      <span className="text-[10px] font-black text-slate-400 group-hover:text-amber-500">Q{m.matchNumber}</span>
                      <div className="flex gap-3">
                        <span className="text-xs bg-blue-900/50 text-blue-400 px-2 py-1 rounded-lg font-black border border-blue-500/20">{m.teams.scoreA.toFixed(1)}</span>
                        <span className="text-xs text-slate-600 font-black">vs</span>
                        <span className="text-xs bg-red-900/50 text-red-400 px-2 py-1 rounded-lg font-black border border-red-500/20">{m.teams.scoreB.toFixed(1)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {currentMatchResult && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-6">
            <div>
              <h3 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase">PROPOSED ELITE LINEUP</h3>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-500" />
                Manually adjust positions and swap teams before finalization
              </p>
            </div>
            <button 
              onClick={handleSaveMatch}
              className="bg-slate-900 hover:bg-slate-800 text-amber-500 font-black px-12 py-5 rounded-2xl flex items-center gap-3 shadow-2xl transition-all active:scale-95 group"
            >
              <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
              QUARTER START
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Team A (Blue) */}
            <div className="bg-white rounded-[3rem] border border-blue-100 overflow-hidden shadow-2xl relative">
              <div className="luxury-gradient p-8 text-white flex justify-between items-center border-b-4 border-blue-500/30">
                <div>
                  <h4 className="text-3xl font-black italic tracking-tighter gold-text">TEAM BLUE</h4>
                  <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest mt-1">{currentMatchResult.teamA.length} ELITE PLAYERS</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] opacity-50 uppercase font-black tracking-widest">Balance Rating</p>
                  <p className="text-4xl font-black text-amber-500">{currentMatchResult.scoreA.toFixed(1)}</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {currentMatchResult.teamA.map((p, idx) => (
                  <div key={p.id} className="group flex flex-col p-5 bg-slate-50 rounded-[1.5rem] border-2 border-slate-100 hover:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-blue-400 tracking-tighter">PLAYER {idx + 1}</span>
                        <span className="text-lg font-black text-slate-800">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleMovePlayer(p.id, 'A')} className="p-2 bg-white border border-slate-200 rounded-xl text-blue-500 hover:bg-slate-900 hover:text-amber-500 transition-all shadow-sm group/move">
                          <ArrowRight className="w-5 h-5 group-hover/move:translate-x-1 transition-transform" />
                        </button>
                        <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-amber-500/20 shadow-inner">
                           <Star className="w-3 h-3 text-amber-500 fill-current" />
                           <span className="text-xs font-black text-white">{p.skillScore.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {POSITIONS.map(pos => (
                        <button
                          key={pos}
                          onClick={() => handleUpdatePosition(p.id, 'A', pos)}
                          className={`flex-1 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase ${
                            p.preferredPosition === pos
                              ? (pos === 'GK' ? 'bg-amber-500 text-slate-900 shadow-lg ring-4 ring-amber-100' : 'bg-slate-900 text-white shadow-lg')
                              : 'bg-white text-slate-300 border border-slate-100 hover:border-slate-300 hover:text-slate-500'
                          }`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team B (Red) */}
            <div className="bg-white rounded-[3rem] border border-red-100 overflow-hidden shadow-2xl relative">
              <div className="luxury-gradient p-8 text-white flex justify-between items-center border-b-4 border-red-500/30">
                <div>
                  <h4 className="text-3xl font-black italic tracking-tighter text-red-500">TEAM RED</h4>
                  <p className="text-red-300 text-[10px] font-black uppercase tracking-widest mt-1">{currentMatchResult.teamB.length} ELITE PLAYERS</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] opacity-50 uppercase font-black tracking-widest">Balance Rating</p>
                  <p className="text-4xl font-black text-amber-500">{currentMatchResult.scoreB.toFixed(1)}</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {currentMatchResult.teamB.map((p, idx) => (
                  <div key={p.id} className="group flex flex-col p-5 bg-slate-50 rounded-[1.5rem] border-2 border-slate-100 hover:border-red-400 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleMovePlayer(p.id, 'B')} className="p-2 bg-white border border-slate-200 rounded-xl text-red-500 hover:bg-slate-900 hover:text-amber-500 transition-all shadow-sm group/move">
                          <ArrowLeft className="w-5 h-5 group-hover/move:-translate-x-1 transition-transform" />
                        </button>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-red-400 tracking-tighter uppercase">PLAYER {idx + 1}</span>
                           <span className="text-lg font-black text-slate-800">{p.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-amber-500/20 shadow-inner">
                         <Star className="w-3 h-3 text-amber-500 fill-current" />
                         <span className="text-xs font-black text-white">{p.skillScore.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {POSITIONS.map(pos => (
                        <button
                          key={pos}
                          onClick={() => handleUpdatePosition(p.id, 'B', pos)}
                          className={`flex-1 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase ${
                            p.preferredPosition === pos
                              ? (pos === 'GK' ? 'bg-amber-500 text-slate-900 shadow-lg ring-4 ring-amber-100' : 'bg-slate-900 text-white shadow-lg')
                              : 'bg-white text-slate-300 border border-slate-100 hover:border-slate-300 hover:text-slate-500'
                          }`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamGenerator;
