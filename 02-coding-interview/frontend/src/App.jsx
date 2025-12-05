import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ProblemList from './components/ProblemList';
import ProblemDetail from './components/ProblemDetail';
import './App.css';

function App() {
  return (
    <Router>
      <nav style={{ marginBottom: '2rem', textAlign: 'left' }}>
        <Link to="/" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 'bold' }}>
          &larr; Home
        </Link>
      </nav>
      <Routes>
        <Route path="/" element={<ProblemList />} />
        <Route path="/problem/:id" element={<ProblemDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
