import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [sessionActive, setSessionActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!sessionActive) return;

    const intervalId = setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [sessionActive]);

  const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
  const seconds = String(elapsedSeconds % 60).padStart(2, '0');

  function handleSessionToggle() {
    setSessionActive((active) => !active);
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">A</div>
          <div>
            <h1>myAthena</h1>
            <p>Camera Test Workspace</p>
          </div>
        </div>

        <div className="connection-status">
          <span className={`status-dot ${sessionActive ? 'active' : ''}`} />
          {sessionActive ? 'Session active' : 'Ready to begin'}
        </div>
      </header>

      <main className="workspace">
        <section className="welcome-section">
          <p className="eyebrow">WORKSPACE</p>
          <h2>Your testing space</h2>
          <p className="subtitle">
            Start a session and prepare your camera workspace.
          </p>
        </section>

        <section className="camera-card">
          <div className="card-heading">
            <div>
              <h3>Camera preview</h3>
              <p>Your live camera feed will appear here.</p>
            </div>
            <span className="preview-badge">PREVIEW</span>
          </div>

          <div className="camera-preview">
            <div className="camera-placeholder">
              <div className="camera-icon">◎</div>
              <h3>Camera not connected</h3>
              <p>
                Camera access will be added in our next implementation phase.
              </p>
            </div>
          </div>

          <div className="camera-footer">
            <span>Camera integration pending</span>
            <span className="footer-indicator">●</span>
          </div>
        </section>

        <section className="session-card">
          <div>
            <p className="eyebrow">SESSION TIMER</p>
            <div className="timer">
              {minutes}:{seconds}
            </div>
            <p className="timer-description">
              {sessionActive ? 'Session in progress' : 'Time elapsed'}
            </p>
          </div>

          <button
            className={`session-button ${sessionActive ? 'stop-button' : ''}`}
            onClick={handleSessionToggle}
          >
            {sessionActive ? 'End session' : 'Start session'}
          </button>
        </section>

        <footer className="app-footer">
          myAthena <span>·</span> Development build
        </footer>
      </main>
    </div>
  );
}

export default App;