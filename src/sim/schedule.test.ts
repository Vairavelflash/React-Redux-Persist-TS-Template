// @ts-nocheck
import { describe, test } from 'node:test';
import assert from 'node:assert';
import { validateSchedule } from './schedule.ts';
import type { Team, ScheduledGame } from '../types/sim.ts';

function createValidData(): { teams: Team[], schedule: ScheduledGame[][] } {
    const teams: Team[] = [];
    for (let i = 0; i < 128; i++) {
        teams.push({ id: `t${i}`, schoolName: `Team ${i}` } as Team);
    }

    const teamIds = teams.map(t => t.id);
    const schedule: ScheduledGame[][] = [];

    const numTeams = teamIds.length;
    let circle = [...teamIds];

    for (let week = 0; week < 12; week++) {
        const weekGames: ScheduledGame[] = [];
        for (let i = 0; i < numTeams / 2; i++) {
            const home = circle[i];
            const away = circle[numTeams - 1 - i];
            weekGames.push({
                id: `g-${week}-${home}-${away}`,
                weekIndex: week,
                homeTeamId: home,
                awayTeamId: away,
                conferenceGame: false
            });
        }
        schedule.push(weekGames);

        const fixed = circle[0];
        const rest = circle.slice(1);
        rest.unshift(rest.pop() as string);
        circle = [fixed, ...rest];
    }

    return { teams, schedule };
}

describe('validateSchedule', () => {
    test('returns empty array for a valid schedule', () => {
        const { teams, schedule } = createValidData();
        const errors = validateSchedule(schedule, teams);
        assert.deepStrictEqual(errors, []);
    });

    test('returns error if schedule does not have 12 weeks', () => {
        const { teams, schedule } = createValidData();
        const shortSchedule = schedule.slice(0, 11);
        const errors = validateSchedule(shortSchedule, teams);

        assert.ok(errors.some(e => e.includes('Expected 12 weeks')));
    });

    test('returns error if a week does not have 64 games', () => {
        const { teams, schedule } = createValidData();
        // Remove one game from week 0
        schedule[0].pop();
        const errors = validateSchedule(schedule, teams);

        assert.ok(errors.some(e => e.includes('expected 64 games, got 63')));
    });

    test('returns error if a team plays twice in a week', () => {
        const { teams, schedule } = createValidData();

        // Make team t1 play twice in week 0, instead of t2
        // We find the game containing t2 and replace t2 with t1
        const gameWithT2 = schedule[0].find(g => g.homeTeamId === 't2' || g.awayTeamId === 't2');
        if (gameWithT2) {
            if (gameWithT2.homeTeamId === 't2') gameWithT2.homeTeamId = 't1';
            else gameWithT2.awayTeamId = 't1';
        }

        const errors = validateSchedule(schedule, teams);

        assert.ok(errors.some(e => e.includes('has team playing twice')));
        assert.ok(errors.some(e => e.includes('got 127'))); // team appearances will be 127 instead of 128
    });

    test('returns error if duplicate matchup occurs across weeks', () => {
        const { teams, schedule } = createValidData();

        // Copy a matchup from week 0 to week 1 (replacing week 1's first matchup)
        const gameToCopy = schedule[0][0];
        schedule[1][0] = { ...gameToCopy, weekIndex: 1 };

        const errors = validateSchedule(schedule, teams);

        assert.ok(errors.some(e => e.includes('Duplicate matchup found')));
    });

    test('returns error if a team does not play 12 games', () => {
        const { teams, schedule } = createValidData();

        // Change one game for team t0 in week 0 to feature team t1 instead
        // This will mean t0 plays 11 games, t1 plays 13 games
        const gameWithT0 = schedule[0].find(g => g.homeTeamId === 't0' || g.awayTeamId === 't0');
        if (gameWithT0) {
            if (gameWithT0.homeTeamId === 't0') gameWithT0.homeTeamId = 't1';
            else gameWithT0.awayTeamId = 't1';
        }

        const errors = validateSchedule(schedule, teams);

        assert.ok(errors.some(e => e.includes('Team t0 expected 12 games, got 11')));
        assert.ok(errors.some(e => e.includes('Team t1 expected 12 games, got 13')));
    });
});
