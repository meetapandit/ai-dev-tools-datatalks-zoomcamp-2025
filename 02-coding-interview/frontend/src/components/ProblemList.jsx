import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ProblemList() {
    const [problems, setProblems] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8000/problems')
            .then(res => res.json())
            .then(data => setProblems(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            <h1>Coding Problems</h1>
            <div className="problem-list">
                {problems.map(p => (
                    <Link key={p.id} to={`/problem/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="card">
                            <h2>{p.title}</h2>
                            <p>{p.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
