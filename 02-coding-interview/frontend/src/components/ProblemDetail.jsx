import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';

const LANGUAGES = [
    { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' }
];

export default function ProblemDetail() {
    const { id } = useParams();
    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [status, setStatus] = useState('');
    const [language, setLanguage] = useState('python');

    const [pyodide, setPyodide] = useState(null);
    const [pyodideLoading, setPyodideLoading] = useState(true);

    const ws = useRef(null);
    const isLocalChange = useRef(false);

    // Load Problem
    useEffect(() => {
        fetch(`/problems/${id}`)
            .then(res => res.json())
            .then(data => {
                setProblem(data);
                // Set initial code for default language (python)
                if (data.starter_codes && data.starter_codes['python']) {
                    setCode(data.starter_codes['python']);
                }
            })
            .catch(err => console.error(err));
    }, [id]);

    // Load Pyodide (only once)
    useEffect(() => {
        async function initPyodide() {
            try {
                if (!window.pyodide) { // Check if already loaded to avoid errors
                    const py = await window.loadPyodide();
                    window.pyodide = py; // Cache in window
                    setPyodide(py);
                } else {
                    setPyodide(window.pyodide);
                }
                setPyodideLoading(false);
            } catch (e) {
                console.error("Failed to load pyodide", e);
                // Don't set error status globally, just for Pyodide features
                setPyodideLoading(false);
            }
        }
        initPyodide();
    }, []);

    // WebSocket Connection
    useEffect(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/${id}`;
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            console.log('Connected to WebSocket');
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // Only update if it's for the current language
            if (data.language === language) {
                const newCode = data.code;
                if (newCode !== code) {
                    isLocalChange.current = false;
                    setCode(newCode);
                }
            }
        };

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [id, language]); // Re-connect or at least re-bind listener if logic depended on state, but here simple broadcast

    const handleEditorChange = (value) => {
        setCode(value);
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            // Send object with language
            ws.current.send(JSON.stringify({ code: value, language: language }));
        }
    };

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        if (problem && problem.starter_codes && problem.starter_codes[newLang]) {
            setCode(problem.starter_codes[newLang]);
        } else {
            setCode('');
        }
        setOutput('');
        setStatus('');
    };

    const runCode = async () => {
        setStatus('Running...');
        setOutput('');

        try {
            if (language === 'python') {
                if (!pyodide) {
                    setStatus('Pyodide not loaded');
                    return;
                }
                let capturedOutput = "";
                pyodide.setStdout({ batched: (msg) => capturedOutput += msg + "\n" });
                await pyodide.runPythonAsync(code);
                setOutput(capturedOutput);
                setStatus('Success');

            } else if (language === 'javascript') {
                // Unsafe eval for demo purposes
                let logs = [];
                const originalLog = console.log;
                console.log = (...args) => logs.push(args.join(' '));

                try {
                    // eslint-disable-next-line no-eval
                    eval(code);
                    setOutput(logs.join('\n'));
                    setStatus('Success');
                } catch (e) {
                    setOutput(e.toString());
                    setStatus('Error');
                } finally {
                    console.log = originalLog;
                }

            } else {
                // Enforce browser-only execution
                setOutput(`Browser-side execution for ${LANGUAGES.find(l => l.id === language)?.name} is not implemented yet.\n\nPlease select Python or JavaScript to execute code in the browser.`);
                setStatus('Not Supported');
            }

        } catch (err) {
            setOutput(err.toString());
            setStatus('Error');
        }
    };

    if (!problem) return <div>Loading...</div>;

    return (
        <div className="problem-detail" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '1rem', boxSizing: 'border-box' }}>
            <div style={{ flex: '0 0 auto', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: 0 }}>{problem.title}</h1>
                    <p style={{ margin: 0 }}>{problem.description}</p>
                </div>
                <div>
                    <select
                        value={language}
                        onChange={handleLanguageChange}
                        style={{ padding: '0.5rem', borderRadius: '4px', background: '#333', color: 'white', border: '1px solid #555' }}
                    >
                        {LANGUAGES.map(lang => (
                            <option key={lang.id} value={lang.id}>{lang.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{ display: 'flex', flex: 1, gap: '1rem' }}>
                <div style={{ flex: 2, border: '1px solid #444', borderRadius: '4px', overflow: 'hidden' }}>
                    <Editor
                        height="100%"
                        language={language} // Monaco language
                        theme="vs-dark"
                        value={code}
                        onChange={handleEditorChange}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                        }}
                    />
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ flex: '0 0 auto' }}>
                        <button onClick={runCode} disabled={status === 'Running...'}>
                            {status === 'Running...' ? 'Running...' : `Run ${LANGUAGES.find(l => l.id === language)?.name}`}
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
