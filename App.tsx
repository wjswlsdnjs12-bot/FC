
import React, { useState, useEffect } from 'react';
import { Member, AttendanceRecord, AgeGroup, Position } from './types';
import { INITIAL_MEMBERS } from './constants';
import AttendanceForm from './components/AttendanceForm';
import AdminDashboard from './components/AdminDashboard';
import TeamGenerator from './components/TeamGenerator';
import StatsBoard from './components/StatsBoard';
import { LayoutGrid, ClipboardCheck, Users, Trophy, Settings, ShieldCheck, Lock, Unlock, LogOut } from 'lucide-react';

type Tab = 'attendance' | 'admin' | 'teams' | 'stats';

export default function App() {
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('fc_dmc_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('fc_dmc_attendance');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<Tab>('attendance');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [pendingTab, setPendingTab] = useState<Tab | null>(null);

  useEffect(() => {
    localStorage.setItem('fc_dmc_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('fc_dmc_attendance', JSON.stringify(attendance));
  }, [attendance]);

  const handleTabChange = (tab: Tab) => {
    if ((tab === 'teams' || tab === 'admin') && !isAuthorized) {
      setPendingTab(tab);
      setShowPassModal(true);
    } else {
      setActiveTab(tab);
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '1234') {
      setIsAuthorized(true);
      setShowPassModal(false);
      if (pendingTab) setActiveTab(pendingTab);
      setPasswordInput('');
      setPendingTab(null);
    } else {
      alert('비밀번호가 틀렸습니다.');
      setPasswordInput('');
    }
  };

  const handleLock = () => {
    setIsAuthorized(false);
    if (activeTab === 'teams' || activeTab === 'admin') {
      setActiveTab('attendance');
    }
  };

  const handleRegisterAttendance = (name: string, ageGroup: AgeGroup, position: Position, date: string, pitch: string) => {
    let member = members.find(m => m.name === name);
    
    if (!member) {
      const newMember: Member = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        ageGroup,
        skillScore: 2.5,
        preferredPosition: position,
        totalAttendance: 1
      };
      setMembers(prev => [...prev, newMember]);
      member = newMember;
    } else {
      setMembers(prev => prev.map(m => 
        m.id === member?.id ? { ...m, totalAttendance: m.totalAttendance + 1 } : m
      ));
    }

    const newRecord: AttendanceRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date,
      pitch,
      memberId: member.id,
      timestamp: Date.now()
    };
    setAttendance(prev => [...prev, newRecord]);
    alert(`${name}님 ${pitch} 출석 체크 완료!`);
  };

  const updateSkill = (memberId: string, score: number) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, skillScore: score } : m));
  };

  const updatePosition = (memberId: string, position: Position) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, preferredPosition: position } : m));
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-0 lg:pl-64 flex flex-col bg-slate-50 transition-colors duration-500">
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 luxury-gradient text-white flex-col p-6 shadow-2xl z-20">
        <div className="flex flex-col gap-1 mb-10 px-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/80">Premium Manager</span>
          </div>
          <h1 className="text-xl font-black tracking-tighter">
            FC상암 <span className="gold-text">DMC</span>
          </h1>
        </div>
        
        <nav className="flex flex-col gap-1.5">
          <NavItem active={activeTab === 'attendance'} onClick={() => handleTabChange('attendance')} icon={<ClipboardCheck />} label="출석 체크" />
          <NavItem active={activeTab === 'teams'} onClick={() => handleTabChange('teams')} icon={<LayoutGrid />} label="팀 매칭 & 로테이션" protected={!isAuthorized} />
          <NavItem active={activeTab === 'stats'} onClick={() => handleTabChange('stats')} icon={<Users />} label="출석 통계" />
          <div className="h-px bg-slate-800 my-4 mx-2" />
          <NavItem active={activeTab === 'admin'} onClick={() => handleTabChange('admin')} icon={<Settings />} label="관리자 설정" protected={!isAuthorized} />
        </nav>
        
        <div className="mt-auto flex flex-col gap-6">
          {isAuthorized && (
            <button 
              onClick={handleLock}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest"
            >
              <LogOut size={16} />
              Session Logout
            </button>
          )}
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2">
            Established 2024<br/>Elite Performance
          </div>
        </div>
      </aside>

      <header className="lg:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h1 className="font-black tracking-tight">FC상암 <span className="text-amber-500">DMC</span></h1>
        </div>
        {isAuthorized && (
          <button onClick={handleLock} className="text-red-400 p-2">
            <LogOut size={18} />
          </button>
        )}
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        <div className="mb-8">
          {activeTab === 'attendance' && (
            <AttendanceForm onRegister={handleRegisterAttendance} />
          )}
          {activeTab === 'teams' && isAuthorized && (
            <TeamGenerator members={members} attendance={attendance} />
          )}
          {activeTab === 'stats' && (
            <StatsBoard members={members} />
          )}
          {activeTab === 'admin' && isAuthorized && (
            <AdminDashboard 
              members={members} 
              attendance={attendance}
              onUpdateSkill={updateSkill} 
              onUpdatePosition={updatePosition}
            />
          )}
        </div>
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 z-30 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <MobileNavItem active={activeTab === 'attendance'} onClick={() => handleTabChange('attendance')} icon={<ClipboardCheck />} label="출석" />
        <MobileNavItem active={activeTab === 'teams'} onClick={() => handleTabChange('teams')} icon={<LayoutGrid />} label="팀짜기" />
        <MobileNavItem active={activeTab === 'stats'} onClick={() => handleTabChange('stats')} icon={<Users />} label="기록" />
        <MobileNavItem active={activeTab === 'admin'} onClick={() => handleTabChange('admin')} icon={<Settings />} label="관리" />
      </nav>

      {/* Password Modal */}
      {showPassModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-amber-500/20 w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-amber-500/5">
                <Lock className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-2xl font-black text-white italic tracking-tighter mb-2 uppercase">Access Restricted</h3>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-8">DMC 매니저 비밀번호를 입력하세요</p>
              
              <form onSubmit={handleAuth} className="space-y-4">
                <input 
                  type="password"
                  autoFocus
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-slate-800 border border-slate-700 text-white text-center text-3xl font-black tracking-[0.5em] p-5 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-slate-700 shadow-inner"
                />
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => {setShowPassModal(false); setPendingTab(null);}}
                    className="py-4 bg-slate-800 text-slate-400 font-black rounded-2xl hover:bg-slate-700 transition-colors uppercase text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="py-4 bg-amber-500 text-slate-950 font-black rounded-2xl hover:bg-amber-400 transition-colors uppercase text-xs shadow-lg shadow-amber-500/20"
                  >
                    Unlock
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ active, onClick, icon, label, protected: isProtected }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, protected?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-300 ${
        active 
          ? 'bg-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.3)] font-black' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
      }`}
    >
      <div className="flex items-center gap-3">
        {React.cloneElement(icon as React.ReactElement, { size: 18 })}
        <span className="text-sm">{label}</span>
      </div>
      {isProtected && <Lock size={12} className="opacity-40" />}
    </button>
  );
}

function MobileNavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all duration-300 ${
        active ? 'text-amber-600' : 'text-slate-400'
      }`}
    >
      {React.cloneElement(icon as React.ReactElement, { size: 22 })}
      <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
    </button>
  );
}
