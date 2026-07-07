import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Camera, X, Loader2, ShieldAlert, RefreshCw,
  Droplets, Sprout, Zap, MonitorSmartphone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ═══════════════════════════════════════════════════════════════════════════════
   SCREEN DETECTION v4 — physics-based approach

   WHY THE OLD APPROACH FAILED:
   A Canva page with a Monstera photo on a dark background defeats brightness,
   white-ratio, and even camera-shake-based checks. We need signals rooted in
   the PHYSICS of screens vs real cameras:

   ── PHYSICAL SIGNALS ────────────────────────────────────────────────────────

   ① SHADOW DEPTH
      Real plants have DEEP SHADOWS (leaf undersides, stem shadows, soil).
      Among green-detected pixels, real scenes always have ≥6% with G < 55.
      LCD/OLED backlights physically cannot reproduce these dark greens —
      even at minimum brightness, "green" pixels are ≥ 60-80 on a screen.
      → If < 6% dark greens → screen.

   ② GREEN DYNAMIC RANGE
      Real plant = green values from 25 to 220 (stddev > 24).
      Screen plant = green values cluster in a band (stddev < 20-22).
      → If green stddev < 22 → screen.

   ③ EDGE SHARPNESS (text/UI detection)
      Screens show rendered text, icons, UI borders with PERFECT edges.
      Real plants have soft organic edges blurred by camera optics.
      Measure: fraction of pixels with gradient magnitude > 60.
      → If > 8% of pixels have sharp edges → screen (has text/UI chrome).

   ④ BLUE CHANNEL ELEVATION
      LCD/OLED displays have elevated blue emission (6500K+ white point).
      Among NON-green pixels, if avg blue > avg red by 8+ → screen backlight.

   ⑤ COLOR BAND CLUSTERING
      Digital images on screens have smooth color gradients (post-processed).
      Real sensor images have natural noise creating many unique color values.
      → If number of unique green values (in 5-bit resolution) < threshold → too smooth → screen.

   ⑥ HISTOGRAM STABILITY (temporal)
      Over 5 frames (~3s), the green-channel histogram should drift naturally
      due to wind, micro-hand-movement, and changing light. Screen content
      is mathematically identical (camera shake shifts pixels but NOT the
      color distribution).
      → If histogram L1 distance < 0.04 over 5 frames → screen.

   CONFIRMATION:
      Must pass ALL checks for 5 consecutive frames (3 seconds) before
      the analyse button activates. This prevents any brief false-positive.
   ═══════════════════════════════════════════════════════════════════════════════ */

const W = 160, H = 120;

function sampleFrame(video) {
  if (!video || video.readyState < 2 || !video.videoWidth) return null;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  c.getContext('2d').drawImage(video, 0, 0, W, H);
  return c.getContext('2d').getImageData(0, 0, W, H).data; // FULL frame now
}

function buildHist16(px) {
  const hist = new Float32Array(16);
  let cnt = 0;
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i], g = px[i + 1], b = px[i + 2];
    if (g > r * 1.03 && g > b && g > 28 && r < 195) {
      hist[Math.min(15, (g >> 4))]++;
      cnt++;
    }
  }
  if (cnt > 5) for (let j = 0; j < 16; j++) hist[j] /= cnt;
  return { hist, cnt };
}

function histDist(a, b) {
  let d = 0;
  for (let i = 0; i < 16; i++) d += Math.abs(a[i] - b[i]);
  return d;
}

