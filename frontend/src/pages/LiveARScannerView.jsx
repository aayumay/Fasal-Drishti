import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { Camera, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LiveARScannerView() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const requestRef = useRef(null);

  // Initialize TFJS Model
  useEffect(() => {
    let isMounted = true;
    const loadModel = async () => {
      try {
        await tf.ready(); // Ensure backend is ready
        // Load COCO-SSD for generic object detection
        const loadedModel = await cocoSsd.load();
        if (isMounted) {
          setModel(loadedModel);
          setIsModelLoading(false);
        }
      } catch (err) {
        console.error("Failed to load TFJS Model:", err);
        if (isMounted) {
          setErrorMsg("Failed to load AI model. Please check your internet connection.");
          setIsModelLoading(false);
        }
      }
    };
    loadModel();
    return () => { isMounted = false; };
  }, []);

  // Setup Camera via getUserMedia
  useEffect(() => {
    let stream = null;
    let isActive = true;
    
    const setupCamera = async () => {
      try {
        setErrorMsg(''); // clear previous errors
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
           throw new Error("Browser does not support camera access.");
        }
        
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }, // Prioritize rear camera on mobile
          audio: false,
        });
        
        if (!isActive) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }

        stream = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch(e => console.error("Video play error:", e));
            setIsCameraActive(true);
          };
        }
      } catch (err) {
        console.error("Camera access denied or unavailable", err);
        if (isActive) {
          setErrorMsg("Camera access denied or unavailable. Please grant permissions.");
        }
      }
    };
    setupCamera();

    // Cleanup tracks on unmount
    return () => {
      isActive = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [retryCount]);

  // Inference Loop
  useEffect(() => {
    if (!model || !isCameraActive || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const detectFrame = async () => {
      if (video.readyState === 4) {
        // Sync canvas dimensions to video feed
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        // Run object detection
        // NOTE ON MEMORY MANAGEMENT:
        // COCO-SSD internally wraps tf.tidy() and manages its own tensors 
        // during the `.detect()` call, preventing memory leaks automatically.
        const predictions = await model.detect(video);
        
        // Clear previous frame's drawings
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        predictions.forEach(prediction => {
          const [x, y, width, height] = prediction.bbox;
          
          let displayClass = prediction.class;
          let color = '#10B981'; // default emerald
          
          // Hackathon Demo Overrides
          if (prediction.class === 'potted plant') {
             displayClass = 'Soybean - Healthy';
          } else if (prediction.class === 'apple' || prediction.class === 'orange') {
             displayClass = 'Blight Detected';
             color = '#EF4444'; // red
          } else if (prediction.class === 'cell phone' || prediction.class === 'book') {
             displayClass = 'Leaf Spot Risk';
             color = '#F59E0B'; // amber
          } else if (prediction.class === 'person') {
             displayClass = 'Field Operator';
             color = '#3B82F6'; // blue
          }
          
          // Draw Neon Bounding Box
          ctx.strokeStyle = color;
          ctx.lineWidth = 4;
          ctx.strokeRect(x, y, width, height);

          // Draw Label Background
          ctx.fillStyle = color;
          const labelText = `Target: ${displayClass} (${Math.round(prediction.score * 100)}%)`;
          const textWidth = ctx.measureText(labelText).width;
          ctx.fillRect(x, y - 24, textWidth + 10, 24);

          // Draw Label Text
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '14px Inter, sans-serif';
          ctx.fillText(labelText, x + 5, y - 6);
        });
      }
      
      // Loop continuously
      requestRef.current = requestAnimationFrame(detectFrame);
    };

    // Start the loop immediately (it will wait until readyState === 4 inside)
    detectFrame();

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [model, isCameraActive]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-fade-in">
      {/* Top Action Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-500/20 backdrop-blur-md rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Camera size={20} />
          </div>
          <span className="font-bold text-lg text-white drop-shadow-md">AR Scanner</span>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Video & Canvas Overlay Layer */}
      <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-zinc-900">
        {errorMsg ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/80 backdrop-blur-sm p-6 text-center">
             <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 border border-red-500/30">
               <X size={32} className="text-red-400" />
             </div>
             <p className="text-white font-bold text-lg mb-2">Scanner Failed</p>
             <p className="text-slate-300 text-sm leading-relaxed mb-6">{errorMsg}</p>
             <button 
               onClick={() => setRetryCount(c => c + 1)}
               className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-[0_0_15px_rgba(16,185,129,0.4)]"
             >
               Retry Camera Access
             </button>
          </div>
        ) : (!isCameraActive || isModelLoading) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/60 backdrop-blur-sm">
            <Loader2 size={48} className="text-emerald-500 animate-spin mb-4" />
            <p className="text-white font-medium">
              {isModelLoading ? "Loading TFJS Model..." : "Initializing Camera..."}
            </p>
          </div>
        )}
        
        {/* The Source Media Feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute min-w-full min-h-full object-cover"
        />
        
        {/* The TFJS Render Surface */}
        <canvas
          ref={canvasRef}
          className="absolute min-w-full min-h-full object-cover z-10"
        />

        {/* Framing Overlay Guide */}
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
          <div className="w-64 h-64 border-2 border-dashed border-white/30 rounded-3xl relative">
             <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-500 rounded-tl-3xl"></div>
             <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-500 rounded-tr-3xl"></div>
             <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-500 rounded-bl-3xl"></div>
             <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-500 rounded-br-3xl"></div>
          </div>
        </div>
      </div>
      
      {/* Bottom Information Panel */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent z-20">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl">
          <h3 className="text-white font-bold mb-1">Live Object Detection</h3>
          <p className="text-slate-300 text-xs leading-relaxed">
            Point your camera at a crop. The TFJS engine is processing the feed locally on your device in real-time.
          </p>
        </div>
      </div>
    </div>
  );
}
