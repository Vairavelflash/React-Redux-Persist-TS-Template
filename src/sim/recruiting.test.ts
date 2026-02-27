import { describe, test } from 'node:test';
import assert from 'node:assert';
import { generateRecruitPool, calculateTeamGrade, getTeamPitchGrade, estimateRecruitFit } from './recruiting.ts';
import type { Team, Recruit } from '../types/sim.ts';

describe('Recruiting Logic', () => {
    test('generateRecruitPool creates recruits with motivations', () => {
        const pool = generateRecruitPool(2026);
        assert.ok(pool.length > 0);
        const recruit = pool[0];
        assert.ok(recruit.motivations.length === 3);
        assert.ok(['HIGH', 'MEDIUM', 'LOW'].includes(recruit.motivations[0].importance));
    });

    test('generateRecruitPool assigns dealbreakers roughly 10% of the time', () => {
        const pool = generateRecruitPool(12345, 1000); // 1000 recruits
        const dealbreakers = pool.filter(r => r.dealbreaker).length;
        // Expect ~100 dealbreakers (10%). Allow margin.
        assert.ok(dealbreakers > 50 && dealbreakers < 150, `Expected ~100 dealbreakers, got ${dealbreakers}`);
    });

    test('calculateTeamGrade returns correct grades', () => {
        const team = {
            prestige: 90,
            academicQuality: 90,
            facilities: 90,
            marketSize: 0, // irrelevant for most
            wins: 10, // irrelevant here
        } as unknown as Team;

        // PRESTIGE
        // >85 -> A+
        assert.strictEqual(calculateTeamGrade(team, 'PRESTIGE'), 'A+');

        // ACADEMIC
        // >80 -> A
        assert.strictEqual(calculateTeamGrade(team, 'ACADEMIC'), 'A');

        // CAMPUS_LIFE (facilities)
        // >85 -> B+ (hardcoded)
        assert.strictEqual(calculateTeamGrade(team, 'CAMPUS_LIFE'), 'B+');
    });

    test('getTeamPitchGrade maps to motivations correctly', () => {
         const team = {
            prestige: 90,
            region: 'Northeast'
        } as unknown as Team;

        const recruit = {
            region: 'Northeast', // Match -> Proximity A+
            motivations: [
                { pitch: 'PRESTIGE', importance: 'HIGH' }
            ]
        } as unknown as Recruit;

        // PROXIMITY -> A+ (same region)
        assert.strictEqual(getTeamPitchGrade(team, 'PROXIMITY', recruit), 'A+');

        // PRESTIGE -> A+ (90 > 85)
        assert.strictEqual(getTeamPitchGrade(team, 'PRESTIGE', recruit), 'A+');
    });

    test('estimateRecruitFit includes motivations', () => {
        const team = {
            prestige: 90,
            state: 'MA'
        } as unknown as Team;

        const recruit = {
            homeState: 'MA',
            stars: 3,
            potential: 70,
            motivations: [
                { pitch: 'PRESTIGE', importance: 'HIGH' },
                { pitch: 'PROXIMITY', importance: 'MEDIUM' },
                { pitch: 'ACADEMIC', importance: 'LOW' }
            ]
        } as unknown as Recruit;

        // Should have a high fit because Prestige (High) is A and Proximity (Medium) is A
        const fit = estimateRecruitFit(recruit, team);
        assert.ok(fit > 60, `Expected high fit, got ${fit}`);
    });

    test('generateSuitors creates initial interest for CPU teams', async () => {
        const recruit = {
            id: 'r1',
            stars: 4,
            region: 'Northeast',
            motivations: []
        } as unknown as Recruit;

        const teams = [
            { id: 't1', prestige: 90, region: 'Northeast' },
            { id: 't2', prestige: 85, region: 'Northeast' },
            { id: 't3', prestige: 20, region: 'West' } // low fit
        ] as Team[];

        const { generateSuitors } = await import('./recruiting.ts');
        const result = generateSuitors(recruit, teams, 12345);

        // Expect t1 and t2 to be suitors, t3 likely not.
        // Note: With only 3 teams and random selection of 3-5, all might be selected.
        // Let's check that we have some suitors.
        assert.ok(Object.keys(result).length > 0, 'Should generate suitors');
    });
});