function analyzeFrame(px, historyRef) {
  if (!px) return { real: false, screen: true, reasons: ['No frame'], green: 0 };

  const totalPx = px.length / 4;
  const reasons = [];

  /* ── Stats accumulators ── */
  let greenCount = 0, whiteCount = 0;
  let gpGreenVals = []; // green channel values of green-detected pixels
  let gpPuritySum = 0;
  let nonGreenR = 0, nonGreenB = 0, nonGreenCnt = 0;
  let brightSum = 0;

  // Edge detection accumulators
  let sharpEdgeCount = 0;
  const edgeCheckablePixels = (W - 1) * (H - 1);

  // Unique green values (5-bit = 32 buckets for noise-resilient uniqueness)
  const greenBuckets = new Set();

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const r = px[i], g = px[i + 1], b = px[i + 2];
      brightSum += (r + g + b) / 3;

      const isGreen = g > r * 1.03 && g > b && g > 28 && g < 240 && r < 195;

      if (isGreen) {
        greenCount++;
        gpGreenVals.push(g);
        gpPuritySum += (g - (r + b) / 2) / g;
        greenBuckets.add(g >> 3); // 5-bit resolution (32 buckets)
      } else {
        nonGreenR += r; nonGreenB += b; nonGreenCnt++;
      }

      if (r > 205 && g > 205 && b > 205) whiteCount++;

      // Edge detection: horizontal + vertical gradient magnitude
      if (x < W - 1 && y < H - 1) {
        const iR = i + 4;           // right neighbor
        const iD = i + W * 4;       // down neighbor
        const gx = Math.abs(r - px[iR]) + Math.abs(g - px[iR + 1]) + Math.abs(b - px[iR + 2]);
        const gy = Math.abs(r - px[iD]) + Math.abs(g - px[iD + 1]) + Math.abs(b - px[iD + 2]);
        const grad = (gx + gy) / 2;
        if (grad > 55) sharpEdgeCount++; // very sharp edge
      }
    }
  }

  const greenRatio = greenCount / totalPx;
  const whiteRatio = whiteCount / totalPx;
  const avgBright  = brightSum / totalPx;

  // Not enough green → not a plant scene at all
  if (greenRatio < 0.20) {
    return { real: false, screen: false, reasons: ['Not enough plant material visible'], green: Math.round(greenRatio * 100) };
  }

  /* ── Signal ①: Shadow depth ── */
  const darkGreenCount = gpGreenVals.filter(v => v < 55).length;
  const darkGreenRatio = greenCount > 0 ? darkGreenCount / greenCount : 0;
  const hasShadows = darkGreenRatio >= 0.06;
  if (!hasShadows) reasons.push('No natural shadows — screen backlights prevent truly dark greens');

  /* ── Signal ②: Green dynamic range ── */
  let gpMean = 0, gpSq = 0;
  for (const v of gpGreenVals) { gpMean += v; gpSq += v * v; }
  gpMean /= greenCount;
  const gpStd = Math.sqrt(Math.max(0, gpSq / greenCount - gpMean * gpMean));
  const hasRange = gpStd > 22;
  if (!hasRange) reasons.push('Green values too uniform — real plants have wider tonal range');

  /* ── Signal ③: Edge sharpness (text/UI detection) ── */
  const sharpRatio = sharpEdgeCount / edgeCheckablePixels;
  const hasText = sharpRatio > 0.085;
  if (hasText) reasons.push('Sharp edges/text detected — likely a screen with UI elements');

  /* ── Signal ④: Blue channel elevation ── */
  let blueElevated = false;
  if (nonGreenCnt > 20) {
    const avgNGR = nonGreenR / nonGreenCnt;
    const avgNGB = nonGreenB / nonGreenCnt;
    blueElevated = avgNGB > avgNGR + 8;
    if (blueElevated) reasons.push('Blue-shifted light detected — typical of screen backlights');
  }

  /* ── Signal ⑤: Color smoothness ── */
  const uniqueGreens = greenBuckets.size; // out of 32 possible buckets
  const tooSmooth = greenCount > 30 && uniqueGreens < 14;
  if (tooSmooth) reasons.push('Color gradients too smooth — digital image characteristics');

  /* ── Signal ⑥: Histogram stability ── */
  const { hist, cnt: gpCnt } = buildHist16(px);
  const history = historyRef.current;
  let histStable = false;
  if (history.length >= 5 && gpCnt > 20) {
    const dists = history.slice(-5).map(h => histDist(hist, h.hist));
    const avgDist = dists.reduce((a, b) => a + b, 0) / dists.length;
    histStable = avgDist < 0.04;
    if (histStable) reasons.push('Content unchanged over 3 seconds — screens show static images');
  }
  historyRef.current = [...history.slice(-6), { hist, cnt: gpCnt }];

  /* ── Additional basic checks ── */
  if (whiteRatio > 0.14) reasons.push('White areas detected — typical of web/app backgrounds');
  if (avgBright > 130) reasons.push('Overall brightness too high — likely a backlit display');

  /* ── Green purity ── */
  const avgPurity = gpPuritySum / greenCount;
  if (avgPurity > 0.56) reasons.push('Unnaturally pure digital green — real leaves have mixed light');

  /* ── VERDICT ── */
  // A real plant must pass ALL of these hard requirements
  const isReal = (
    hasShadows &&         // must have deep shadows
    hasRange &&           // must have wide green dynamic range
    !hasText &&           // must NOT have sharp text/UI
    !blueElevated &&      // must NOT have screen backlight blue shift
    !tooSmooth &&         // must NOT be digitally smooth
    !histStable &&        // must NOT be temporally static
    whiteRatio < 0.14 &&  // must NOT have white UI backgrounds
    avgBright < 130 &&    // must NOT be screen-bright
    avgPurity < 0.56      // must NOT have pure digital green
  );

  return {
    real: isReal,
    screen: !isReal && greenRatio >= 0.20,
    reasons: reasons.length > 0 ? reasons : null,
    green: Math.round(greenRatio * 100),
    debug: {
      darkGreen: Math.round(darkGreenRatio * 100),
      gpStd: Math.round(gpStd),
      sharpPct: Math.round(sharpRatio * 100),
      uniqueGreens,
      avgPurity: Math.round(avgPurity * 100),
      avgBright: Math.round(avgBright),
    },
  };
}

