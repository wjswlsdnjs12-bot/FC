
import { AgeGroup, Position, Member } from './types';

export const AGE_GROUPS: AgeGroup[] = ['20s', '30s', '40s', '50s', '60s+'];
export const POSITIONS: Position[] = ['GK', 'DF', 'MF', 'FW'];
export const PITCHES: string[] = ['A구장 (메인)', 'B구장 (보조)', 'C구장 (풋살)'];

export const INITIAL_MEMBERS: Member[] = [
  { id: 'jjw', name: '전진원', ageGroup: '30s', skillScore: 3.0, preferredPosition: 'MF', totalAttendance: 0 },
  { id: 'hn', name: '한나', ageGroup: '20s', skillScore: 3.0, preferredPosition: 'FW', totalAttendance: 0 },
];
