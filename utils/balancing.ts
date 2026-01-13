
import { Member, TeamResult } from '../types';

/**
 * Balances teams based on skill score and position (GKs first).
 */
export const balanceTeams = (players: Member[]): TeamResult => {
  // 1. Separate Goalkeepers
  const gks = players.filter(p => p.preferredPosition === 'GK').sort((a, b) => b.skillScore - a.skillScore);
  const others = players.filter(p => p.preferredPosition !== 'GK').sort((a, b) => b.skillScore - a.skillScore);

  const teamA: Member[] = [];
  const teamB: Member[] = [];
  
  let scoreA = 0;
  let scoreB = 0;

  // 2. Distribute GKs first to ensure each team has a keeper if possible
  gks.forEach(gk => {
    if (scoreA <= scoreB && teamA.length <= teamB.length) {
      teamA.push(gk);
      scoreA += gk.skillScore;
    } else {
      teamB.push(gk);
      scoreB += gk.skillScore;
    }
  });

  // 3. Greedy distribution for others
  others.forEach(player => {
    // Decision logic:
    // If scores are equal, assign to team with fewer players.
    // Otherwise, assign to the team with the lower total score.
    if (scoreA < scoreB) {
      teamA.push(player);
      scoreA += player.skillScore;
    } else if (scoreB < scoreA) {
      teamB.push(player);
      scoreB += player.skillScore;
    } else {
      // Scores are tied
      if (teamA.length <= teamB.length) {
        teamA.push(player);
        scoreA += player.skillScore;
      } else {
        teamB.push(player);
        scoreB += player.skillScore;
      }
    }
  });

  return { teamA, teamB, scoreA, scoreB };
};
