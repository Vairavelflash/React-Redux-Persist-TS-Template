import { describe, test } from 'node:test';
import assert from 'node:assert';
import { generateRecruitPool, calculateTeamGrade, getTeamPitchGrade, estimateRecruitFit } from './recruiting.ts';
import type { Team, Recruit, RecruitingPitch, RecruitMotivation } from '../types/sim.ts';

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
});
