import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function ConcentrationSelectPage() {
  const navigate = useNavigate();
  const { primaryConcs, setPrimaryConcs, secondary, setSecondary, selectedTracks, setSelectedTrack } = useApp();
  const [step, setStep] = useState(1);
  const [concentrations, setConcentrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tracksMap, setTracksMap] = useState({});

  useEffect(() => {
    fetch("/api/concentrations")
      .then((r) => r.json())
      .then((data) => setConcentrations(data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (step !== 3) return;
    primaryConcs.forEach((conc) => {
      if (!tracksMap[conc.name]) {
        fetch(`/api/tracks/${encodeURIComponent(conc.name)}`)
          .then((r) => r.json())
          .then((tracks) => {
            setTracksMap((prev) => ({ ...prev, [conc.name]: tracks }));
            if (tracks.length === 1) setSelectedTrack(conc.name, tracks[0].track);
          });
      }
    });
  }, [step, primaryConcs]);

  function togglePrimary(conc) {
    setPrimaryConcs((prev) => {
      if (prev.find((c) => c.name === conc.name)) return prev.filter((c) => c.name !== conc.name);
      if (prev.length >= 2) return prev;
      return [...prev, conc];
    });
  }

  function toggleSecondary(conc) {
    setSecondary((prev) => (prev?.name === conc.name ? null : conc));
  }

  const secondaryOptions = concentrations.filter(
    (c) => !primaryConcs.find((p) => p.name === c.name)
  );

  const allTracksSelected = primaryConcs.every(
    (c) => !!selectedTracks[c.name]
  );

  const progress = step === 1 ? 25 : step === 2 ? 50 : 75;

  function shortTrackLabel(track) {
    return track
      .replace("— A.B. Requirements", "A.B.")
      .replace("— S.B. Requirements", "S.B.")
      .replace(" Requirements", "")
      .replace(" Track", "")
      .replace("Standard — Concentration", "Standard")
      .trim();
  }

  return (
    <div className="min-h-screen bg-[#eeede9]">
      <div className="max-w-2xl mx-auto bg-white min-h-screen px-7 py-8">

        <div className="flex items-center gap-2 mb-8">
          <BookOpen className="w-5 h-5 text-crimson-600" />
          <span className="text-sm font-medium text-gray-700">Harvard Course Planner</span>
        </div>

        <div className="h-0.5 bg-gray-200 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-crimson-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {step === 1 && (
          <>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-7 h-7 rounded-full bg-crimson-600 text-white text-xs font-medium flex items-center justify-center shrink-0">1</div>
              <h1 className="text-xl font-medium text-gray-900">Choose your concentration</h1>
            </div>
            <p className="text-sm text-gray-400 mb-7 pl-10">Select up to two concentrations</p>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-crimson-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mb-8">
                {concentrations.map((c) => {
                  const selected = !!primaryConcs.find((p) => p.name === c.name);
                  const disabled = !selected && primaryConcs.length >= 2;
                  return (
                    <button
                      key={c.name}
                      onClick={() => !disabled && togglePrimary(c)}
                      className={`px-4 py-2 rounded-full text-sm border transition-all ${
                        selected
                          ? "bg-crimson-600 border-crimson-600 text-white"
                          : disabled
                          ? "border-gray-200 text-gray-300 cursor-not-allowed"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                disabled={primaryConcs.length === 0}
                onClick={() => setStep(2)}
                className="px-7 py-2.5 bg-crimson-600 text-white text-sm font-medium rounded-lg disabled:opacity-30 hover:opacity-85 transition-opacity"
              >
                Continue
              </button>
              <span className="text-xs text-gray-400">{primaryConcs.length} of 2 selected</span>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-7 h-7 rounded-full bg-crimson-600 text-white text-xs font-medium flex items-center justify-center shrink-0">2</div>
              <h1 className="text-xl font-medium text-gray-900">Add a secondary?</h1>
            </div>
            <p className="text-sm text-gray-400 mb-7 pl-10">Choose one secondary field, or skip</p>

            <div className="flex flex-wrap gap-2 mb-8">
              {secondaryOptions.map((c) => {
                const selected = secondary?.name === c.name;
                return (
                  <button
                    key={c.name}
                    onClick={() => toggleSecondary(c)}
                    className={`px-4 py-2 rounded-full text-sm border transition-all ${
                      selected
                        ? "bg-crimson-600 border-crimson-600 text-white"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setStep(3)}
                className="px-7 py-2.5 bg-crimson-600 text-white text-sm font-medium rounded-lg hover:opacity-85 transition-opacity"
              >
                Continue
              </button>
              <button
                onClick={() => { setSecondary(null); setStep(3); }}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={() => setStep(1)}
                className="ml-auto text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← Back
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-7 h-7 rounded-full bg-crimson-600 text-white text-xs font-medium flex items-center justify-center shrink-0">3</div>
              <h1 className="text-xl font-medium text-gray-900">Which track are you on?</h1>
            </div>
            <p className="text-sm text-gray-400 mb-7 pl-10">Select a track for each concentration</p>

            <div className="flex flex-col gap-7 mb-8">
              {primaryConcs.map((conc) => {
                const tracks = tracksMap[conc.name];
                return (
                  <div key={conc.name}>
                    <p className="text-sm font-medium text-gray-700 mb-2.5">{conc.name}</p>
                    {!tracks ? (
                      <div className="w-5 h-5 border-2 border-crimson-600 border-t-transparent rounded-full animate-spin" />
                    ) : tracks.length === 1 ? (
                      <span className="text-xs px-3 py-1.5 rounded-full bg-crimson-600 text-white border border-crimson-600">
                        {shortTrackLabel(tracks[0].track)}
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {tracks.map((t) => {
                          const sel = selectedTracks[conc.name] === t.track;
                          return (
                            <button
                              key={t.track}
                              onClick={() => setSelectedTrack(conc.name, t.track)}
                              className={`px-4 py-2 rounded-full text-sm border transition-all text-left ${
                                sel
                                  ? "bg-crimson-600 border-crimson-600 text-white"
                                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <span className="font-medium">{shortTrackLabel(t.track)}</span>
                              {t.thesis && t.thesis !== "None." && t.thesis !== "Optional." && (
                                <span className={`ml-1.5 text-[11px] ${sel ? "text-crimson-200" : "text-gray-400"}`}>
                                  · thesis
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={!allTracksSelected}
                onClick={() => navigate("/app")}
                className="px-7 py-2.5 bg-crimson-600 text-white text-sm font-medium rounded-lg disabled:opacity-30 hover:opacity-85 transition-opacity"
              >
                Go to planner
              </button>
              <button
                onClick={() => setStep(2)}
                className="ml-auto text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
