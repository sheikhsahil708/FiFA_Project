'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, HelpCircle, Check, RotateCcw } from 'lucide-react';
import { getMatches } from '@/services/matches';
import { Match } from '@/services/api';
import { getTeamFlagUrl } from '@/utils/flags';
import { MatchCardSkeleton } from '@/components/LoadingSkeleton';

// Downstream mapping details
const DOWNSTREAM_MAPPING: Record<string, { targetId: string; slot: 'home' | 'away' }> = {
  // R32 -> R16
  "74": { targetId: "89", slot: "home" },
  "77": { targetId: "89", slot: "away" },
  "73": { targetId: "90", slot: "home" },
  "75": { targetId: "90", slot: "away" },
  "76": { targetId: "91", slot: "home" },
  "78": { targetId: "91", slot: "away" },
  "79": { targetId: "92", slot: "home" },
  "80": { targetId: "92", slot: "away" },
  "83": { targetId: "93", slot: "home" },
  "84": { targetId: "93", slot: "away" },
  "81": { targetId: "94", slot: "home" },
  "82": { targetId: "94", slot: "away" },
  "86": { targetId: "95", slot: "home" },
  "88": { targetId: "95", slot: "away" },
  "85": { targetId: "96", slot: "home" },
  "87": { targetId: "96", slot: "away" },

  // R16 -> QF
  "89": { targetId: "97", slot: "home" },
  "90": { targetId: "97", slot: "away" },
  "93": { targetId: "98", slot: "home" },
  "94": { targetId: "98", slot: "away" },
  "91": { targetId: "99", slot: "home" },
  "92": { targetId: "99", slot: "away" },
  "95": { targetId: "100", slot: "home" },
  "96": { targetId: "100", slot: "away" },

  // QF -> SF
  "97": { targetId: "101", slot: "home" },
  "98": { targetId: "101", slot: "away" },
  "99": { targetId: "102", slot: "home" },
  "100": { targetId: "102", slot: "away" },

  // SF -> Final
  "101": { targetId: "104", slot: "home" },
  "102": { targetId: "104", slot: "away" }
};

interface TeamState {
  id: string;
  name: string;
  flag: string;
}

interface Prediction {
  winner: TeamState;
  loser: TeamState;
}

