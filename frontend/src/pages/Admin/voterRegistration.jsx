import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as faceapi from "face-api.js";
import toast from "react-hot-toast";


const FieldIcon = ({ children }) => (
  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-700 pointer-events-none">
    {children}
  </span>
);

const IconId = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 3H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
    <path d="M10 8h4" />
    <path d="M10 12h4" />
  </svg>
);

const IconUser = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
  </svg>
);

const IconCamera = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <path d="M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
  </svg>
);

const IconCheck = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879A1 1 0 003.293 9.293l4 4a1 1 0 001.414 0l8-8z"
      clipRule="evenodd"
    />
  </svg>
);

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
  /* toast setter for errors */
  useEffect(() => {
    if (!error) return;
    toast.error(error, { id: "voter-registration-error" });
  }, [error]);
  /*  Load face-api models*/
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

  /*  Start Camera  */
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

  /*  Stop Camera  */
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setCameraActive(false);
  };

  /*  Capture Face  */
  const captureFace = async () => {
    setError("");
    if (!modelsLoaded) return setError("Models are still loading...");
    if (!videoRef.current) return setError("Camera not ready");

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) return setError("No face detected. Try again.");

      const descriptorArray = Array.from(detection.descriptor);
      console.log("Face descriptor:", descriptorArray);

      setFaceDescriptor(descriptorArray);
      stopCamera();
    } catch (err) {
      setError("Failed to capture face. " + err.message);
    }
  };

  /*  Register Voter  */
  const handleRegistration = async () => {
    setError("");
    setLoading(true);

    try {
      if (!registrationNumber || !fullName || !faceDescriptor) {
        throw new Error("All fields and face capture are required.");
      }

      const adminToken = localStorage.getItem("adminToken"); 

      const res = await fetch("http://localhost:5555/admin/registervoter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          registrationNumber,
          fullName,
          faceDescriptor,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message);

      alert("Voter registered successfully!");
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /*  UI  */
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-100 shadow-sm bg-white">
        <div className="relative p-7 sm:p-10">
          <div
            className="absolute left-0 top-0 bottom-0 w-1.5"
            style={{ backgroundColor: "#66c743" }}
          />

          <div className="pl-2">
            <div className="mb-7">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-brand-50 border border-brand-200 px-3 py-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: "#66c743" }}
                />
                <span className="text-xs font-extrabold text-brand-800 uppercase tracking-wider">
                  Voter registration
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">
                Add voter
              </h1>
              <p className="text-sm text-slate-600 font-semibold mt-1">
                Enter details and capture an image.
              </p>
            </div>


            <div className="space-y-4">
              <div>
                <label className="app-label">Registration number</label>
                <div className="relative">
                  <FieldIcon>
                    <IconId />
                  </FieldIcon>
                  <input
                    className="app-input pl-10"
                    placeholder="SC200/0000/2018"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="app-label">Full name</label>
                <div className="relative">
                  <FieldIcon>
                    <IconUser />
                  </FieldIcon>
                  <input
                    className="app-input pl-10"
                    placeholder="Enter voter full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="app-label">Face capture</label>

                <div
                  className={[
                    "rounded-2xl overflow-hidden border border-slate-100 bg-brand-50/40",
                    cameraActive ? "block" : "hidden",
                  ].join(" ")}
                >
                  <div className="relative">
                    <video ref={videoRef} muted className="w-full" />
                    <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-xl bg-white/90 border border-slate-100 px-3 py-1.5 text-xs font-extrabold text-slate-700">
                      <IconCamera className="w-4 h-4 text-brand-700" />
                      Camera
                    </div>
                  </div>

                  <div className="p-3 bg-white/80 border-t border-slate-100">
                    <button
                      onClick={captureFace}
                      className="app-btnPrimary w-full py-3 rounded-2xl"
                    >
                      Take photo
                    </button>
                  </div>
                </div>

                {!cameraActive && (
                  <button
                    onClick={() => {
                      if (faceDescriptor) {
                        setFaceDescriptor(null);
                        startCamera();
                      } else {
                        startCamera();
                      }
                    }}
                    disabled={!modelsLoaded}
                    className={[
                      "w-full py-3 rounded-2xl text-sm font-extrabold border transition-colors inline-flex items-center justify-center gap-2",
                      !modelsLoaded
                        ? "bg-slate-200 text-slate-500 border-slate-200 cursor-not-allowed"
                        : faceDescriptor
                        ? "bg-brand-50 text-brand-800 border-brand-200 hover:bg-brand-100/60"
                        : "bg-white text-brand-800 border-brand-200 hover:bg-brand-50/60",
                    ].join(" ")}
                  >
                    <IconCamera className="w-4 h-4" />
                    {faceDescriptor ? "Retake image" : "Open camera"}
                  </button>
                )}

                {faceDescriptor && (
                  <div className="mt-3 rounded-2xl bg-brand-50 border border-brand-200 px-4 py-3 text-sm font-semibold text-brand-800 flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-brand-500 text-white">
                      <IconCheck className="w-4 h-4" />
                    </span>
                    Face captured successfully
                  </div>
                )}
              </div>

              <div className="h-px bg-slate-100" />

              <button
                onClick={handleRegistration}
                disabled={loading}
                className={
                  loading
                    ? "app-btnDisabled w-full py-3 rounded-2xl"
                    : "app-btnPrimary w-full py-3 rounded-2xl"
                }
              >
                {loading ? "Registering..." : "Register voter"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoterRegistration;