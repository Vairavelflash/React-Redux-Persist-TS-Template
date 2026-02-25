import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Recruit, Tactics } from '../../types/sim';

import { generateRecruitPool } from '../../sim/recruiting';
import { RootState } from '../../store/store';

export const WEEKLY_HOURS_CAP = 120;
export const MAX_HOURS_PER_RECRUIT = 20;

export interface CoachProfile {
  name: string;
  almaMater: string;
  archetype: 'RECRUITER' | 'TACTICIAN' | 'DEVELOPER';
}

export interface ProgramExpectations {
  winTarget: number;
  rankTarget: number;
  securityBaseline: number;
}

export interface CoachState {
  selectedTeamId: string | null;
  tactics: Tactics;
  profile: CoachProfile | null;
  onboardingStep: 'PROFILE' | 'TEAM' | 'READY' | 'COMPLETE';
  careerTier: 'REBUILD' | 'STABLE' | 'CONTENDER' | null;
  programExpectations: ProgramExpectations | null;
  recruitPool: Recruit[];
  boardRecruitIds: string[];
  recruitingSeed: number;
  recruitingWeekIndex: number;
  weeklyHoursByRecruitId: Record<string, number>;
  interestByRecruitId: Record<string, number>;
}

const initialState: CoachState = {
  selectedTeamId: null,
  tactics: {
    tempo: 'normal',
    rideClear: 'balanced',
    slideAggression: 'normal',
  },
  profile: null,
  onboardingStep: 'PROFILE',
  careerTier: null,
  programExpectations: null,
  recruitPool: [],
  boardRecruitIds: [],
  recruitingSeed: 2026,
  recruitingWeekIndex: 0,
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
    setTactics: (state, action: PayloadAction<Tactics>) => {
      state.tactics = action.payload;
    },
    setCoachProfile: (state, action: PayloadAction<CoachProfile>) => {
        state.profile = action.payload;
        state.onboardingStep = 'TEAM';
    },
    completeCareerSetup: (state, action: PayloadAction<{
        teamId: string;
        seasonYear: number;
        careerTier: 'REBUILD' | 'STABLE' | 'CONTENDER';
        programExpectations: ProgramExpectations;
    }>) => {
        state.selectedTeamId = action.payload.teamId;
        state.careerTier = action.payload.careerTier;
        state.programExpectations = action.payload.programExpectations;
        state.onboardingStep = 'READY'; // Changed to READY as per component check
    },
    initializeRecruitingBoard: (state, action: PayloadAction<{ seed: number }>) => {
        state.recruitingSeed = action.payload.seed;
        state.recruitPool = generateRecruitPool(action.payload.seed);
        state.boardRecruitIds = [];
        state.weeklyHoursByRecruitId = {};
        state.interestByRecruitId = {};
        state.recruitingWeekIndex = 0;
    },
    addRecruitToBoard: (state, action: PayloadAction<string>) => {
        if (!state.boardRecruitIds.includes(action.payload) && state.boardRecruitIds.length < 25) {
            state.boardRecruitIds.push(action.payload);
            // Default 1 hour? Or 0
            state.weeklyHoursByRecruitId[action.payload] = 0;
        }
    },
    removeRecruitFromBoard: (state, action: PayloadAction<string>) => {
        state.boardRecruitIds = state.boardRecruitIds.filter(id => id !== action.payload);
        delete state.weeklyHoursByRecruitId[action.payload];
    },
    setRecruitHours: (state, action: PayloadAction<{ recruitId: string; hours: number }>) => {
        const { recruitId, hours } = action.payload;

        // Ensure recruit is on the board
        if (!state.boardRecruitIds.includes(recruitId)) {
            return;
        }

        const currentHours = state.weeklyHoursByRecruitId[recruitId] || 0;
        const totalHours = state.boardRecruitIds.reduce((sum, id) => sum + (state.weeklyHoursByRecruitId[id] || 0), 0);
        const hoursWithoutThisRecruit = totalHours - currentHours;

        let validatedHours = Math.max(0, Math.min(MAX_HOURS_PER_RECRUIT, hours));

        if (hoursWithoutThisRecruit + validatedHours > WEEKLY_HOURS_CAP) {
            validatedHours = Math.max(0, WEEKLY_HOURS_CAP - hoursWithoutThisRecruit);
        }

        state.weeklyHoursByRecruitId[recruitId] = validatedHours;
    },
    applyRecruitingUpdates: (state, action: PayloadAction<{
        interestUpdates: Record<string, number>;
        commitments: { recruitId: string; teamId: string }[];
    }>) => {
        state.recruitingWeekIndex += 1;

        // Apply interest updates
        Object.entries(action.payload.interestUpdates).forEach(([recruitId, interest]) => {
            state.interestByRecruitId[recruitId] = interest;
        });

        // Apply commitments
        action.payload.commitments.forEach(({ recruitId, teamId }) => {
            const recruit = state.recruitPool.find(r => r.id === recruitId);
            if (recruit) {
                recruit.committedTeamId = teamId;
            }
        });
    }
  },
});

export const {
    setSelectedTeam,
    setTactics,
    setCoachProfile,
    completeCareerSetup,
    initializeRecruitingBoard,
    addRecruitToBoard,
    removeRecruitFromBoard,
    setRecruitHours,
    applyRecruitingUpdates
} = coachSlice.actions;


export const advanceRecruitingWeek = createAsyncThunk(
    'coach/advanceRecruitingWeek',
    async (_, { getState, dispatch }) => {
        const state = getState() as RootState;
        const coach = state.coach;
        const interestUpdates: Record<string, number> = {};
        const commitments: { recruitId: string; teamId: string }[] = [];

        coach.boardRecruitIds.forEach(recruitId => {
            const hours = coach.weeklyHoursByRecruitId[recruitId] || 0;
            const currentInterest = coach.interestByRecruitId[recruitId] || 0;
            // Simple formula: 1 hour = 2 interest points + bonus
            const gain = hours * 2 + (Math.random() * 5); // Random logic in thunk is OK
            const newInterest = Math.min(100, Math.round(currentInterest + gain));
            interestUpdates[recruitId] = newInterest;

            if (newInterest >= 100 && coach.selectedTeamId) {
                 const recruit = coach.recruitPool.find(r => r.id === recruitId);
                 if (recruit && !recruit.committedTeamId) {
                     commitments.push({ recruitId, teamId: coach.selectedTeamId });
                 }
            }
        });

        coach.recruitPool.forEach(recruit => {
            if (!recruit.committedTeamId && !commitments.find(c => c.recruitId === recruit.id)) {
                 if (Math.random() < 0.05) {
                     // Assume committed to CPU for now
                     commitments.push({ recruitId: recruit.id, teamId: 'CPU' });
                 }
            }
        });

        dispatch(applyRecruitingUpdates({ interestUpdates, commitments }));
    }
);

export const coachReducer = coachSlice.reducer;
