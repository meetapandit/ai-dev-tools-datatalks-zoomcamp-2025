import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ProblemList from './components/ProblemList';
import ProblemDetail from './components/ProblemDetail';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header style={{ padding: '1rem', borderBottom: '1px solid #333', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="logo" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
            Coding Interview Platform
          </div>
          <nav>
            <Link to="/" style={{ color: 'var(--accent-color)', textDecoration: 'none', marginRight: '1rem' }}>
              Home
            </Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<ProblemList />} />
            <Route path="/problem/:id" element={<ProblemDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
