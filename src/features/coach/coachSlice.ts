import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { CareerRecord, PracticeFocus, Recruit, RecruitingPitch, SeasonHistoryEntry, SignedRecruit, Tactics, Team } from '../../types/sim';

import { generateRecruitPool, generateSuitors, getTeamPitchGrade } from '../../sim/recruiting';
import { simulateRecruitingWeek } from '../../sim/recruitingWeek';
import { resolveSigningDay } from '../../sim/offseason';
import { advanceFatigue } from '../../sim/coachEffects';
import { RootState } from '../../store/store';

export const WEEKLY_HOURS_CAP = 120;
export const MAX_HOURS_PER_RECRUIT = 20;

export interface CoachProfile {
  name: string;
  almaMater: string;
  archetype: 'RECRUITER' | 'TACTICIAN' | 'DEVELOPER';
  age: number;
  skill: number;
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
  activePitchesByRecruitId: Record<string, RecruitingPitch>;
  scholarshipsAvailable: number;
  signedRecruitsByYear: Record<number, SignedRecruit[]>;
  practiceFocus: PracticeFocus;
  teamFatigue: number;
  // Career progression
  jobSecurity: number;
  seasonHistory: SeasonHistoryEntry[];
  careerRecord: CareerRecord;
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
  activePitchesByRecruitId: {},
  scholarshipsAvailable: 12,
  signedRecruitsByYear: {},
  practiceFocus: 'CONDITIONING',
  teamFatigue: 20,
  // Career progression
  jobSecurity: 60,
  seasonHistory: [],
  careerRecord: {
    totalWins: 0,
    totalLosses: 0,
    playoffAppearances: 0,
    championships: 0,
    seasonsCompleted: 0,
  },
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
        // Set job security baseline from expectations
        state.jobSecurity = action.payload.programExpectations.securityBaseline;
    },
    initializeRecruitingBoard: (state, action: PayloadAction<{ seed: number; teams: Team[] }>) => {
        state.recruitingSeed = action.payload.seed;
        const pool = generateRecruitPool(action.payload.seed);

        // Initialize suitors for each recruit
        pool.forEach(recruit => {
            recruit.interestByTeamId = generateSuitors(recruit, action.payload.teams, action.payload.seed);
        });

        state.recruitPool = pool;
        state.boardRecruitIds = [];
        state.weeklyHoursByRecruitId = {};
        state.activePitchesByRecruitId = {};
        state.recruitingWeekIndex = 0;
        state.scholarshipsAvailable = 12;
    },
    addRecruitToBoard: (state, action: PayloadAction<{ recruitId: string; startingInterest: number }>) => {
        if (!state.boardRecruitIds.includes(action.payload.recruitId) && state.boardRecruitIds.length < 25) {
            state.boardRecruitIds.push(action.payload.recruitId);
            state.weeklyHoursByRecruitId[action.payload.recruitId] = 0;

            // Set starting interest if not already tracked
            const recruit = state.recruitPool.find(r => r.id === action.payload.recruitId);
            if (recruit && state.selectedTeamId) {
                 if ((recruit.interestByTeamId[state.selectedTeamId] || 0) < action.payload.startingInterest) {
                     recruit.interestByTeamId[state.selectedTeamId] = action.payload.startingInterest;
                 }
            }
        }
    },
    removeRecruitFromBoard: (state, action: PayloadAction<string>) => {
        state.boardRecruitIds = state.boardRecruitIds.filter(id => id !== action.payload);
        delete state.weeklyHoursByRecruitId[action.payload];
        delete state.activePitchesByRecruitId[action.payload];
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
    setRecruitPitch: (state, action: PayloadAction<{ recruitId: string; pitch: RecruitingPitch }>) => {
        state.activePitchesByRecruitId[action.payload.recruitId] = action.payload.pitch;
    },
    setPracticeFocus: (state, action: PayloadAction<PracticeFocus>) => {
        state.practiceFocus = action.payload;
    },
    advanceCoachWeek: (state) => {
        state.teamFatigue = advanceFatigue(state.teamFatigue, state.practiceFocus, state.profile?.archetype ?? 'RECRUITER');
    },
    updateJobSecurity: (state, action: PayloadAction<number>) => {
        state.jobSecurity = Math.max(0, Math.min(100, action.payload));
    },
    recordSeasonEnd: (state, action: PayloadAction<SeasonHistoryEntry>) => {
        state.seasonHistory.push(action.payload);
        state.careerRecord.seasonsCompleted += 1;
        state.careerRecord.totalWins += action.payload.wins;
        state.careerRecord.totalLosses += action.payload.losses;
        if (action.payload.madePlayoffs) state.careerRecord.playoffAppearances += 1;
        if (action.payload.champion) state.careerRecord.championships += 1;
    },
    resetRecruitingForNewSeason: (state) => {
        state.recruitPool = [];
        state.boardRecruitIds = [];
        state.weeklyHoursByRecruitId = {};
        state.activePitchesByRecruitId = {};
        state.recruitingWeekIndex = 0;
        state.scholarshipsAvailable = 12;
        state.teamFatigue = 20;
    },
    applyRecruitingUpdates: (state, action: PayloadAction<{
        interestUpdates: Record<string, Record<string, number>>; // recruitId -> teamId -> interest
        commitments: { recruitId: string; teamId: string }[];
    }>) => {
        state.recruitingWeekIndex += 1;

        // Apply interest updates
        Object.entries(action.payload.interestUpdates).forEach(([recruitId, interestMap]) => {
            const recruit = state.recruitPool.find(r => r.id === recruitId);
            if (recruit) {
                recruit.interestByTeamId = interestMap;
            }
        });

        // Apply commitments
        action.payload.commitments.forEach(({ recruitId, teamId }) => {
            const recruit = state.recruitPool.find(r => r.id === recruitId);
            if (recruit) {
                recruit.committedTeamId = teamId;
            }
        });
    },
    finalizeSigningClass: (state, action: PayloadAction<{ seasonYear: number; signedRecruits: SignedRecruit[] }>) => {
        const { seasonYear, signedRecruits } = action.payload;
        state.signedRecruitsByYear[seasonYear] = signedRecruits;
        state.scholarshipsAvailable = Math.max(0, state.scholarshipsAvailable - signedRecruits.length);
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
    setRecruitPitch,
    setPracticeFocus,
    advanceCoachWeek,
    applyRecruitingUpdates,
    finalizeSigningClass,
    updateJobSecurity,
    recordSeasonEnd,
    resetRecruitingForNewSeason,
} = coachSlice.actions;


export const advanceRecruitingWeek = createAsyncThunk(
    'coach/advanceRecruitingWeek',
    async (_, { getState, dispatch }) => {
        const state = getState() as RootState;
        const coach = state.coach;
        const teams = state.league.teams;

        const selectedTeam = teams.find(t => t.id === coach.selectedTeamId);
        if (!selectedTeam) return;

        // Generate grades
        const pitchGradesByRecruitId: Record<string, string> = {};
        const dealbreakerViolationsByRecruitId: Record<string, boolean> = {};

        coach.boardRecruitIds.forEach(recruitId => {
             const recruit = coach.recruitPool.find(r => r.id === recruitId);
             if (!recruit) return;

             const activePitch = coach.activePitchesByRecruitId[recruitId];
             if (activePitch) {
                 pitchGradesByRecruitId[recruitId] = getTeamPitchGrade(selectedTeam, activePitch, recruit);
             }

             // Check dealbreaker
             if (recruit.dealbreaker) {
                 const grade = getTeamPitchGrade(selectedTeam, recruit.dealbreaker, recruit);
                 // If grade is D or F, it's a violation
                 if (grade === 'D' || grade === 'F') {
                     dealbreakerViolationsByRecruitId[recruitId] = true;
                 }
             }
        });

        // Derive archetype bonus: RECRUITER +15%, DEVELOPER -5%, TACTICIAN neutral
        const archetypeBonus =
            coach.profile?.archetype === 'RECRUITER' ? 1.15
            : coach.profile?.archetype === 'DEVELOPER' ? 0.95
            : 1.0;
        const coachSkill = coach.profile?.skill ?? 72;

        const result = simulateRecruitingWeek(
            coach.recruitPool,
            coach.boardRecruitIds,
            coach.weeklyHoursByRecruitId,
            coach.activePitchesByRecruitId,
            pitchGradesByRecruitId,
            dealbreakerViolationsByRecruitId,
            coach.selectedTeamId,
            coach.recruitingSeed,
            coach.recruitingWeekIndex,
            archetypeBonus,
            coachSkill
        );

        const commitments: { recruitId: string; teamId: string }[] = [];

        Object.entries(result.committedTeamByRecruitId).forEach(([recruitId, teamId]) => {
            if (teamId) {
                commitments.push({ recruitId, teamId });
            }
        });

        dispatch(applyRecruitingUpdates({
            interestUpdates: result.interestByRecruitId,
            commitments
        }));
    }
);

export const processSigningDay = createAsyncThunk(
    'coach/processSigningDay',
    async (_, { getState, dispatch }) => {
        const state = getState() as RootState;
        const coach = state.coach;

        if (!coach.selectedTeamId || state.season.phase !== 'OFFSEASON') {
            return;
        }

        const alreadySigned = coach.signedRecruitsByYear[state.season.year] ?? [];
        if (alreadySigned.length > 0) {
            return;
        }

        const committedToUser = coach.recruitPool.filter(
            (recruit) => recruit.committedTeamId === coach.selectedTeamId,
        );

        const signingOutcome = resolveSigningDay(committedToUser, coach.scholarshipsAvailable);
        const signedRecruits = signingOutcome.signedRecruitIds
            .map((recruitId) => coach.recruitPool.find((recruit) => recruit.id === recruitId))
            .filter((recruit): recruit is Recruit => Boolean(recruit))
            .map((recruit) => ({
                recruitId: recruit.id,
                signedAtYear: state.season.year,
                stars: recruit.stars,
                position: recruit.position,
            }));

        dispatch(finalizeSigningClass({
            seasonYear: state.season.year,
            signedRecruits,
        }));
    }
);

export const coachReducer = coachSlice.reducer;
