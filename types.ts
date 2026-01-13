
export type Position = 'GK' | 'DF' | 'MF' | 'FW';
export type AgeGroup = '20s' | '30s' | '40s' | '50s' | '60s+';

export interface Member {
  id: string;
  name: string;
  ageGroup: AgeGroup;
  skillScore: number; // 0.0 to 5.0
  preferredPosition: Position;
  totalAttendance: number;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  pitch: string; // Stadium name
  memberId: string;
  timestamp: number; // For attendance order
}

export interface TeamResult {
  teamA: Member[];
  teamB: Member[];
  scoreA: number;
  scoreB: number;
}
