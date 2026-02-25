import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  addRecruitToBoard,
  advanceRecruitingWeek,
  initializeRecruitingBoard,
  removeRecruitFromBoard,
  setRecruitHours,
} from '../features/coach/coachSlice';
import { selectTeamRecords } from '../features/season/seasonSlice';
import { estimateRecruitFit } from '../sim/recruiting';
import { useAppDispatch, useAppSelector } from '../store/hooks';

const WEEKLY_HOURS_CAP = 120;

function CoachCareerPage() {
  const dispatch = useAppDispatch();
  const teams = useAppSelector((state) => state.league.teams);
  const coach = useAppSelector((state) => state.coach);
  const season = useAppSelector((state) => state.season);
  const recordsByTeamId = useAppSelector(selectTeamRecords);

  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [seedInput, setSeedInput] = useState(coach.recruitingSeed || 2026);
  const selectedTeam = teams.find((team) => team.id === coach.selectedTeamId) ?? null;
  const teamNameById = useMemo(() => new Map(teams.map((team) => [team.id, `${team.schoolName} ${team.nickname}`])), [teams]);

  const boardSet = useMemo(() => new Set(coach.boardRecruitIds), [coach.boardRecruitIds]);

  const visibleRecruits = coach.recruitPool
    .filter((recruit) => (positionFilter === 'ALL' ? true : recruit.position === positionFilter))
    .filter((recruit) => recruit.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 120);

  const boardRecruits = coach.boardRecruitIds
    .map((id) => coach.recruitPool.find((recruit) => recruit.id === id))
    .filter((recruit): recruit is NonNullable<typeof recruit> => Boolean(recruit));

  const totalHours = boardRecruits.reduce((sum, recruit) => sum + (coach.weeklyHoursByRecruitId[recruit.id] ?? 0), 0);
  const hoursRemaining = WEEKLY_HOURS_CAP - totalHours;

  const boardRows = [...boardRecruits]
    .map((recruit) => {
      const fit = selectedTeam ? estimateRecruitFit(recruit, selectedTeam) : 0;
      const hours = coach.weeklyHoursByRecruitId[recruit.id] ?? 0;
      const interest = coach.interestByRecruitId[recruit.id] ?? Math.min(100, Math.round(fit * 0.55 + hours * 2.4 + recruit.stars * 5));
      return { recruit, fit, hours, interest };
    })
    .sort((a, b) => b.interest - a.interest);

  const committedToUserCount = coach.recruitPool.filter((recruit) => recruit.committedTeamId && recruit.committedTeamId === coach.selectedTeamId).length;
  const boardAvgInterest = boardRows.length ? Math.round(boardRows.reduce((sum, row) => sum + row.interest, 0) / boardRows.length) : 0;


  const userRecord = coach.selectedTeamId
    ? recordsByTeamId[coach.selectedTeamId] ?? { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0 }
    : { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0 };
  const pointDiff = userRecord.pointsFor - userRecord.pointsAgainst;
  const seasonStatusText =
    season.scheduleByWeek.length === 0
      ? 'No active season'
      : `Week ${Math.min(season.currentWeekIndex + 1, 12)} · ${season.phase}`;

  if (coach.onboardingStep !== 'READY' || !coach.profile || !coach.selectedTeamId) {
    return <Navigate to="/career/setup" replace />;
  }

  function onHoursChange(recruitId: string, nextHours: number): void {
    const current = coach.weeklyHoursByRecruitId[recruitId] ?? 0;
    const requested = Math.max(0, Math.min(20, nextHours));
    const withoutCurrent = totalHours - current;
    const allowed = Math.min(20, Math.max(0, WEEKLY_HOURS_CAP - withoutCurrent));
    dispatch(setRecruitHours({ recruitId, hours: Math.min(requested, allowed) }));
  }

  return (
    <section>
      <h2>Coach Career: Recruiting</h2>
      <p className="mutedText">{coach.profile.name} · {selectedTeam?.schoolName} {selectedTeam?.nickname} · {coach.careerTier}</p>
      <p className="mutedText">Need to change coach identity or program? <Link to="/career/setup">Return to setup</Link>.</p>

      <div className="card">
        <h3>Program Snapshot</h3>
        <div className="careerStatsGrid">
          <div className="statTile">
            <span className="mutedText">Season Status</span>
            <strong>{seasonStatusText}</strong>
          </div>
          <div className="statTile">
            <span className="mutedText">Record</span>
            <strong>{userRecord.wins}-{userRecord.losses}</strong>
          </div>
          <div className="statTile">
            <span className="mutedText">Conference</span>
            <strong>{userRecord.confWins}-{userRecord.confLosses}</strong>
          </div>
          <div className="statTile">
            <span className="mutedText">Point Diff</span>
            <strong>{pointDiff >= 0 ? `+${pointDiff}` : pointDiff}</strong>
          </div>
        </div>
        <p className="mutedText">Open <Link to="/season">Season Command Center</Link> to advance games and feed recruiting momentum.</p>
      </div>

      <div className="card">
        <div className="setupSummary">
          <p>
            <strong>Program:</strong> {selectedTeam?.schoolName} {selectedTeam?.nickname}
          </p>
          <p className="mutedText">
            <strong>Career Tier:</strong> {coach.careerTier} · <strong>Season Wins Target:</strong> {coach.programExpectations?.winTarget ?? '-'} ·{' '}
            <strong>Security Baseline:</strong> {coach.programExpectations?.securityBaseline ?? '-'}
          </p>
        </div>

        <div className="seedRow">
          <label>
            Recruiting Seed
            <input type="number" value={seedInput} onChange={(event) => setSeedInput(Number(event.target.value) || 0)} />
          </label>

          <button type="button" onClick={() => setSeedInput(Math.floor(Math.random() * 1_000_000_000))}>
            Random Seed
          </button>
          <button type="button" onClick={() => dispatch(initializeRecruitingBoard({ seed: seedInput }))}>
            Generate Recruiting Class
          </button>
          <button type="button" onClick={() => dispatch(advanceRecruitingWeek())} disabled={coach.recruitPool.length === 0 || coach.boardRecruitIds.length === 0}>
            Advance Recruiting Week
          </button>
        </div>
        <p className="mutedText">Board size: {coach.boardRecruitIds.length} / 25 · Pool: {coach.recruitPool.length} prospects · Recruiting Week {coach.recruitingWeekIndex + 1}</p>
        <p className={hoursRemaining < 0 ? 'warnText' : 'mutedText'}>
          Weekly recruiting hours: {totalHours} / {WEEKLY_HOURS_CAP} {hoursRemaining >= 0 ? `(remaining ${hoursRemaining})` : '(over budget)'}
        </p>
        {coach.boardRecruitIds.length === 0 ? <p className="mutedText">Add at least one recruit to your board before advancing the week.</p> : null}

        <div className="careerStatsGrid">
          <div className="statTile">
            <span className="mutedText">Committed to You</span>
            <strong>{committedToUserCount}</strong>
          </div>
          <div className="statTile">
            <span className="mutedText">Avg Board Interest</span>
            <strong>{boardAvgInterest}</strong>
          </div>
          <div className="statTile">
            <span className="mutedText">Open Scholarships (scaffold)</span>
            <strong>{Math.max(0, 12 - committedToUserCount)}</strong>
          </div>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <h3>Prospect Pool</h3>
          <div className="seedRow">
            <label>
              Search
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search recruit" />
            </label>
            <label>
              Position
              <select value={positionFilter} onChange={(event) => setPositionFilter(event.target.value)}>
                <option value="ALL">All</option>
                <option value="A">A</option>
                <option value="M">M</option>
                <option value="D">D</option>
                <option value="LSM">LSM</option>
                <option value="FO">FO</option>
                <option value="G">G</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setPositionFilter('ALL');
              }}
            >
              Clear Filters
            </button>
          </div>

          <div className="scrollPanel">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Pos</th>
                  <th>Stars</th>
                  <th>Potential</th>
                  <th>Fit</th>
                  <th>Interest</th>
                  <th>Status</th>
                  <th>Board</th>
                </tr>
              </thead>
              <tbody>
                {visibleRecruits.map((recruit) => {
                  const committedName = recruit.committedTeamId
                    ? recruit.committedTeamId === coach.selectedTeamId
                      ? 'Committed (You)'
                      : teamNameById.get(recruit.committedTeamId) ?? 'Committed'
                    : null;
                  const isCommittedElsewhere = Boolean(recruit.committedTeamId && recruit.committedTeamId !== coach.selectedTeamId);
                  const interest = coach.interestByRecruitId[recruit.id] ?? 0;

                  return (
                    <tr key={recruit.id}>
                      <td>{recruit.name}</td>
                      <td>{recruit.position}</td>
                      <td className="starText">{'★'.repeat(recruit.stars)}</td>
                      <td>{recruit.potential}</td>
                      <td>{selectedTeam ? estimateRecruitFit(recruit, selectedTeam) : '-'}</td>
                      <td>
                        <div className="interestMeterWrap">
                          <div className="interestMeterBar" style={{ width: `${interest}%` }} />
                        </div>
                        <span className="meterLabel">{interest}</span>
                      </td>
                      <td>{committedName ?? 'Open'}</td>
                      <td>
                        {boardSet.has(recruit.id) ? (
                          <button type="button" onClick={() => dispatch(removeRecruitFromBoard(recruit.id))}>
                            Remove
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => dispatch(addRecruitToBoard(recruit.id))}
                            disabled={!selectedTeam || boardSet.size >= 25 || isCommittedElsewhere}
                          >
                            Add
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3>Your Board</h3>
          {boardRows.length === 0 ? (
            <p className="mutedText">Add recruits from the pool to build your board.</p>
          ) : (
            <div className="scrollPanel">
              <table>
                <thead>
                  <tr>
                    <th>Recruit</th>
                    <th>Stars</th>
                    <th>Fit</th>
                    <th>Interest</th>
                    <th>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {boardRows.map(({ recruit, fit, interest }) => (
                    <tr key={recruit.id}>
                      <td>{recruit.name}</td>
                      <td className="starText">{'★'.repeat(recruit.stars)}</td>
                      <td>{fit}</td>
                      <td>
                        <div className="interestMeterWrap">
                          <div className="interestMeterBar" style={{ width: `${interest}%` }} />
                        </div>
                        <span className="meterLabel">{interest}</span>
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          max={20}
                          value={coach.weeklyHoursByRecruitId[recruit.id] ?? 0}
                          onChange={(event) => onHoursChange(recruit.id, Number(event.target.value) || 0)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default CoachCareerPage;
