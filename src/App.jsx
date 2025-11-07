import { useState, useCallback, useEffect, useRef } from "react";

/*
  App.jsx
  - Manual "Generate" button
  - Strength meter (score -> Weak/Medium/Strong + bar)
  - Modern Tailwind styling and improved names
*/

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-/{}[]?~";

function calcStrength({ length, includeNumbers, includeSymbols }) {
  let score = 0;
  if (length >= 8) score += 1;
  if (length >= 12) score += 1;
  if (length >= 16) score += 1;

  const variety = [includeNumbers, includeSymbols].filter(Boolean).length;
  score += variety; // 0..2

  const percent = Math.min(100, Math.round((score / 5) * 100));
  let label = "Very Weak";
  if (percent >= 80) label = "Strong";
  else if (percent >= 50) label = "Medium";
  else if (percent >= 30) label = "Weak";

  return { percent, label };
}

export default function App() {
  const [length, setLength] = useState(12);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef(null);

  // Generate password (manual trigger)
  const generatePassword = useCallback(() => {
    let pool = LETTERS;
    if (includeNumbers) pool += NUMBERS;
    if (includeSymbols) pool += SYMBOLS;

    // Guard
    if (!pool.length) {
      setPassword("");
      return;
    }

    let pass = "";
    for (let i = 0; i < Number(length); i++) {
      const idx = Math.floor(Math.random() * pool.length);
      pass += pool.charAt(idx);
    }
    setPassword(pass);
  }, [length, includeNumbers, includeSymbols]);

  // Generate an initial password on mount
  useEffect(() => {
    generatePassword();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyPassword = useCallback(async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback: select + execCommand (older browsers)
      try {
        passwordRef.current?.select();
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        // swallow
      }
    }
  }, [password]);

  const strength = calcStrength({
    length: Number(length),
    includeNumbers,
    includeSymbols,
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-6">
        <h1 className="text-2xl font-semibold text-white text-center mb-4">
          Password Generator
        </h1>

        {/* Password display */}
        <div className="flex gap-3 items-center bg-white/5 border border-white/6 rounded-lg p-3 mb-3">
          <input
            ref={passwordRef}
            type={showPassword ? "text" : "password"}
            value={password}
            readOnly
            aria-label="Generated password"
            className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-400 outline-none select-all"
            placeholder="Click Generate to create a password"
          />

          <button
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="px-2 py-1 rounded-md text-sm text-slate-200 bg-white/6 hover:bg-white/10 transition"
            title={showPassword ? "Hide" : "Show"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>

          <button
            onClick={copyPassword}
            aria-label="Copy password"
            className={`px-3 py-1 rounded-md text-sm transition flex items-center gap-2 ${
              copied
                ? "bg-emerald-500 text-white"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {copied ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3h8v4M8 21h8a2 2 0 002-2V7a2 2 0 00-2-2H8a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>

        {/* Strength meter */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-slate-300">Strength</span>
            <span className="text-slate-200 font-medium">{strength.label} • {strength.percent}%</span>
          </div>
          <div className="w-full h-2 bg-white/6 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                strength.percent >= 80
                  ? "bg-emerald-400"
                  : strength.percent >= 50
                  ? "bg-yellow-400"
                  : "bg-red-400"}`}
              style={{ width: `${strength.percent}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4 mb-4">
          <div className="flex items-center justify-between gap-4">
            <label className="text-sm text-slate-300">Length: <span className="font-medium text-slate-100">{length}</span></label>
            <input
              type="range"
              min={8}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-2/3 accent-indigo-500"
              aria-label="Password length"
            />
          </div>

          <div className="flex gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-200 bg-white/6 px-3 py-2 rounded-lg w-full">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={() => setIncludeNumbers((v) => !v)}
                className="h-4 w-4"/>
              Include numbers
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-200 bg-white/6 px-3 py-2 rounded-lg w-full">
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={() => setIncludeSymbols((v) => !v)}
                className="h-4 w-4"/>
              Include symbols
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={generatePassword}
            className="flex-1 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium shadow hover:scale-[1.02] active:scale-[0.98] transition"
            aria-label="Generate password"
          >
            Generate
          </button>

          <button
            onClick={() => {
              setLength(12);
              setIncludeNumbers(true);
              setIncludeSymbols(true);
              generatePassword();
            }}
            className="px-4 py-2 rounded-lg bg-white/6 text-slate-100 hover:bg-white/10 transition"
            aria-label="Reset options and generate"
          >
            Reset
          </button>
        </div>

        {/* Small note / tips */}
        <p className="text-xs text-slate-400 mt-3">
          Tip: Use a length of at least <span className="font-medium text-slate-100">12</span> for stronger passwords.
        </p>
      </div>
    </div>
  );
}