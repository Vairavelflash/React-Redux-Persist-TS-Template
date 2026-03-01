import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeCareerSetup, setCoachProfile } from '../features/coach/coachSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

const archetypeOptions = [
  {
    value: 'RECRUITER' as const,
    label: 'Recruiter',
    summary: '+15% weekly interest gain · lower scheme bonus',
  },
  {
    value: 'TACTICIAN' as const,
    label: 'Tactician',
    summary: '+in-game prep bonus · balanced recruiting',
  },
  {
    value: 'DEVELOPER' as const,
    label: 'Developer',
    summary: '+player growth potential · slower early commits',
  },
];

function CoachCareerSetupPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const teams = useAppSelector((state) => state.league.teams);
  const conferences = useAppSelector((state) => state.league.conferences);
  const coach = useAppSelector((state) => state.coach);

  const [coachName, setCoachName] = useState(coach.profile?.name ?? '');
  const [almaMater, setAlmaMater] = useState(coach.profile?.almaMater ?? '');
  const [archetype, setArchetype] = useState(coach.profile?.archetype ?? 'RECRUITER');
  const [coachAge, setCoachAge] = useState(coach.profile?.age ?? 38);
  const [coachSkill, setCoachSkill] = useState(coach.profile?.skill ?? 72);
  const [teamId, setTeamId] = useState(coach.selectedTeamId ?? '');

  const conferenceById = useMemo(() => new Map(conferences.map((conference) => [conference.id, conference.name])), [conferences]);


  function buildProgramExpectations(prestige: number) {
    if (prestige <= 2) {
      return {
        careerTier: 'REBUILD' as const,
        programExpectations: { winTarget: 5, rankTarget: 40, securityBaseline: 72 },
      };
    }
    if (prestige === 3) {
      return {
        careerTier: 'STABLE' as const,
        programExpectations: { winTarget: 7, rankTarget: 25, securityBaseline: 62 },
      };
    }

    return {
      careerTier: 'CONTENDER' as const,
      programExpectations: { winTarget: 9, rankTarget: 12, securityBaseline: 52 },
    };
  }

  function onStartCareer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const selectedTeam = teams.find((team) => team.id === teamId);
    if (!selectedTeam) return;

    dispatch(
      setCoachProfile({
        name: coachName.trim(),
        almaMater: almaMater.trim(),
        archetype,
        age: Math.max(24, Math.min(75, Math.round(coachAge))),
        skill: Math.max(40, Math.min(99, Math.round(coachSkill))),
      }),
    );

    const setup = buildProgramExpectations(selectedTeam.prestige);

    dispatch(
      completeCareerSetup({
        teamId: selectedTeam.id,
        seasonYear: 1,
        careerTier: setup.careerTier,
        programExpectations: setup.programExpectations,
      }),
    );

    navigate('/career');
  }

  const team = teams.find((entry) => entry.id === teamId) ?? null;
  const teamExpectations = team ? buildProgramExpectations(team.prestige) : null;
  const canContinue =
    coachName.trim().length > 1 &&
    almaMater.trim().length > 1 &&
    coachAge >= 24 &&
    coachAge <= 75 &&
    coachSkill >= 40 &&
    coachSkill <= 99 &&
    Boolean(teamId);

  return (
    <section>
      <h2>Coach Career Setup</h2>
      <p className="mutedText">Create or edit your coach profile, choose a program, and enter career mode.</p>

      <form className="card" onSubmit={onStartCareer}>
        <div className="grid2">
          <label>
            Coach Name
            <input value={coachName} onChange={(event) => setCoachName(event.target.value)} placeholder="Avery Stone" />
          </label>

          <label>
            Alma Mater
            <input value={almaMater} onChange={(event) => setAlmaMater(event.target.value)} placeholder="Bay State" />
          </label>
        </div>

        <label>
          Coaching Archetype
          <select value={archetype} onChange={(event) => setArchetype(event.target.value as typeof archetype)}>
            {archetypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <p className="mutedText">{archetypeOptions.find((option) => option.value === archetype)?.summary}</p>

        <div className="grid2">
          <label>
            Coach Age
            <input
              type="number"
              min={24}
              max={75}
              value={coachAge}
              onChange={(event) => setCoachAge(Number(event.target.value))}
            />
          </label>

          <label>
            Coach Skill (40-99)
            <input
              type="number"
              min={40}
              max={99}
              value={coachSkill}
              onChange={(event) => setCoachSkill(Number(event.target.value))}
            />
          </label>
        </div>

        <label>
          Program
          <select value={teamId} onChange={(event) => setTeamId(event.target.value)}>
            <option value="">Select a team</option>
            {teams.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.schoolName} {entry.nickname} ({conferenceById.get(entry.conferenceId) ?? entry.conferenceId})
              </option>
            ))}
          </select>
        </label>

        {team ? (
          <div className="setupSummary">
            <p>
              <strong>{team.schoolName + ' ' + team.nickname}</strong> · Prestige {team.prestige} · {team.region}
            </p>
            <p className="mutedText">Expected tier: {teamExpectations?.careerTier}</p>
            <p className="mutedText">Year 1 targets: {teamExpectations?.programExpectations.winTarget}+ wins, Top {teamExpectations?.programExpectations.rankTarget}</p>
          </div>
        ) : null}

        <button type="submit" disabled={!canContinue}>
          {coach.onboardingStep === 'READY' ? 'Update Career Setup' : 'Start Career'}
        </button>
      </form>
    </section>
  );
}

export default CoachCareerSetupPage;
