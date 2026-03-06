import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as faceapi from "face-api.js";

const VoterRegistration = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  const [registrationNumber, setRegistrationNumber] = useState("");
  const [fullName, setFullName] = useState("");

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------------- Load face-api models ---------------- */
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
    };
    loadModels();
  }, []);

  /* ---------------- Start Camera ---------------- */
  const startCamera = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraActive(true);
    } catch (err) {
      setError("Camera access denied. " + err.message);
    }
  };

  /* ---------------- Stop Camera ---------------- */
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    setCameraActive(false);
  };

  /* ---------------- Capture Face ---------------- */
  const captureFace = async () => {
    setError("");

    if (!modelsLoaded) return setError("Models are still loading...");
    if (!videoRef.current) return setError("Camera not ready");

    try {
      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        return setError("No face detected. Try again.");
      }

      const descriptorArray = Array.from(detection.descriptor);
      console.log("Face descriptor:", descriptorArray);

      setFaceDescriptor(descriptorArray);
      stopCamera();
    } catch (err) {
      setError("Failed to capture face. " + err.message);
    }
  };

  /* ---------------- Register Voter ---------------- */
  const handleRegistration = async () => {
    setError("");
    setLoading(true);

    try {
      if (!registrationNumber || !fullName || !faceDescriptor) {
        throw new Error("All fields and face capture are required.");
      }

      const res = await fetch("http://localhost:5555/auth/voter/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationNumber,
          fullName,
          faceDescriptor,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message);

      alert("Voter registered successfully!");
      navigate("/voter-login");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center">Voter Registration</h2>
        <p className="text-center text-blue-500 mb-6">
          Register to participate in voting
        </p>

        {error && (
          <p className="text-red-600 text-sm text-center mb-3">{error}</p>
        )}

        <label className="block text-sm font-medium mb-1">
          Registration Number
        </label>
        <input
          className="w-full border rounded-md px-3 py-2 mb-4"
          value={registrationNumber}
          onChange={(e) => setRegistrationNumber(e.target.value)}
        />

        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input
          className="w-full border rounded-md px-3 py-2 mb-4"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        {!faceDescriptor && (
          <button
            onClick={cameraActive ? captureFace : startCamera}
            disabled={!modelsLoaded}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            {cameraActive ? "Take Photo" : "Capture Image"}
          </button>
        )}

        <div className="mt-4">
          <video
            ref={videoRef}
            muted
            className={`w-full rounded-md border ${
              cameraActive ? "block" : "hidden"
            }`}
          />
        </div>

        {faceDescriptor && (
          <p className="text-green-600 text-sm text-center mt-3">
            Face captured successfully
          </p>
        )}

        <button
          onClick={handleRegistration}
          disabled={loading}
          className="w-full mt-5 bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </div>
    </div>
  );
};

export default VoterRegistration;