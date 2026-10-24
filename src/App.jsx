import { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraStatus, setCameraStatus] = useState('idle');
  const [cameraError, setCameraError] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState('');
  const [captureError, setCaptureError] = useState('');
  const [sessionActive, setSessionActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [saveStatus, setSaveStatus] = useState('');
  useEffect(() => {
    if (!sessionActive) return;

    const intervalId = setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [sessionActive]);


  useEffect(() => {
  if (!sessionActive) return;

  if (cameraStatus !== 'active') {
    setSaveStatus('Start the camera before beginning automatic capture.');
    setSessionActive(false);
    return;
  }

  const captureInterval = setInterval(() => {
    void captureAndSavePhoto();
  }, 10_000);

  return () => clearInterval(captureInterval);
}, [sessionActive, cameraStatus]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function startCamera() {
    setCameraError('');

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('error');
      setCameraError('Camera access is unavailable in this environment.');
      return;
    }

    try {
      setCameraStatus('loading');

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraStatus('active');
    } catch (error) {
      setCameraStatus('error');
      setCameraError(
        error.name === 'NotAllowedError'
          ? 'Camera permission was denied. Allow camera access in macOS settings and try again.'
          : error.name === 'NotFoundError'
            ? 'No camera was found.'
            : `Could not start the camera: ${error.message}`
      );
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraStatus('idle');
    setCameraError('');
  }

  function capturePhoto() {
  const video = videoRef.current;

  if (!video || video.readyState < 2 || !video.videoWidth) {
    setCaptureError('Wait for the live camera preview to be ready.');
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext('2d');

  if (!context) {
    setCaptureError('Could not prepare the photo capture canvas.');
    return;
  }

  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  setCapturedPhoto(canvas.toDataURL('image/jpeg', 0.92));
  setCaptureError('');
}


  function toggleSession() {
    setSessionActive((active) => !active);
  }

  const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
  const seconds = String(elapsedSeconds % 60).padStart(2, '0');

  async function saveCapturedPhoto() {
  if (!capturedPhoto) return;

  if (!window.electronAPI?.savePhoto) {
    setSaveStatus('Electron photo-saving API is unavailable.');
    return;
  }

  try {
    setSaveStatus('Saving photo...');

    const result = await window.electronAPI.savePhoto(capturedPhoto);

    setSaveStatus(`Saved successfully: ${result.filename}`);
  } catch (error) {
    setSaveStatus(`Could not save photo: ${error.message}`);
  }
}
async function captureAndSavePhoto() {
  const video = videoRef.current;

  if (
    !video ||
    video.readyState < 2 ||
    !video.videoWidth
  ) {
    setCaptureError('Camera is not ready for capture.');
    return;
  }

  if (!window.electronAPI?.savePhoto) {
    setSaveStatus('Electron photo-saving API is unavailable.');
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext('2d');

  if (!context) {
    setCaptureError('Could not prepare the capture canvas.');
    return;
  }

  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageData = canvas.toDataURL('image/jpeg', 0.92);

  try {
    const result = await window.electronAPI.savePhoto(imageData);
    setSaveStatus(`Automatically saved: ${result.filename}`);
    setCaptureError('');
  } catch (error) {
    setSaveStatus(`Automatic save failed: ${error.message}`);
  }
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
              className={`camera-video ${cameraStatus === 'active' ? 'visible' : ''}`}
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
                <div className="capture-section">
  <button
    className="session-button"
    onClick={capturePhoto}
    disabled={cameraStatus !== 'active'}
  >
    Capture photo
  </button>

  {captureError && (
    <p className="capture-error">{captureError}</p>
  )}

  {capturedPhoto && (
  <div className="captured-photo">
    <h3>Captured photo</h3>

    <img src={capturedPhoto} alt="Captured camera snapshot" />

    <a
      href={capturedPhoto}
      download={`myathena-photo-${Date.now()}.jpg`}
      className="download-link"
    >
      Download photo
    </a>

    <button
      className="secondary-button"
      onClick={saveCapturedPhoto}
    >
      Save to myAthena folder
    </button>

    {saveStatus && <p>{saveStatus}</p>}

    <button
      className="secondary-button"
      onClick={() => {
        setCapturedPhoto('');
        setSaveStatus('');
        setCaptureError('');
      }}
    >
      Clear photo
    </button>
  </div>
)}
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
              onClick={toggleSession}
              disabled={!sessionActive && cameraStatus !== 'active'}>
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