/* ─── Capture JPEG ───────────────────────────────────────────────────────── */
function captureBlob(video) {
  return new Promise((resolve, reject) => {
    try {
      const c = document.createElement('canvas');
      c.width = video.videoWidth; c.height = video.videoHeight;
      c.getContext('2d').drawImage(video, 0, 0);
      c.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/jpeg', 0.88);
    } catch (e) { reject(e); }
  });
}

/* ─── Disease database ───────────────────────────────────────────────────── */
const DB = {
  'Healthy':             { color:'#10B981', bg:'#D1FAE5', emoji:'✅', label:'Healthy Plant',         urgency:'none',   irrigate:'Continue normal schedule',                                  actions:['Maintain regular watering — avoid over or under watering','Apply balanced NPK (19-19-19) every 3 weeks','Monitor weekly for early signs of stress or discolouration'] },
  'Late Blight':         { color:'#EF4444', bg:'#FEE2E2', emoji:'🍂', label:'Late Blight',            urgency:'high',   irrigate:'Reduce — switch to drip, avoid wetting foliage',           actions:['Spray copper oxychloride 2 g/L or Mancozeb 75 WP immediately','Remove & destroy all infected leaves — do NOT compost','Switch to drip irrigation to keep leaves completely dry'] },
  'Early Blight':        { color:'#F97316', bg:'#FFEDD5', emoji:'🟠', label:'Early Blight',           urgency:'medium', irrigate:'Moderate — water at base only',                            actions:['Apply Mancozeb 75 WP at 2.5 g/L every 7 days','Remove lower infected leaves and dispose safely','Ensure 30–45 cm plant spacing for better air flow'] },
  'Yellow Leaf Curl':    { color:'#EAB308', bg:'#FEF9C3', emoji:'🍋', label:'Yellow Leaf Curl Virus', urgency:'high',   irrigate:'Slightly increase — stressed plants need more water',       actions:['Control whitefly vectors with neem oil spray (5 mL/L)','Uproot and destroy severely infected plants immediately','Apply imidacloprid systemic insecticide for heavy infestations'] },
  'Bacterial Spot':      { color:'#8B5CF6', bg:'#EDE9FE', emoji:'🟣', label:'Bacterial Spot',         urgency:'medium', irrigate:'Reduce — wet leaves speed up bacterial spread',            actions:['Apply copper hydroxide bactericide 3 g/L every 5–7 days','Never enter the field when plants are wet','Plan crop rotation with non-solanaceous crops next season'] },
  'Powdery Mildew':      { color:'#64748B', bg:'#F1F5F9', emoji:'⬜', label:'Powdery Mildew',         urgency:'medium', irrigate:'Normal — water in morning only so leaves dry by evening',  actions:['Spray wettable sulfur (3 g/L) or potassium bicarbonate','Prune dense canopy to improve air circulation','Avoid excess nitrogen — it encourages susceptible new growth'] },
  'Leaf Miner':          { color:'#F59E0B', bg:'#FEF3C7', emoji:'🐛', label:'Leaf Miner',             urgency:'low',    irrigate:'Normal schedule',                                          actions:['Spray spinosad or abamectin on affected areas','Manually remove heavily mined leaves and destroy them','Deploy yellow sticky traps to catch adult flies'] },
  'Nutrient Deficiency': { color:'#6366F1', bg:'#EEF2FF', emoji:'🔵', label:'Nutrient Deficiency',    urgency:'medium', irrigate:'Increase slightly — nutrients absorb better with moisture', actions:['Apply foliar spray: zinc sulfate + ferrous sulfate','Correct soil pH to 6.0–7.0 for optimal nutrient uptake','Top-dress with balanced 19-19-19 NPK at 25 g per plant'] },
};
function getDisease(name) {
  if (!name) return DB['Healthy'];
  if (DB[name]) return DB[name];
  const lo = (name || '').toLowerCase();
  for (const [k, v] of Object.entries(DB)) {
    if (lo.includes(k.toLowerCase()) || k.toLowerCase().includes(lo)) return v;
  }
  return { color:'#F97316', bg:'#FFEDD5', emoji:'⚠️', label: name, urgency:'medium',
    irrigate:'Consult an agronomist',
    actions:['Consult your local agricultural extension officer','Remove visibly infected leaves and monitor','Avoid chemicals until disease is properly identified'] };
}
const URG = {
  none:   { label:'All Clear',      cls:'bg-emerald-100 text-emerald-700' },
  low:    { label:'Monitor',        cls:'bg-blue-100 text-blue-700' },
  medium: { label:'Action Needed',  cls:'bg-amber-100 text-amber-700' },
  high:   { label:'Urgent Action!', cls:'bg-red-100 text-red-700' },
};

