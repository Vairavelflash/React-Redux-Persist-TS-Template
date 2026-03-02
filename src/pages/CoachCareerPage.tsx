import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  addRecruitToBoard,
  initializeRecruitingBoard,
  removeRecruitFromBoard,
  setRecruitHours,
  setRecruitPitch,
  setPracticeFocus,
  WEEKLY_HOURS_CAP,
  MAX_HOURS_PER_RECRUIT,
  processSigningDay,
} from '../features/coach/coachSlice';
import { runCareerWeeklyCycle, processSeasonEnd } from '../features/coach/careerThunks';
import { selectTeamRecords, startNewSeason } from '../features/season/seasonSlice';
import { summarizeSigningClass } from '../sim/offseason';
import { estimateRecruitFit, getTeamPitchGrade } from '../sim/recruiting';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { PracticeFocus, RecruitingPitch, RecruitMotivation, SeasonHistoryEntry } from '../types/sim';

const PITCH_LABELS: Record<RecruitingPitch, string> = {
  PLAYING_TIME: 'Play Time',
  PROXIMITY: 'Home',
  ACADEMIC: 'Academics',
  PRESTIGE: 'Prestige',
  CHAMPIONSHIP: 'Winning',
  CAMPUS_LIFE: 'Campus',
};

const PRACTICE_FOCUS_LABELS: Record<PracticeFocus, string> = {
  OFFENSE: 'Offense Install',
  DEFENSE: 'Defense Install',
  CONDITIONING: 'Conditioning',
  DISCIPLINE: 'Discipline',
};

const ARCHETYPE_BONUSES: Record<string, string[]> = {
  RECRUITER: ['+15% weekly interest gain', 'Expanded recruit reach', 'Faster commitments'],
  TACTICIAN: ['20% less fatigue build-up', 'Better practice-to-game translation', 'Scheme advantage in close games'],
  DEVELOPER: ['Prospects trust your system', 'Signed players develop faster', 'Better 3★ target outcomes'],
};

function jobSecurityLabel(security: number): { label: string; color: string } {
  if (security >= 75) return { label: 'Strong Position', color: '#16a34a' };
  if (security >= 55) return { label: 'Secure', color: '#4ade80' };
  if (security >= 40) return { label: 'Moderate Pressure', color: '#f59e0b' };
  if (security >= 25) return { label: 'Hot Seat', color: '#ef4444' };
  return { label: 'On Thin Ice', color: '#b91c1c' };
}

function JobSecurityBar({ value }: { value: number }) {
  const { label, color } = jobSecurityLabel(value);
  const pct = Math.max(2, Math.min(100, value));
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-semibold" style={{ color }}>{label}</span>
        <span className="text-gray-500">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="h-2.5 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function SeasonHistoryRow({ entry, index }: { entry: SeasonHistoryEntry; index: number }) {
  return (
    <tr className="border-b last:border-0 text-sm">
      <td className="py-1.5 pr-3 text-gray-500">Yr {index + 1} ({entry.year})</td>
      <td className="py-1.5 pr-3 font-semibold">{entry.wins}–{entry.losses}</td>
      <td className="py-1.5 pr-3">
        {entry.champion ? (
          <span className="text-yellow-500 font-bold">Champion</span>
        ) : entry.madePlayoffs ? (
          <span className="text-blue-600">Playoffs</span>
        ) : (
          <span className="text-gray-400">No Playoffs</span>
        )}
      </td>
      <td className="py-1.5 pr-3 text-gray-600">{entry.recruitsSigned} signed ({entry.avgRecruitStars.toFixed(1)}★)</td>
      <td className="py-1.5 text-right">
        <JobSecurityBar value={entry.jobSecurityEnd} />
      </td>
    </tr>
  );
}

function MotivationIcon({ motivation }: { motivation: RecruitMotivation }) {
  const color = motivation.importance === 'HIGH' ? '#ef4444' : motivation.importance === 'MEDIUM' ? '#f59e0b' : '#9ca3af';
  const label = PITCH_LABELS[motivation.pitch];
  return (
    <span
      title={`${label} (${motivation.importance})`}
      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-1 border bg-white cursor-help"
      style={{ color, borderColor: color }}
    >
      {label.charAt(0)}
    </span>
  );
}

