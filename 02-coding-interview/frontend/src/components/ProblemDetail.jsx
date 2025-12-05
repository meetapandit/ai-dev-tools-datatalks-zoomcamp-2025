import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function ProblemDetail() {
    const { id } = useParams();
    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState('');
    const [result, setResult] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:8000/problems/${id}`)
            .then(res => res.json())
            .then(data => {
                setProblem(data);
                setCode(data.initial_code);
            })
            .catch(err => console.error(err));
    }, [id]);

    const handleSubmit = async () => {
        const res = await fetch('http://localhost:8000/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, language: 'python' })
        });
        const data = await res.json();
        setResult(data);
    };

    if (!problem) return <div>Loading...</div>;

    return (
        <div className="problem-detail">
            <h1>{problem.title}</h1>
            <p>{problem.description}</p>
            <div className="editor-container">
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
            </div>
            <button onClick={handleSubmit} style={{ marginTop: '1rem' }}>Run Code</button>
            {result && (
                <div className="result" style={{ marginTop: '1rem', padding: '1rem', background: '#333', borderRadius: '4px' }}>
                    <h3>Output:</h3>
                    <pre>{result.output}</pre>
                    <p>Status: {result.status}</p>
                </div>
            )}
        </div>
    );
}
