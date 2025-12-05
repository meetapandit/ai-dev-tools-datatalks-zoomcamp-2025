import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';

export default function ProblemDetail() {
    const { id } = useParams();
    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [status, setStatus] = useState('');
    const [pyodide, setPyodide] = useState(null);
    const [pyodideLoading, setPyodideLoading] = useState(true);

    const ws = useRef(null);
    const isLocalChange = useRef(false);

    // Load Problem
    useEffect(() => {
        fetch(`http://localhost:8000/problems/${id}`)
            .then(res => res.json())
            .then(data => {
                setProblem(data);
                if (!code) setCode(data.initial_code);
            })
            .catch(err => console.error(err));
    }, [id]);

    // Load Pyodide
    useEffect(() => {
        async function initPyodide() {
            try {
                const py = await window.loadPyodide();
                setPyodide(py);
                setPyodideLoading(false);
            } catch (e) {
                console.error("Failed to load pyodide", e);
                setStatus("Failed to load Python environment");
                setPyodideLoading(false);
            }
        }
        initPyodide();
    }, []);

    // WebSocket Connection
    useEffect(() => {
        ws.current = new WebSocket(`ws://localhost:8000/ws/${id}`);

        ws.current.onopen = () => {
            console.log('Connected to WebSocket');
        };

        ws.current.onmessage = (event) => {
            const newCode = event.data;
            if (newCode !== code) {
                isLocalChange.current = false;
                setCode(newCode);
            }
        };

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [id]);

    const handleEditorChange = (value) => {
        if (isLocalChange.current === false) {
            isLocalChange.current = true; // Reset flag if it was an external update
            return;
        }
        setCode(value);
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            // Simple broadcast, in production use debouncing
            ws.current.send(value);
        }
    };

    // Fix for the loop issue: We need to know if the change to `code` came from user typing or WebSocket.
    // The `Editor` component's `onChange` is triggered by user.
    // When we `setCode` from WebSocket, the `value` prop updates the editor.
    // It shouldn't trigger `onChange` usually in Monaco (unlike some inputs).
    // But let's verify. Monaco React's `onChange` is usually only user interactions.

    const runCode = async () => {
        if (!pyodide) return;
        setStatus('Running...');
        setOutput('');

        try {
            // Capture stdout
            let capturedOutput = "";
            pyodide.setStdout({ batched: (msg) => capturedOutput += msg + "\n" });

            await pyodide.runPythonAsync(code);

            setOutput(capturedOutput);
            setStatus('Success');
        } catch (err) {
            setOutput(err.toString());
            setStatus('Error');
        }
    };

    if (!problem) return <div>Loading...</div>;

    return (
        <div className="problem-detail" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '1rem', boxSizing: 'border-box' }}>
            <div style={{ flex: '0 0 auto', marginBottom: '1rem' }}>
                <h1>{problem.title}</h1>
                <p>{problem.description}</p>
            </div>

            <div style={{ display: 'flex', flex: 1, gap: '1rem' }}>
                <div style={{ flex: 2, border: '1px solid #444', borderRadius: '4px', overflow: 'hidden' }}>
                    <Editor
                        height="100%"
                        defaultLanguage="python"
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => {
                            setCode(value);
                            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                                ws.current.send(value);
                            }
                        }}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                        }}
                    />
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ flex: '0 0 auto' }}>
                        <button onClick={runCode} disabled={pyodideLoading || status === 'Running...'}>
                            {pyodideLoading ? 'Loading Python...' : 'Run Code'}
                        </button>
                    </div>

                    <div style={{ flex: 1, background: '#1e1e1e', borderRadius: '4px', padding: '1rem', overflow: 'auto', border: '1px solid #444', textAlign: 'left', fontFamily: 'monospace' }}>
                        <div style={{ borderBottom: '1px solid #333', paddingBottom: '0.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            Output
                        </div>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{output}</pre>
                        <div style={{ marginTop: '0.5rem', color: status === 'Error' ? '#ff6b6b' : '#51cf66', fontSize: '0.8rem' }}>
                            {status && `Status: ${status}`}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
