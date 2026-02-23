import { Link } from 'react-router-dom';

function Home() {
  return (
    <section className="card">
      <h2>League Scaffold Ready</h2>
      <p>Explore all 16 conferences, browse teams, and inspect generated roster quality summaries.</p>
      <p>
        <Link to="/conferences">Go to Conferences</Link>
      </p>
    </section>
  );
}

export default Home;