function CoachCareerPage() {
  const dispatch = useAppDispatch();
  const teams = useAppSelector((state) => state.league.teams);
  const coach = useAppSelector((state) => state.coach);
  const season = useAppSelector((state) => state.season);
  const recordsByTeamId = useAppSelector(selectTeamRecords);

  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [seedInput, setSeedInput] = useState(coach.recruitingSeed || 2026);
  const [showHistory, setShowHistory] = useState(false);

  const selectedTeam = teams.find((team) => team.id === coach.selectedTeamId) ?? null;
  const teamNameById = useMemo(() => new Map(teams.map((team) => [team.id, `${team.schoolName}`])), [teams]);

  const boardSet = useMemo(() => new Set(coach.boardRecruitIds), [coach.boardRecruitIds]);

  const visibleRecruits = useMemo(() => {
    return coach.recruitPool
      .filter((recruit) => (positionFilter === 'ALL' ? true : recruit.position === positionFilter))
      .filter((recruit) => recruit.name.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 50);
  }, [coach.recruitPool, positionFilter, search]);

  const boardRecruits = useMemo(() => {
    return coach.boardRecruitIds
      .map((id) => coach.recruitPool.find((recruit) => recruit.id === id))
      .filter((recruit): recruit is NonNullable<typeof recruit> => Boolean(recruit));
  }, [coach.boardRecruitIds, coach.recruitPool]);

  const totalHours = boardRecruits.reduce((sum, recruit) => sum + (coach.weeklyHoursByRecruitId[recruit.id] ?? 0), 0);
  const hoursRemaining = WEEKLY_HOURS_CAP - totalHours;

  const boardRows = useMemo(() => {
    return [...boardRecruits]
      .map((recruit) => {
        const fit = selectedTeam ? estimateRecruitFit(recruit, selectedTeam) : 0;
        const hours = coach.weeklyHoursByRecruitId[recruit.id] ?? 0;
        const interestMap = recruit.interestByTeamId || {};
        const interest = selectedTeam ? (interestMap[selectedTeam.id] || 0) : 0;
        const activePitch = coach.activePitchesByRecruitId[recruit.id];
        const pitchGrade = selectedTeam && activePitch ? getTeamPitchGrade(selectedTeam, activePitch, recruit) : '-';

        const topSuitors = Object.entries(interestMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([teamId, score]) => {
            const team = teams.find(t => t.id === teamId);
            return { name: team?.schoolName || 'Unknown', score };
          });

        let dealbreakerWarning = false;
        if (selectedTeam && recruit.dealbreaker) {
          const dbGrade = getTeamPitchGrade(selectedTeam, recruit.dealbreaker, recruit);
          if (dbGrade === 'D' || dbGrade === 'F') {
            dealbreakerWarning = true;
          }
        }

        return { recruit, fit, hours, interest, activePitch, pitchGrade, dealbreakerWarning, topSuitors };
      })
      .sort((a, b) => b.interest - a.interest);
  }, [boardRecruits, coach.weeklyHoursByRecruitId, coach.activePitchesByRecruitId, selectedTeam, teams]);

  const committedToUserCount = coach.recruitPool.filter(
    (recruit) => recruit.committedTeamId && recruit.committedTeamId === coach.selectedTeamId
  ).length;
  const signedClassThisYear = coach.signedRecruitsByYear[season.year] ?? [];
  const signedClassRecruits = signedClassThisYear
    .map((signed) => coach.recruitPool.find((recruit) => recruit.id === signed.recruitId))
    .filter((recruit): recruit is NonNullable<typeof recruit> => Boolean(recruit));
  const signedClassSummary = summarizeSigningClass(signedClassRecruits);

  const userRecord = coach.selectedTeamId
    ? recordsByTeamId[coach.selectedTeamId] ?? { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0 }
    : { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0 };

  const expectations = coach.programExpectations;
  const winTarget = expectations?.winTarget ?? 0;
  const rankTarget = expectations?.rankTarget ?? 99;
  const careerYear = coach.careerRecord.seasonsCompleted + 1;

  if (coach.onboardingStep !== 'READY' || !coach.profile || !coach.selectedTeamId) {
    return <Navigate to="/career/setup" replace />;
  }

  const archetype = coach.profile.archetype;
  const archetypeBonuses = ARCHETYPE_BONUSES[archetype] ?? [];

  function onAdd(recruit: typeof visibleRecruits[0]) {
    if (selectedTeam) {
      const fit = estimateRecruitFit(recruit, selectedTeam);
      const startingInterest = Math.min(40, Math.round(fit * 0.4 + recruit.stars * 2));
      dispatch(addRecruitToBoard({ recruitId: recruit.id, startingInterest }));
    }
  }

  function onAdvance() {
    dispatch(runCareerWeeklyCycle());
  }

  function onHoursChange(recruitId: string, nextHours: number): void {
    const current = coach.weeklyHoursByRecruitId[recruitId] ?? 0;
    const requested = Math.max(0, Math.min(MAX_HOURS_PER_RECRUIT, nextHours));
    const withoutCurrent = totalHours - current;
    const allowed = Math.min(MAX_HOURS_PER_RECRUIT, Math.max(0, WEEKLY_HOURS_CAP - withoutCurrent));
    dispatch(setRecruitHours({ recruitId, hours: Math.min(requested, allowed) }));
  }

  async function onEndSeason() {
    await dispatch(processSeasonEnd());
  }

  async function onNewSeason() {
    const nextSeed = (coach.recruitingSeed ?? 2026) + 1;
    await dispatch(startNewSeason({ seed: nextSeed }));
  }

  const winProgress = Math.min(100, Math.round((userRecord.wins / Math.max(1, winTarget)) * 100));
  const isOffseason = season.phase === 'OFFSEASON';
  const seasonEndProcessed = isOffseason && coach.seasonHistory.some(e => e.year === season.year);

  return (
    <div className="flex-col gap-4">
      {/* ── Career Dashboard ── */}
      <div className="card">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h2 className="m-0 text-xl">
              Coach {coach.profile.name}
              <span className="ml-2 text-sm font-normal text-gray-500">Year {careerYear}</span>
            </h2>
            <div className="text-gray-500 text-sm mt-0.5">
              {selectedTeam?.schoolName} {selectedTeam?.nickname} &bull; {coach.careerTier} Program &bull; Skill {coach.profile.skill} &bull; Age {coach.profile.age}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase mb-1">Career Record</div>
            <div className="text-lg font-bold">{coach.careerRecord.totalWins}–{coach.careerRecord.totalLosses}</div>
            <div className="text-xs text-gray-500">
              {coach.careerRecord.playoffAppearances} playoff app{coach.careerRecord.playoffAppearances !== 1 ? 's' : ''}
              {coach.careerRecord.championships > 0 && ` · ${coach.careerRecord.championships} title${coach.careerRecord.championships !== 1 ? 's' : ''}`}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-3 border-t">
          {/* Season Performance */}
          <div>
            <div className="text-xs text-gray-500 uppercase mb-2">Season Performance</div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{userRecord.wins}–{userRecord.losses}</span>
              <span className="text-gray-400 text-sm">({userRecord.confWins}–{userRecord.confLosses} conf)</span>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Win target: {winTarget}</span>
                <span className={userRecord.wins >= winTarget ? 'text-green-600 font-bold' : 'text-amber-600'}>{userRecord.wins}/{winTarget}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${userRecord.wins >= winTarget ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${winProgress}%` }}
                />
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1.5">Rank target: Top {rankTarget}</div>
          </div>

          {/* Job Security */}
          <div>
            <div className="text-xs text-gray-500 uppercase mb-2">Job Security</div>
            <JobSecurityBar value={coach.jobSecurity} />
            <div className="text-xs text-gray-500 mt-2">
              {coach.jobSecurity < 30
                ? '⚠ Meeting expectations is critical this season.'
                : coach.jobSecurity >= 75
                  ? 'You have strong administrative support.'
                  : 'Keep performing to stay secure.'}
            </div>
          </div>

          {/* Archetype */}
          <div>
            <div className="text-xs text-gray-500 uppercase mb-2">Archetype: {archetype.charAt(0) + archetype.slice(1).toLowerCase()}</div>
            <ul className="text-xs space-y-1">
              {archetypeBonuses.map((bonus, i) => (
                <li key={i} className="flex items-center gap-1 text-blue-700">
                  <span className="text-blue-400">+</span> {bonus}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Career History toggle */}
        {coach.seasonHistory.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <button
              className="text-xs text-blue-600 hover:underline bg-transparent border-0 cursor-pointer"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? 'Hide' : 'Show'} Career History ({coach.seasonHistory.length} season{coach.seasonHistory.length !== 1 ? 's' : ''})
            </button>
            {showHistory && (
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 border-b">
                      <th className="pb-1 pr-3">Season</th>
                      <th className="pb-1 pr-3">Record</th>
                      <th className="pb-1 pr-3">Playoff</th>
                      <th className="pb-1 pr-3">Recruiting</th>
                      <th className="pb-1 text-right">Security</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coach.seasonHistory.map((entry, i) => (
                      <SeasonHistoryRow key={entry.year} entry={entry} index={i} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Offseason Panel ── */}
      {isOffseason && (
        <div className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <h3 className="text-base font-bold mb-1">Offseason</h3>
          <div className="flex gap-6 mb-4">
            <div>
              <div className="text-xs text-gray-500">Final Record</div>
              <div className="font-semibold">{userRecord.wins}–{userRecord.losses}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Signing Class</div>
              <div className="font-semibold">{signedClassThisYear.length} signed ({signedClassSummary.averageStars.toFixed(2)}★ avg)</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Blue-chips</div>
              <div className="font-semibold">{signedClassSummary.blueChipCount}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">vs Expectation</div>
              <div className={`font-semibold ${userRecord.wins >= winTarget ? 'text-green-600' : 'text-red-500'}`}>
                {userRecord.wins >= winTarget ? `+${userRecord.wins - winTarget} wins` : `${userRecord.wins - winTarget} wins`}
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {signedClassThisYear.length === 0 && (
              <button
                className="btn btn-primary"
                onClick={() => dispatch(processSigningDay())}
              >
                Resolve Signing Day
              </button>
            )}
            {!seasonEndProcessed && signedClassThisYear.length > 0 && (
              <button
                className="btn btn-primary"
                onClick={onEndSeason}
              >
                Finalize Season &amp; Update Record
              </button>
            )}
            {seasonEndProcessed && (
              <button
                className="btn btn-primary"
                onClick={onNewSeason}
              >
                Begin Next Season →
              </button>
            )}
            {signedClassThisYear.length > 0 && (
              <div className="text-xs text-gray-500 self-center">
                {!seasonEndProcessed
                  ? 'Finalize to update career record and job security.'
                  : 'Season recorded. Start next year when ready.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Recruiting Section ── */}
      <div className="card">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-base font-bold m-0">Recruiting Dashboard</h3>
            <div className="text-xs text-gray-500 mt-0.5">Week {coach.recruitingWeekIndex} &bull; Seed {coach.recruitingSeed}</div>
          </div>
          <div className="flex gap-4 text-sm items-start">
            <div className="text-right">
              <div className="text-xs text-gray-500">Committed</div>
              <div className="font-bold">{committedToUserCount} / 12</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Hours Left</div>
              <div className={`font-bold ${hoursRemaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {hoursRemaining} / {WEEKLY_HOURS_CAP}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Practice</div>
              <select
                value={coach.practiceFocus}
                onChange={(event) => dispatch(setPracticeFocus(event.target.value as PracticeFocus))}
                className="p-1 text-sm border rounded"
              >
                {Object.entries(PRACTICE_FOCUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <div className="text-xs text-gray-400 mt-0.5">Fatigue: {coach.teamFatigue}%</div>
            </div>
            <div className="text-right">
              {coach.recruitPool.length === 0 ? (
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={seedInput}
                    onChange={(e) => setSeedInput(Number(e.target.value))}
                    className="w-20 p-1 text-sm border rounded"
                    placeholder="Seed"
                  />
                  <button
                    className="btn btn-primary text-sm"
                    onClick={() => dispatch(initializeRecruitingBoard({ seed: seedInput, teams }))}
                  >
                    Start Recruiting
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-end gap-1">
                  {!isOffseason ? (
                    <button className="btn btn-primary" onClick={onAdvance}>
                      Advance Week {coach.recruitingWeekIndex + 1}
                    </button>
                  ) : null}
                  {coach.boardRecruitIds.length === 0 && !isOffseason && (
                    <div className="text-xs text-amber-700">No active targets: season advances with CPU recruiting only.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <h3 className="text-lg font-bold mb-2">Target List ({boardRows.length}/25)</h3>

          {boardRows.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded">
              <p>Your board is empty.</p>
              <p className="text-sm">Add prospects from the pool on the right.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2">Recruit</th>
                    <th className="pb-2">Competition</th>
                    <th className="pb-2">Pitch/Grade</th>
                    <th className="pb-2 w-24">Interest</th>
                    <th className="pb-2 text-right">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {boardRows.map(({ recruit, interest, activePitch, pitchGrade, dealbreakerWarning, topSuitors }) => (
                    <tr key={recruit.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2">
                        <div className="font-semibold flex items-center gap-1">
                          {recruit.name}
                          {dealbreakerWarning && <span title="Dealbreaker Warning" className="text-red-500 cursor-help">⚠</span>}
                          {recruit.committedTeamId === coach.selectedTeamId && (
                            <span className="text-xs text-green-600 font-bold ml-1">✓ Committed</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {'★'.repeat(recruit.stars)} {recruit.position}
                          <div className="flex mt-1">
                            {recruit.motivations?.map((m, i) => <MotivationIcon key={i} motivation={m} />)}
                          </div>
                        </div>
                      </td>
                      <td className="py-2">
                        <div className="text-xs">
                          {topSuitors.map((s, i) => (
                            <div key={i} className={`flex justify-between ${s.name === selectedTeam?.schoolName ? 'font-bold text-blue-700' : 'text-gray-600'}`}>
                              <span className="truncate max-w-[100px]" title={s.name}>{s.name}</span>
                              <span>{s.score}%</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-2">
                        <select
                          value={activePitch || ''}
                          onChange={(e) => dispatch(setRecruitPitch({ recruitId: recruit.id, pitch: e.target.value as RecruitingPitch }))}
                          className="text-xs p-1 border rounded w-full mb-1"
                        >
                          <option value="">No Pitch</option>
                          {Object.entries(PITCH_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                        {activePitch && (
                          <div className={`text-xs font-bold text-center ${pitchGrade.startsWith('A') ? 'text-green-600' : pitchGrade === 'F' ? 'text-red-600' : 'text-gray-600'}`}>
                            Grade: {pitchGrade}
                          </div>
                        )}
                      </td>
                      <td className="py-2">
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                          <div className={`h-2 rounded-full ${interest >= 100 ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${Math.min(100, interest)}%` }} />
                        </div>
                        <div className="text-xs font-bold text-center">{interest}%</div>
                      </td>
                      <td className="py-2 text-right">
                        <input
                          type="number"
                          min={0}
                          max={MAX_HOURS_PER_RECRUIT}
                          value={coach.weeklyHoursByRecruitId[recruit.id] ?? 0}
                          onChange={(event) => onHoursChange(recruit.id, Number(event.target.value) || 0)}
                          className="w-12 p-1 border rounded text-center"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold m-0">Prospect Pool</h3>
            <button
              className="text-xs text-blue-600 hover:underline bg-transparent border-0 cursor-pointer"
              onClick={() => { setSearch(''); setPositionFilter('ALL'); }}
            >
              Reset Filters
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="flex-1 p-1 text-sm border rounded"
            />
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="w-20 p-1 text-sm border rounded"
            >
              <option value="ALL">All</option>
              <option value="A">A</option>
              <option value="M">M</option>
              <option value="D">D</option>
              <option value="LSM">LSM</option>
              <option value="FO">FO</option>
              <option value="G">G</option>
            </select>
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr className="text-left text-gray-500">
                  <th className="p-2">Name</th>
                  <th className="p-2">Rtg</th>
                  <th className="p-2">Fit</th>
                  <th className="p-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleRecruits.map((recruit) => {
                  const isCommittedElsewhere = Boolean(recruit.committedTeamId && recruit.committedTeamId !== coach.selectedTeamId);
                  const isCommittedToMe = recruit.committedTeamId === coach.selectedTeamId;
                  const onBoard = boardSet.has(recruit.id);
                  const fit = selectedTeam ? estimateRecruitFit(recruit, selectedTeam) : '-';

                  return (
                    <tr key={recruit.id} className={`border-b hover:bg-gray-50 ${isCommittedToMe ? 'bg-green-50' : ''}`}>
                      <td className="p-2">
                        <div className="font-semibold">{recruit.name}</div>
                        <div className="text-xs text-gray-500">{recruit.position} &bull; {recruit.region}</div>
                        {isCommittedElsewhere && <div className="text-xs text-red-500">Committed: {teamNameById.get(recruit.committedTeamId!) || 'Other'}</div>}
                        {isCommittedToMe && <div className="text-xs text-green-600 font-bold">Committed!</div>}
                      </td>
                      <td className="p-2 text-yellow-500 text-xs">{'★'.repeat(recruit.stars)}</td>
                      <td className="p-2 font-mono">{fit}</td>
                      <td className="p-2 text-right">
                        {onBoard ? (
                          <button
                            className="text-xs text-red-600 hover:underline bg-transparent border-0 cursor-pointer"
                            onClick={() => dispatch(removeRecruitFromBoard(recruit.id))}
                          >
                            Remove
                          </button>
                        ) : (
                          !isCommittedElsewhere && !isCommittedToMe && (
                            <button
                              className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100 cursor-pointer"
                              onClick={() => onAdd(recruit)}
                              disabled={boardSet.size >= 25}
                            >
                              Add
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })}
                {visibleRecruits.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">No recruits found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoachCareerPage;
