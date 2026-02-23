import { createSelector, createSlice } from '@reduxjs/toolkit';
import teamsData from '../../data/teams128.json';
import { Conference, LeagueData, Team } from '../../types/sim';
import { RootState } from '../../store/store';
import { generateRoster } from '../../sim/generateRoster';

interface LeagueState extends LeagueData {}

const initialState: LeagueState = {
  conferences: teamsData.conferences as Conference[],
  teams: teamsData.teams as Team[],
};

const leagueSlice = createSlice({
  name: 'league',
  initialState,
  reducers: {},
});

export const leagueReducer = leagueSlice.reducer;

export const selectConferences = (state: RootState) => state.league.conferences;
export const selectTeams = (state: RootState) => state.league.teams;

export const selectTeamsByConference = createSelector([selectConferences, selectTeams], (conferences, teams) =>
  conferences.map((conference) => ({
    conference,
    teams: teams.filter((team) => team.conferenceId === conference.id),
  })),
);

export const selectTeamById = (state: RootState, teamId: string) => state.league.teams.find((team) => team.id === teamId);

export const selectConferenceById = (state: RootState, conferenceId: string) =>
  state.league.conferences.find((conference) => conference.id === conferenceId);

export const selectTeamWithRosterSummary = createSelector(
  [selectTeamById, (_state: RootState, teamId: string) => teamId],
  (team, teamId) => {
    if (!team) return null;

    const roster = generateRoster(team, 'league-roster-v1');
    const overall = Math.round(roster.reduce((sum, player) => sum + player.overall, 0) / roster.length);
    const topPlayers = [...roster].sort((a, b) => b.overall - a.overall).slice(0, 5);

    return {
      teamId,
      team,
      rosterSize: roster.length,
      rosterOverall: overall,
      topPlayers,
    };
  },
);
