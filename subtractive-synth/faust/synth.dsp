import("stdfaust.lib");

// ─── Parameters ──────────────────────────────────────────────────────────────

freq    = hslider("freq [unit:Hz]", 440, 20, 20000, 0.01);
gate    = button("gate");
oscType = nentry("oscType", 0, 0, 4, 1);
octave  = nentry("octave", 0, -2, 2, 1);

// Filter
cutoff       = hslider("cutoff [unit:Hz]", 2000, 20, 20000, 1);
resonance    = hslider("resonance", 0.3, 0, 1, 0.001);
filterMode   = hslider("filterMode", 0, 0, 2, 0.001);
filterEnvAmt = hslider("filterEnvAmt [unit:Hz]", 3000, 0, 10000, 1);
filterAttack = hslider("filterAttack [unit:s]", 0.01, 0.001, 4, 0.001);
filterDecay  = hslider("filterDecay [unit:s]", 0.3, 0.001, 4, 0.001);

// Amp envelope
ampAttack = hslider("ampAttack [unit:s]", 0.01, 0.001, 4, 0.001);
ampDecay  = hslider("ampDecay [unit:s]", 0.5, 0.001, 4, 0.001);

// Master
masterVol = hslider("masterVol", 0.75, 0, 1, 0.001);

// ─── Oscillator ──────────────────────────────────────────────────────────────

transposedFreq = freq * pow(2, octave);

sineOsc   = os.osc(transposedFreq);
sawOsc    = os.sawtooth(transposedFreq);
squareOsc = os.square(transposedFreq);
triOsc    = os.triangle(transposedFreq);
noiseOsc  = no.noise;

oscSignal = sineOsc, sawOsc, squareOsc, triOsc, noiseOsc
          : ba.selectn(5, int(oscType));

// ─── AD Envelope (one-shot on rising edge of gate) ───────────────────────────

rising = gate > gate';
adEnv(a, d) = rising : en.ar(a, d);

filterEnvOut = adEnv(filterAttack, filterDecay);
ampEnvOut    = adEnv(ampAttack, ampDecay);

// ─── SEM State Variable Filter (LP/BP/HP crossfade) ──────────────────────────

cutoffMod = min(20000, cutoff + filterEnvOut * filterEnvAmt);

lpGain = max(0, 1 - filterMode);
bpGain = max(0, 1 - abs(filterMode - 1));
hpGain = max(0, filterMode - 1);

// Approximate SEM SVF using cascaded Butterworth stages for each mode.
// Bandpass = highpass then lowpass at the same cutoff.
semFilter(sig) = lp * lpGain + bp * bpGain + hp * hpGain
with {
  lp = sig : fi.lowpass(2, cutoffMod);
  bp = sig : fi.highpass(1, cutoffMod) : fi.lowpass(1, cutoffMod);
  hp = sig : fi.highpass(2, cutoffMod);
};

// ─── Signal Chain ─────────────────────────────────────────────────────────────

filteredSig = oscSignal : semFilter;
vcaOut      = filteredSig * ampEnvOut;

process = vcaOut * masterVol <: _, _;
