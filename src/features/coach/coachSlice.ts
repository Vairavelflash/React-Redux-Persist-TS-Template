import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { generateRecruitPool } from '../../sim/recruiting';
import { simulateRecruitingWeek } from '../../sim/recruitingWeek';
import { Recruit, Tactics } from '../../types/sim';

export type CoachArchetype = 'RECRUITER' | 'TACTICIAN' | 'DEVELOPER';
export type CareerOnboardingStep = 'PROFILE' | 'TEAM_SELECT' | 'READY';

export interface CoachProfile {
  name: string;
  almaMater: string;
  archetype: CoachArchetype;
}

export interface CoachState {
  selectedTeamId: string | null;
  profile: CoachProfile | null;
  onboardingStep: CareerOnboardingStep;
  careerStartedAtSeason: number | null;
  programExpectations: {
    winTarget: number;
    rankTarget: number;
    securityBaseline: number;
  } | null;
  careerTier: 'REBUILD' | 'STABLE' | 'CONTENDER' | null;
  tactics: Tactics;
  recruitingSeed: number;
  recruitingWeekIndex: number;
  recruitPool: Recruit[];
  boardRecruitIds: string[];
  weeklyHoursByRecruitId: Record<string, number>;
  interestByRecruitId: Record<string, number>;
}

const initialState: CoachState = {
  selectedTeamId: null,
  profile: null,
  onboardingStep: 'PROFILE',
  careerStartedAtSeason: null,
  programExpectations: null,
  careerTier: null,
  tactics: {
    tempo: 'normal',
    rideClear: 'balanced',
    slideAggression: 'normal',
  },
  recruitingSeed: 2026,
  recruitingWeekIndex: 0,
  recruitPool: [],
  boardRecruitIds: [],
  weeklyHoursByRecruitId: {},
  interestByRecruitId: {},
};

const coachSlice = createSlice({
  name: 'coach',
  initialState,
  reducers: {
    setSelectedTeam: (state, action: PayloadAction<string | null>) => {
      state.selectedTeamId = action.payload;
    },

    setCoachProfile: (state, action: PayloadAction<CoachProfile>) => {
      state.profile = action.payload;
      state.onboardingStep = 'TEAM_SELECT';
    },
    completeCareerSetup: (
      state,
      action: PayloadAction<{
        teamId: string;
        seasonYear?: number;
        programExpectations: { winTarget: number; rankTarget: number; securityBaseline: number };
        careerTier: 'REBUILD' | 'STABLE' | 'CONTENDER';
      }>,
    ) => {
      const changingTeam = state.selectedTeamId && state.selectedTeamId !== action.payload.teamId;

      state.selectedTeamId = action.payload.teamId;
      state.onboardingStep = 'READY';
      state.careerStartedAtSeason = action.payload.seasonYear ?? state.careerStartedAtSeason ?? 1;
      state.programExpectations = action.payload.programExpectations;
      state.careerTier = action.payload.careerTier;

      if (changingTeam) {
        state.recruitingWeekIndex = 0;
        state.recruitPool = [];
        state.boardRecruitIds = [];
        state.weeklyHoursByRecruitId = {};
        state.interestByRecruitId = {};
      }
    },
    resetCareerSetup: (state) => {
      state.selectedTeamId = null;
      state.profile = null;
      state.onboardingStep = 'PROFILE';
      state.careerStartedAtSeason = null;
      state.programExpectations = null;
      state.careerTier = null;
      state.recruitingWeekIndex = 0;
      state.recruitPool = [];
      state.boardRecruitIds = [];
      state.weeklyHoursByRecruitId = {};
      state.interestByRecruitId = {};
    },

    setTactics: (state, action: PayloadAction<Tactics>) => {
      state.tactics = action.payload;
    },
    initializeRecruitingBoard: (state, action: PayloadAction<{ seed: number }>) => {
      state.recruitingSeed = action.payload.seed;
      state.recruitPool = generateRecruitPool(action.payload.seed);
      state.recruitingWeekIndex = 0;
      state.boardRecruitIds = [];
      state.weeklyHoursByRecruitId = {};
      state.interestByRecruitId = {};
    },
    advanceRecruitingWeek: (state) => {
      if (!state.selectedTeamId || state.recruitPool.length === 0 || state.boardRecruitIds.length === 0) return;

      const result = simulateRecruitingWeek(
        state.recruitPool,
        state.boardRecruitIds,
        state.weeklyHoursByRecruitId,
        state.interestByRecruitId,
        state.selectedTeamId,
        state.recruitingSeed,
        state.recruitingWeekIndex,
      );

      state.interestByRecruitId = result.interestByRecruitId;
      state.recruitPool = state.recruitPool.map((recruit) => ({
        ...recruit,
        committedTeamId: result.committedTeamByRecruitId[recruit.id] ?? recruit.committedTeamId,
      }));
      state.recruitingWeekIndex += 1;
    },
    addRecruitToBoard: (state, action: PayloadAction<string>) => {
      if (state.boardRecruitIds.includes(action.payload)) return;
      if (state.boardRecruitIds.length >= 25) return;
      state.boardRecruitIds.push(action.payload);
      state.weeklyHoursByRecruitId[action.payload] = state.weeklyHoursByRecruitId[action.payload] ?? 10;
    },
    removeRecruitFromBoard: (state, action: PayloadAction<string>) => {
      state.boardRecruitIds = state.boardRecruitIds.filter((id) => id !== action.payload);
      delete state.weeklyHoursByRecruitId[action.payload];
    },
    setRecruitHours: (state, action: PayloadAction<{ recruitId: string; hours: number }>) => {
      const clamped = Math.max(0, Math.min(20, action.payload.hours));
      if (state.boardRecruitIds.includes(action.payload.recruitId)) {
        state.weeklyHoursByRecruitId[action.payload.recruitId] = clamped;
      }
    },
  },
});

export const {
  setSelectedTeam,
  setCoachProfile,
  completeCareerSetup,
  resetCareerSetup,
  setTactics,
  initializeRecruitingBoard,
  advanceRecruitingWeek,
  addRecruitToBoard,
  removeRecruitFromBoard,
  setRecruitHours,
} = coachSlice.actions;
export const coachReducer = coachSlice.reducer;
