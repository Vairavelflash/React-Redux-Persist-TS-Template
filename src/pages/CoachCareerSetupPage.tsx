import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeCareerSetup, setCoachProfile } from '../features/coach/coachSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

type Archetype = 'RECRUITER' | 'TACTICIAN' | 'DEVELOPER';

const archetypeOptions: Array<{
  value: Archetype;
  label: string;
  summary: string;
  bonuses: string[];
  tradeoff: string;
}> = [
  {
    value: 'RECRUITER',
    label: 'Recruiter',
    summary: 'Build rosters through elite talent acquisition.',
    bonuses: ['+15% weekly recruiting interest', 'Faster verbal commitments', 'Broader national reach'],
    tradeoff: 'Lower in-game tactical edge',
  },
  {
    value: 'TACTICIAN',
    label: 'Tactician',
    summary: 'Win through scheme, preparation, and player management.',
    bonuses: ['20% less team fatigue build-up', 'In-game prep advantage', 'Better tactics-to-outcome translation'],
    tradeoff: 'Slower recruiting momentum early',
  },
  {
    value: 'DEVELOPER',
    label: 'Developer',
    summary: 'Turn overlooked prospects into program cornerstones.',
    bonuses: ['Better 3★ recruit outcomes', 'Signed players develop faster', 'Strong loyalty retention'],
    tradeoff: 'Slower early-season commitment pace',
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
  const [archetype, setArchetype] = useState<Archetype>(coach.profile?.archetype ?? 'RECRUITER');
  const [coachAge, setCoachAge] = useState(coach.profile?.age ?? 38);
  const [coachSkill, setCoachSkill] = useState(coach.profile?.skill ?? 72);
  const [teamId, setTeamId] = useState(coach.selectedTeamId ?? '');

  const conferenceById = useMemo(
    () => new Map(conferences.map((c) => [c.id, c.name])),
    [conferences],
  );

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

    const selectedTeam = teams.find((t) => t.id === teamId);
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

  const team = teams.find((t) => t.id === teamId) ?? null;
  const teamExpectations = team ? buildProgramExpectations(team.prestige) : null;
  const canContinue =
    coachName.trim().length > 1 &&
    almaMater.trim().length > 1 &&
    coachAge >= 24 &&
    coachAge <= 75 &&
    coachSkill >= 40 &&
    coachSkill <= 99 &&
    Boolean(teamId);

  const selectedArchetypeOption = archetypeOptions.find((o) => o.value === archetype)!;

  return (
    <section>
      <h2>Coach Career Setup</h2>
      <p className="mutedText">Create your coach, pick an archetype, and choose a program to build.</p>

      <form className="card" onSubmit={onStartCareer}>
        <div className="grid2">
          <label>
            Coach Name
            <input
              value={coachName}
              onChange={(e) => setCoachName(e.target.value)}
              placeholder="Avery Stone"
            />
          </label>
          <label>
            Alma Mater
            <input
              value={almaMater}
              onChange={(e) => setAlmaMater(e.target.value)}
              placeholder="Bay State"
            />
          </label>
        </div>

        <div className="grid2">
          <label>
            Coach Age
            <input
              type="number"
              min={24}
              max={75}
              value={coachAge}
              onChange={(e) => setCoachAge(Number(e.target.value))}
            />
          </label>
          <label>
            Coach Skill (40–99)
            <input
              type="number"
              min={40}
              max={99}
              value={coachSkill}
              onChange={(e) => setCoachSkill(Number(e.target.value))}
            />
            <small className="mutedText" style={{ display: 'block', marginTop: 4 }}>
              Higher skill improves recruiting and game outcomes.
            </small>
          </label>
        </div>

        {/* Archetype cards */}
        <div style={{ marginTop: 12 }}>
          <div className="text-sm font-semibold mb-2">Coaching Archetype</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {archetypeOptions.map((option) => {
              const isSelected = archetype === option.value;
              return (
                <div
                  key={option.value}
                  onClick={() => setArchetype(option.value)}
                  style={{
                    border: isSelected ? '2px solid #2563eb' : '2px solid #e5e7eb',
                    borderRadius: 8,
                    padding: '12px 14px',
                    cursor: 'pointer',
                    background: isSelected ? '#eff6ff' : '#fff',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: isSelected ? '#2563eb' : '#d1d5db',
                        flexShrink: 0,
                      }}
                    />
                    <span className="font-bold text-sm">{option.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{option.summary}</p>
                  <ul className="text-xs space-y-0.5 mb-2">
                    {option.bonuses.map((b, i) => (
                      <li key={i} className="text-green-700 flex gap-1">
                        <span>+</span><span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-xs text-amber-600">− {option.tradeoff}</div>
                </div>
              );
            })}
          </div>
          {selectedArchetypeOption && (
            <p className="mutedText" style={{ marginTop: 8, fontSize: 12 }}>
              Selected: <strong>{selectedArchetypeOption.label}</strong> — {selectedArchetypeOption.summary}
            </p>
          )}
        </div>

        <label style={{ marginTop: 12 }}>
          Program
          <select value={teamId} onChange={(e) => setTeamId(e.target.value)}>
            <option value="">Select a team</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.schoolName} {t.nickname} ({conferenceById.get(t.conferenceId) ?? t.conferenceId})
              </option>
            ))}
          </select>
        </label>

        {team && teamExpectations && (
          <div className="setupSummary" style={{ marginTop: 8 }}>
            <p>
              <strong>{team.schoolName} {team.nickname}</strong> &bull; Prestige {team.prestige} &bull; {team.region}
            </p>
            <p className="mutedText">Tier: <strong>{teamExpectations.careerTier}</strong></p>
            <p className="mutedText">
              Year 1 targets: {teamExpectations.programExpectations.winTarget}+ wins, Top {teamExpectations.programExpectations.rankTarget}
            </p>
            <p className="mutedText">
              Starting job security: {teamExpectations.programExpectations.securityBaseline}%
            </p>
          </div>
        )}

        <button type="submit" disabled={!canContinue} style={{ marginTop: 16 }}>
          {coach.onboardingStep === 'READY' ? 'Update Career Setup' : 'Start Career'}
        </button>
      </form>
    </section>
  );
}

export default CoachCareerSetupPage;
