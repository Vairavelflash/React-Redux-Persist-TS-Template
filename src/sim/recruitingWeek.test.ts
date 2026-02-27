import { describe, test } from 'node:test';
import assert from 'node:assert';
import { simulateRecruitingWeek } from './recruitingWeek.ts';
import type { Recruit } from '../types/sim.ts';

describe('Recruiting Week Simulation', () => {
    const mockRecruit = (id: string, overrides: Partial<Recruit> = {}): Recruit => ({
        id,
        name: 'Test Recruit',
        position: 'A',
        stars: 3,
        region: 'Northeast',
        potential: 80,
        committedTeamId: null,
        motivations: [
            { pitch: 'PLAYING_TIME', importance: 'HIGH' },
            { pitch: 'PROXIMITY', importance: 'MEDIUM' },
            { pitch: 'ACADEMIC', importance: 'LOW' }
        ],
        dealbreaker: null,
        ...overrides
    });

    const baseInputs = {
        weeklyHoursByRecruitId: {},
        activePitchesByRecruitId: {},
        pitchGradesByRecruitId: {},
        dealbreakerViolationsByRecruitId: {},
        currentInterestByRecruitId: {},
        selectedTeamId: 'team-1',
        seed: 12345,
        weekIndex: 0
    };

    test('Interest increases with hours allocated', () => {
        const recruit = mockRecruit('r1');
        const result = simulateRecruitingWeek(
            [recruit],
            ['r1'], // on board
            { 'r1': 10 }, // 10 hours
            {},
            {},
            {},
            { 'r1': 50 }, // current interest
            'team-1',
            12345,
            0
        );

        // Base gain approx: 10 * 0.5 + 3 * 0.2 = 5.6. Plus random factor.
        // Should be roughly 55-57.
        const newInterest = result.interestByRecruitId['r1'];
        assert.ok(newInterest > 50, `Interest should increase (got ${newInterest})`);
        assert.ok(newInterest < 65, `Interest shouldn't skyrocket (got ${newInterest})`);
    });

    test('Interest decays when not on board', () => {
        const recruit = mockRecruit('r1');
        const result = simulateRecruitingWeek(
            [recruit],
            [], // NOT on board
            {},
            {},
            {},
            {},
            { 'r1': 50 },
            'team-1',
            12345,
            0
        );

        const newInterest = result.interestByRecruitId['r1'];
        // Logic: const decay = boardSet.has(recruit.id) ? 0 : 2;
        // Gain is 0. So 50 - 2 = 48.
        assert.strictEqual(newInterest, 48, `Interest should decay by 2 (got ${newInterest})`);
    });

    test('Dealbreaker violation causes interest loss', () => {
        const recruit = mockRecruit('r1', { dealbreaker: 'PROXIMITY' });
        const result = simulateRecruitingWeek(
            [recruit],
            ['r1'],
            { 'r1': 20 }, // Max hours
            {},
            {},
            { 'r1': true }, // VIOLATION
            { 'r1': 50 },
            'team-1',
            12345,
            0
        );

        // Logic: weeklyGain = -5 regardless of hours
        // 50 - 5 = 45.
        const newInterest = result.interestByRecruitId['r1'];
        assert.strictEqual(newInterest, 45, `Interest should drop by 5 on dealbreaker (got ${newInterest})`);
    });

    test('Commitment triggers at 100 interest', () => {
        const recruit = mockRecruit('r1');
        const result = simulateRecruitingWeek(
            [recruit],
            ['r1'],
            { 'r1': 20 }, // plenty of hours
            {},
            {},
            {},
            { 'r1': 95 }, // close to commit
            'team-1',
            12345,
            0
        );

        const newInterest = result.interestByRecruitId['r1'];
        const committed = result.committedTeamByRecruitId['r1'];

        // 20 hours should be enough to push > 5 points
        assert.ok(newInterest >= 100, 'Interest should reach 100');
        assert.strictEqual(committed, 'team-1', 'Recruit should commit to team-1');
    });

    test('Commitment does not trigger if no selected team', () => {
        const recruit = mockRecruit('r1');
        const result = simulateRecruitingWeek(
            [recruit],
            ['r1'],
            { 'r1': 20 },
            {},
            {},
            {},
            { 'r1': 95 },
            null, // No selected team (e.g. CPU processing, though simulateRecruitingWeek is currently user-centric)
            12345,
            0
        );

        assert.strictEqual(result.committedTeamByRecruitId['r1'], null);
    });
});