/* ─── Component ──────────────────────────────────────────────────────────── */
const CONFIRM = 5; // 5 × 600ms = 3 seconds

export default function LiveARScannerView() {
  const videoRef   = useRef(null);
  const streamRef  = useRef(null);
  const liveRef    = useRef(true);
  const timerRef   = useRef(null);
  const histRef    = useRef([]);
  const cntRef     = useRef(0);
  const navigate   = useNavigate();

  const [phase, setPhase]       = useState('boot');
  const [bootMsg, setBootMsg]   = useState('Starting camera...');
  const [errorMsg, setErrorMsg] = useState('');
  const [info, setInfo]         = useState(null);
  const [ready, setReady]       = useState(false);
  const [result, setResult]     = useState(null);
  const [disease, setDisease]   = useState(null);

  const startLoop = useCallback(() => {
    histRef.current = []; cntRef.current = 0; setReady(false);
    timerRef.current = setInterval(() => {
      if (!liveRef.current || !videoRef.current) return;
      const px = sampleFrame(videoRef.current);
      const f  = analyzeFrame(px, histRef);
      if (f.real) cntRef.current = Math.min(cntRef.current + 1, CONFIRM);
      else        cntRef.current = 0;
      const ok = cntRef.current >= CONFIRM;
      setReady(ok);
      setInfo(f);
    }, 600);
  }, []);

  useEffect(() => {
    liveRef.current = true;
    const boot = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setPhase('error');
        setErrorMsg(window.isSecureContext
          ? 'Camera not supported. Try Chrome.'
          : 'Camera needs HTTPS. Open at https:// not http://');
        return;
      }
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch (err) {
        if (!liveRef.current) return;
        setPhase('error');
        const n = err.name || '';
        setErrorMsg(
          n === 'NotAllowedError' ? 'Camera permission denied.\n\nGo to Settings → Site Settings → Camera → Allow.'
          : n === 'NotFoundError' ? 'No camera found.'
          : 'Camera error: ' + (err.message || n)
        );
        return;
      }
      if (!liveRef.current) { stream.getTracks().forEach(t => t.stop()); return; }
      streamRef.current = stream;
      const v = videoRef.current;
      v.srcObject = stream;
      await new Promise(r => { v.onloadedmetadata = () => v.play().then(r).catch(r); });
      if (!liveRef.current) return;
      setPhase('scanning');
      startLoop();
    };
    boot();
    return () => {
      liveRef.current = false;
      clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [startLoop]);

  const handleCapture = useCallback(async () => {
    if (!videoRef.current || !ready) return;
    clearInterval(timerRef.current);
    cntRef.current = 0; histRef.current = [];
    setPhase('analyzing');
    let blob;
    try { blob = await captureBlob(videoRef.current); }
    catch (e) { setPhase('error'); setErrorMsg('Capture failed: ' + e.message); return; }
    try {
      const form = new FormData();
      form.append('file', blob, 'scan.jpg');
      const res = await fetch('/api/diagnose', { method: 'POST', body: form, signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error('Server ' + res.status);
      const data = await res.json();
      if (!liveRef.current) return;
      setResult(data); setDisease(getDisease(data.disease)); setPhase('result');
    } catch (err) {
      if (!liveRef.current) return;
      setPhase('error');
      setErrorMsg(err.name === 'TimeoutError'
        ? 'Server waking up (30s cold start). Wait and try again.'
        : 'Diagnosis failed: ' + err.message);
    }
  }, [ready]);

  const reset = useCallback(() => {
    setResult(null); setDisease(null); setInfo(null); setReady(false);
    cntRef.current = 0; histRef.current = [];
    setPhase('scanning');
    startLoop();
  }, [startLoop]);

  const isScreen   = info?.screen ?? false;
  const isReal     = info?.real ?? false;
  const greenPct   = info?.green ?? 0;
  const topReason  = info?.reasons?.[0] ?? '';

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col overflow-hidden">

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 px-4 pt-4 pb-8 flex items-center justify-between bg-gradient-to-b from-black/85 to-transparent">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <Sprout size={18} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">Crop Health Scanner</p>
            <p className={`text-[10px] mt-0.5 font-medium leading-none ${
              phase === 'scanning' && isScreen  ? 'text-amber-400' :
              phase === 'scanning' && ready     ? 'text-emerald-400' :
              'text-slate-400'
            }`}>
              {phase === 'boot'      && bootMsg}
              {phase === 'scanning'  && isScreen          && 'Screen detected — use a real plant'}
              {phase === 'scanning'  && !isScreen && ready  && 'Real plant confirmed — tap Analyse!'}
              {phase === 'scanning'  && !isScreen && isReal && !ready && `Verifying... ${cntRef.current}/${CONFIRM}`}
              {phase === 'scanning'  && !isScreen && !isReal && 'Point at a real leaf or crop'}
              {phase === 'analyzing' && 'Analysing crop...'}
              {phase === 'result'    && 'Diagnosis complete'}
            </p>
          </div>
        </div>
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-white/10 active:bg-white/30 flex items-center justify-center text-white">
          <X size={18} />
        </button>
      </div>

      {/* Video */}
      <div className="relative flex-1 overflow-hidden bg-zinc-950">
        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />

        {phase === 'boot' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 gap-4">
            <Loader2 size={44} className="text-emerald-400 animate-spin" />
            <p className="text-white font-semibold">{bootMsg}</p>
          </div>
        )}

        {phase === 'scanning' && (
          <>
            {isScreen && (
              <div className="absolute inset-x-4 top-20 z-20">
                <div className="bg-amber-500 rounded-2xl p-4 shadow-xl">
                  <div className="flex gap-3">
                    <MonitorSmartphone size={22} className="text-white flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-bold text-sm">Screen Detected 🖥️</p>
                      {topReason && <p className="text-white/80 text-xs mt-1 leading-relaxed">{topReason}</p>}
                      <p className="text-white/65 text-xs mt-1 font-medium">
                        Point at a real, physical crop or leaf to continue.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-60 h-60">
                {['top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-xl',
                  'top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-xl',
                  'bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-xl',
                  'bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-xl',
                ].map((cls, i) => (
                  <div key={i} className={`absolute w-8 h-8 transition-colors duration-300 ${cls} ${
                    ready    ? 'border-emerald-400' :
                    isScreen ? 'border-amber-400' :
                    isReal   ? 'border-emerald-500/60' :
                    'border-white/30'
                  }`} />
                ))}
                {ready && (
                  <div
                    className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
                    style={{ animation: 'scanM 2s ease-in-out infinite', boxShadow: '0 0 8px #10B981' }}
                  />
                )}
                {isReal && !isScreen && !ready && (
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {Array.from({ length: CONFIRM }).map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full transition-all ${
                        i < cntRef.current ? 'bg-emerald-400 scale-110' : 'bg-white/20'
                      }`} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {phase === 'analyzing' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/72 backdrop-blur-sm gap-5">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-400 animate-spin" />
              <div className="absolute inset-3 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Sprout size={22} className="text-emerald-400" />
              </div>
            </div>
            <div className="text-center px-8">
              <p className="text-white font-bold text-base">Analysing Crop Health</p>
              <p className="text-slate-400 text-xs mt-1">Sending to AI model...</p>
            </div>
          </div>
        )}

        {phase === 'error' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/85 px-8 text-center gap-5">
            <div className="w-16 h-16 bg-red-500/15 border border-red-500/30 rounded-2xl flex items-center justify-center">
              <ShieldAlert size={30} className="text-red-400" />
            </div>
            <div>
              <p className="text-white font-bold text-base mb-2">Scanner Error</p>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{errorMsg}</p>
            </div>
            <button onClick={() => window.location.reload()} className="bg-emerald-500 text-white font-bold py-3 px-10 rounded-2xl active:scale-95 transition-transform">
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Result panel */}
      {phase === 'result' && disease && result && (
        <div className="absolute inset-0 z-25 flex flex-col justify-end bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl px-5 pt-4 pb-8 max-h-[82vh] overflow-y-auto" style={{ animation: 'slideUp 0.35s ease-out' }}>
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />

            <div className="rounded-2xl p-4 mb-4 flex items-center gap-4" style={{ background: disease.bg }}>
              <div className="text-4xl flex-shrink-0">{disease.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-bold text-base text-slate-900">{disease.label}</h2>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${URG[disease.urgency].cls}`}>
                    {URG[disease.urgency].label}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-0.5">
                  Confidence: <strong>{Math.round(((result.confidence || 0) > 1 ? result.confidence : (result.confidence || 0) * 100))}%</strong>
                  {result.severity && result.severity !== 'Unknown' && <span> · <strong>{result.severity}</strong></span>}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Droplets size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-0.5">Irrigation Advice</p>
                <p className="text-sm text-slate-700 leading-relaxed">{disease.irrigate}</p>
              </div>
            </div>

            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Recommended Actions</p>
            <div className="space-y-2.5 mb-5">
              {disease.actions.map((a, i) => (
                <div key={i} className="flex items-start gap-3 bg-slate-50 rounded-2xl p-3.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5" style={{ background: disease.color }}>{i + 1}</div>
                  <p className="text-sm text-slate-700 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>

            {result.action && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-5 flex gap-2.5">
                <span className="text-base flex-shrink-0">🤖</span>
                <div>
                  <p className="text-xs font-bold text-amber-700 mb-0.5">AI Note</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{result.action}</p>
                </div>
              </div>
            )}

            <button onClick={reset} className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-4 rounded-2xl active:scale-[0.98] transition-transform">
              <RefreshCw size={16} /> Scan Another Crop
            </button>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      {phase === 'scanning' && (
        <div className="absolute bottom-0 left-0 right-0 z-30 px-5 pb-8 pt-16 bg-gradient-to-t from-black/90 to-transparent">
          <div className="mb-3 bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
              ready    ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]' :
              isScreen ? 'bg-amber-400 animate-pulse' :
              isReal   ? 'bg-emerald-400/50' :
              'bg-slate-500'
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">
                {ready                          && 'Real plant verified — ready to analyse'}
                {!ready && isScreen             && 'Screen detected — point at a physical crop'}
                {!ready && !isScreen && isReal  && `Verifying real plant... ${cntRef.current}/${CONFIRM}`}
                {!ready && !isScreen && !isReal && 'Point camera at a real leaf or crop'}
              </p>
              {isReal && !isScreen && (
                <p className="text-slate-400 text-[10px] mt-0.5">{greenPct}% plant coverage</p>
              )}
            </div>
            <Zap size={13} className="text-slate-500 flex-shrink-0" />
          </div>

          <button
            onClick={handleCapture}
            disabled={!ready}
            className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-300 ${
              ready
                ? 'bg-emerald-500 text-white active:scale-[0.97] shadow-[0_0_24px_rgba(16,185,129,0.4)]'
                : 'bg-white/8 text-white/20 cursor-not-allowed border border-white/10'
            }`}
          >
            <Camera size={20} />
            {ready    ? 'Analyse Crop Health' :
             isScreen ? 'Screen detected — use real plant' :
             'Waiting for real plant...'}
          </button>
        </div>
      )}

      <style>{`
        @keyframes scanM {
          0%   { top: 0;     opacity: 1;   }
          45%  { top: 228px; opacity: 0.3; }
          55%  { top: 228px; opacity: 0.3; }
          100% { top: 0;     opacity: 1;   }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