export default function BracketPage() {
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});

  const { data: matches = [], isLoading } = useQuery<Match[]>({
    queryKey: ['matches'],
    queryFn: getMatches,
  });

  const getMatch = (id: string): Match | undefined => {
    return matches.find(m => m.id === id);
  };

  const getFlagUrl = (teamName: string) => {
    return getTeamFlagUrl(teamName);
  };

  // Traverses downstream to clear obsolete predictions
  const clearDownstream = (matchId: string, currentPredictions: Record<string, Prediction>) => {
    const map = DOWNSTREAM_MAPPING[matchId];
    if (!map) return;
    
    if (currentPredictions[map.targetId]) {
      delete currentPredictions[map.targetId];
      clearDownstream(map.targetId, currentPredictions);
    }
  };

  // Select predicted winner of a match
  const handleSelectWinner = (matchId: string, winner: TeamState, loser: TeamState) => {
    const match = getMatch(matchId);
    if (!match || match.finished) return; // Cannot predict finished matches

    const nextPredictions = { ...predictions };
    nextPredictions[matchId] = { winner, loser };

    // Clear downstream predictions that are now invalidated
    clearDownstream(matchId, nextPredictions);

    // Populate special cases: Losers from SF (101 & 102) go to 3rd Place Playoff (103)
    if (matchId === "101") {
      nextPredictions["103"] = {
        ...nextPredictions["103"],
        winner: {
          id: loser.id,
          name: loser.name,
          flag: loser.flag
        }
      };
    } else if (matchId === "102") {
      nextPredictions["103"] = {
        ...nextPredictions["103"],
        loser: {
          id: loser.id,
          name: loser.name,
          flag: loser.flag
        }
      };
    }

    setPredictions(nextPredictions);
  };

  // Get active name/flag for teams in the bracket card (API results override predictions)
  const getTeamDetails = (matchId: string, slot: 'home' | 'away'): TeamState => {
    const match = getMatch(matchId);
    if (!match) return { id: '0', name: 'TBD', flag: '' };

    // 1. Check if the match is decided in live API
    if (slot === 'home' && match.homeTeamId !== '0') {
      return { id: match.homeTeamId, name: match.homeTeamName, flag: getFlagUrl(match.homeTeamName) };
    }
    if (slot === 'away' && match.awayTeamId !== '0') {
      return { id: match.awayTeamId, name: match.awayTeamName, flag: getFlagUrl(match.awayTeamName) };
    }

    // 2. Check if a feeding match has a prediction (For 3rd Place Match 103)
    if (matchId === "103") {
      if (slot === 'home' && predictions["101"]) {
        return {
          id: predictions["101"].loser.id,
          name: predictions["101"].loser.name,
          flag: predictions["101"].loser.flag
        };
      }
      if (slot === 'away' && predictions["102"]) {
        return {
          id: predictions["102"].loser.id,
          name: predictions["102"].loser.name,
          flag: predictions["102"].loser.flag
        };
      }
    }

    // 3. Trace upstream feeding matches from bracket mapping
    const upstream = Object.keys(DOWNSTREAM_MAPPING).filter(
      key => DOWNSTREAM_MAPPING[key].targetId === matchId && DOWNSTREAM_MAPPING[key].slot === slot
    );

    if (upstream.length > 0) {
      const feedingId = upstream[0];
      const feedingMatch = getMatch(feedingId);

      // If the feeding match is finished in live API, its actual winner advances
      if (feedingMatch && feedingMatch.finished) {
        const winnerHome = feedingMatch.homeScore! > feedingMatch.awayScore!;
        const wId = winnerHome ? feedingMatch.homeTeamId : feedingMatch.awayTeamId;
        const wName = winnerHome ? feedingMatch.homeTeamName : feedingMatch.awayTeamName;
        return { id: wId, name: wName, flag: getFlagUrl(wName) };
      }

      // Check client prediction
      if (predictions[feedingId]) {
        return {
          id: predictions[feedingId].winner.id,
          name: predictions[feedingId].winner.name,
          flag: predictions[feedingId].winner.flag
        };
      }
    }

    // Fallback: Label Placeholder (e.g. "Winner Match 74")
    const label = slot === 'home' ? match.homeTeamLabel : match.awayTeamLabel;
    return { id: '0', name: label || 'TBD', flag: '' };
  };

  const handleReset = () => {
    setPredictions({});
  };

  const renderBracketCard = (matchId: string) => {
    const match = getMatch(matchId);
    if (!match) return null;

    const homeTeam = getTeamDetails(matchId, 'home');
    const awayTeam = getTeamDetails(matchId, 'away');

    const prediction = predictions[matchId];
    const predictedWinnerId = prediction?.winner?.id;

    // Check if match is finished in actual API
    const isFinished = match.finished;
    const actualWinnerId = isFinished 
      ? (match.homeScore! > match.awayScore! ? match.homeTeamId : match.awayTeamId)
      : null;

    const isLive = match.status === 'Live';

    return (
      <div
        key={match.id}
        className="w-56 rounded-xl border border-white/5 p-3.5 text-xs bg-slate-900/40 backdrop-blur-md relative hover:border-brand-blue/30 transition-all flex flex-col gap-1.5"
      >
        <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono">
          <span>Match #{match.id}</span>
          {isLive ? (
            <span className="text-brand-crimson font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
              <span className="w-1 h-1 bg-brand-crimson rounded-full"></span> Live
            </span>
          ) : isFinished ? (
            <span className="text-emerald-400 font-bold uppercase tracking-wider">FT</span>
          ) : (
            <span>Predictor</span>
          )}
        </div>

        {/* Home Row */}
        <div 
          onClick={() => {
            if (homeTeam.id !== '0' && awayTeam.id !== '0' && !isFinished) {
              handleSelectWinner(matchId, homeTeam, awayTeam);
            }
          }}
          className={`flex justify-between items-center py-1.5 px-2 rounded-lg transition-all ${
            homeTeam.id !== '0' && awayTeam.id !== '0' && !isFinished ? 'cursor-pointer hover:bg-white/5' : ''
          } ${
            isFinished
              ? (actualWinnerId === homeTeam.id ? 'bg-emerald-500/10 border border-emerald-500/20 text-white' : 'text-gray-500 opacity-60')
              : (predictedWinnerId === homeTeam.id ? 'bg-brand-blue/10 border border-brand-blue/20 text-brand-blue' : 'text-gray-200')
          }`}
        >
          <div className="flex items-center gap-2 truncate max-w-[130px]">
            {homeTeam.flag ? (
              <img src={homeTeam.flag} alt="" className="w-4 h-3 object-cover rounded shrink-0" />
            ) : (
              <div className="w-4 h-3 bg-white/5 rounded shrink-0 border border-white/10 flex items-center justify-center text-[7px] text-gray-600">?</div>
            )}
            <span className="truncate font-semibold">{homeTeam.name}</span>
          </div>
          <span className="font-mono font-bold">
            {isFinished || isLive ? match.homeScore : predictedWinnerId === homeTeam.id ? <Check className="h-3 w-3" /> : ''}
          </span>
        </div>

        {/* Away Row */}
        <div 
          onClick={() => {
            if (homeTeam.id !== '0' && awayTeam.id !== '0' && !isFinished) {
              handleSelectWinner(matchId, awayTeam, homeTeam);
            }
          }}
          className={`flex justify-between items-center py-1.5 px-2 rounded-lg transition-all ${
            homeTeam.id !== '0' && awayTeam.id !== '0' && !isFinished ? 'cursor-pointer hover:bg-white/5' : ''
          } ${
            isFinished
              ? (actualWinnerId === awayTeam.id ? 'bg-emerald-500/10 border border-emerald-500/20 text-white' : 'text-gray-500 opacity-60')
              : (predictedWinnerId === awayTeam.id ? 'bg-brand-blue/10 border border-brand-blue/20 text-brand-blue' : 'text-gray-200')
          }`}
        >
          <div className="flex items-center gap-2 truncate max-w-[130px]">
            {awayTeam.flag ? (
              <img src={awayTeam.flag} alt="" className="w-4 h-3 object-cover rounded shrink-0" />
            ) : (
              <div className="w-4 h-3 bg-white/5 rounded shrink-0 border border-white/10 flex items-center justify-center text-[7px] text-gray-600">?</div>
            )}
            <span className="truncate font-semibold">{awayTeam.name}</span>
          </div>
          <span className="font-mono font-bold">
            {isFinished || isLive ? match.awayScore : predictedWinnerId === awayTeam.id ? <Check className="h-3 w-3" /> : ''}
          </span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Knockout Stage</h2>
          <p className="text-gray-400 text-xs mt-1">Generating bracket tree...</p>
        </div>
        <div className="h-64 bg-white/10 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  // Knockout column groupings (Left side tree, Center finals, Right side tree)
  const leftR32 = ["73", "75", "74", "77", "81", "82", "83", "84"];
  const leftR16 = ["90", "89", "94", "93"];
  const leftQF = ["97", "98"];
  const leftSF = ["101"];

  const rightR32 = ["76", "78", "79", "80", "85", "87", "86", "88"];
  const rightR16 = ["91", "92", "96", "95"];
  const rightQF = ["99", "100"];
  const rightSF = ["102"];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Interactive Predictor</h2>
          <p className="text-gray-400 text-xs mt-1">Click qualified teams to predict bracket winners and simulate outcomes</p>
        </div>

        <div className="flex items-center gap-3">
          {Object.keys(predictions).length > 0 && (
            <button
              onClick={handleReset}
              className="rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white py-1.5 px-3 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Bracket
            </button>
          )}

          <div className="text-[11px] text-gray-500 flex items-center gap-1.5 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full">
            <HelpCircle className="h-3.5 w-3.5 text-brand-blue" />
            <span>Click a team to advance them</span>
          </div>
        </div>
      </div>

      {/* Mobile Swipe Helper */}
      <div className="lg:hidden bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-center text-xs text-brand-blue/90 font-medium flex items-center justify-center gap-2">
        <span>← Swipe horizontally to explore the full bracket →</span>
      </div>

      {/* Bracket Tree scroll container */}
      <div className="w-full overflow-x-auto pb-6 pt-2">
        <div className="min-w-[1250px] flex items-center justify-center gap-4 py-8">
          
          {/* 1. Left Bracket: R32 */}
          <div className="flex flex-col justify-around h-[880px]">
            {leftR32.map(id => renderBracketCard(id))}
          </div>

          {/* 2. Left Bracket: R16 */}
          <div className="flex flex-col justify-around h-[880px] py-4">
            {leftR16.map(id => renderBracketCard(id))}
          </div>

          {/* 3. Left Bracket: QF */}
          <div className="flex flex-col justify-around h-[880px] py-16">
            {leftQF.map(id => renderBracketCard(id))}
          </div>

          {/* 4. Left Bracket: SF */}
          <div className="flex flex-col justify-around h-[880px] py-32">
            {leftSF.map(id => renderBracketCard(id))}
          </div>

          {/* 5. Center: Finals */}
          <div className="flex flex-col justify-center gap-12 h-[880px] items-center px-4">
            <div className="text-center space-y-1 mb-2">
              <Trophy className="h-10 w-10 text-brand-blue mx-auto glow-text animate-pulse" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-sans">Champion</span>
            </div>

            {/* Grand Final */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-[9px] uppercase tracking-wider text-brand-blue font-bold px-2 py-0.5 bg-brand-blue/10 border border-brand-blue/20 rounded-full mb-1">
                Grand Final
              </span>
              {renderBracketCard("104")}
            </div>

            {/* 3rd Place Playoff */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold px-2 py-0.5 bg-white/5 border border-white/10 rounded-full mb-1">
                3rd Place Playoff
              </span>
              {renderBracketCard("103")}
            </div>
          </div>

          {/* 6. Right Bracket: SF */}
          <div className="flex flex-col justify-around h-[880px] py-32">
            {rightSF.map(id => renderBracketCard(id))}
          </div>

          {/* 7. Right Bracket: QF */}
          <div className="flex flex-col justify-around h-[880px] py-16">
            {rightQF.map(id => renderBracketCard(id))}
          </div>

          {/* 8. Right Bracket: R16 */}
          <div className="flex flex-col justify-around h-[880px] py-4">
            {rightR16.map(id => renderBracketCard(id))}
          </div>

          {/* 9. Right Bracket: R32 */}
          <div className="flex flex-col justify-around h-[880px]">
            {rightR32.map(id => renderBracketCard(id))}
          </div>

        </div>
      </div>
    </div>
  );
}
