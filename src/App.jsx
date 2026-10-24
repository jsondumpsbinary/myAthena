
import { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const captureBusyRef = useRef(false);

  const [cameraStatus, setCameraStatus] = useState('idle');
  const [cameraError, setCameraError] = useState('');
  const [captureError, setCaptureError] = useState('');
  const [sessionActive, setSessionActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [saveStatus, setSaveStatus] = useState('');

  // Session timer
  useEffect(() => {
    if (!sessionActive) return;

    const timer = setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 60);
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionActive]);

  // Automatic photo capture every 10 seconds
  useEffect(() => {
    if (!sessionActive || cameraStatus !== 'active') return;

    const interval = setInterval(async () => {
      if (captureBusyRef.current) return;

      captureBusyRef.current = true;

      try {
        const imageData = captureCurrentFrame();

        if (!imageData) return;

        const result = await window.electronAPI.savePhoto(imageData);
        setSaveStatus(`Automatically saved: ${result.filename}`);
      } catch (error) {
        setSaveStatus(`Automatic save failed: ${error.message}`);
      } finally {
        captureBusyRef.current = false;
      }
    }, 10_000);

    return () => clearInterval(interval);
  }, [sessionActive, cameraStatus]);

  // Stop camera when the component unmounts
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // Start camera
  async function startCamera() {
    setCameraError('');
    setCameraStatus('loading');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user' },
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      setCameraStatus('active');
    } catch (error) {
  streamRef.current?.getTracks().forEach((track) => track.stop());
  streamRef.current = null;

  setCameraStatus('error');
  setCameraError(`Could not start camera: ${error.message}`);
}
  }

  // Stop camera
  function stopCamera() {
  endSession();

  streamRef.current?.getTracks().forEach((track) => track.stop());

  streamRef.current = null;

  if (videoRef.current) {
    videoRef.current.srcObject = null;
  }

  setCameraStatus('idle');
  setCameraError('');
  setCaptureError('');
}

  // Capture the current video frame
  function captureCurrentFrame() {
    const video = videoRef.current;

    if (!video || video.readyState < 2 || !video.videoWidth) {
      setCaptureError('Camera is not ready.');
      return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');

    if (!context) {
      setCaptureError('Could not capture photo.');
      return null;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    setCaptureError('');
    return canvas.toDataURL('image/jpeg', 0.92);
  }


  // Start and end session
  function startSession() {
    if (cameraStatus !== 'active') return;

    setElapsedSeconds(0);
    setSaveStatus('');
    setSessionActive(true);
  }

  function endSession() {
    setSessionActive(false);
  }

 const hours = String(
  Math.floor(elapsedSeconds / 3600)
).padStart(2, '0');

const minutes = String(
  Math.floor((elapsedSeconds % 3600) / 60)
).padStart(2, '0');

const seconds = String(
  elapsedSeconds % 60
).padStart(2, '0');

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
            Start your camera and prepare your workspace.
          </p>
        </section>

        <section className="camera-card">
          <div className="card-heading">
            <div>
              <h3>Camera preview</h3>
              <p>Connect your camera to view the live feed.</p>
            </div>

            <span className="preview-badge">
              {cameraStatus === 'active' ? 'LIVE' : 'CAMERA'}
            </span>
          </div>

          <div className="camera-preview">
            <video
              ref={videoRef}
              className={`camera-video ${
                cameraStatus === 'active' ? 'visible' : ''
              }`}
              autoPlay
              muted
              playsInline
            />

            {cameraStatus !== 'active' && (
              <div className="camera-placeholder">
                <div className="camera-icon">◎</div>
                <h3>
                  {cameraStatus === 'loading'
                    ? 'Connecting to camera…'
                    : cameraStatus === 'error'
                      ? 'Camera unavailable'
                      : 'Camera not connected'}
                </h3>
                <p>
                  {cameraError ||
                    'Select Start camera to request access to your camera.'}
                </p>
              </div>
            )}
          </div>

          <div className="camera-footer">
              <span>
                {cameraStatus === 'active'
                  ? 'Camera connected'
                  : 'Camera preview status'}
              </span>

              <button
                className="secondary-button"
                onClick={cameraStatus === 'active' ? stopCamera : startCamera}
                disabled={cameraStatus === 'loading'}
              >
                {cameraStatus === 'active' ? 'Stop camera' : 'Start camera'}
              </button>
          </div>

        </section>

        <section className="session-card">
          <div>
            <p className="eyebrow">SESSION TIMER</p>
            <div className="timer">
              {hours}:{minutes}:{seconds}
            </div>
            {/* <p className="timer-description">
              {sessionActive ? 'Session in progress' : 'Time elapsed'}
            </p> */}
          </div>

          <button
            className={`session-button ${
              sessionActive ? 'stop-button' : ''
            }`}
            onClick={sessionActive ? endSession : startSession}
            disabled={!sessionActive && cameraStatus !== 'active'}
          >
            {sessionActive ? 'End session' : 'Start session'}
          </button>
          {saveStatus && <p>{saveStatus}</p>}
        </section>

        <footer className="app-footer">
          myAthena <span>·</span> Development build
        </footer>
      </main>
    </div>
  );
}

export default App;
