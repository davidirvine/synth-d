import("stdfaust.lib");

// ─── Parameters ──────────────────────────────────────────────────────────────

freq = hslider("freq [unit:Hz]", 440, 20, 20000, 0.01);
gate = button("gate");

// OSC 1
osc1Wave  = nentry("osc1Wave", 0, 0, 5, 1);
osc1Range = nentry("osc1Range", 0, -2, 2, 1);

// OSC 2
osc2Wave   = nentry("osc2Wave", 0, 0, 5, 1);
osc2Range  = nentry("osc2Range", 0, -2, 2, 1);
osc2Detune = hslider("osc2Detune [unit:cents]", 0, -100, 100, 0.1);

// OSC 3
osc3Wave    = nentry("osc3Wave", 0, 0, 5, 1);
osc3Range   = nentry("osc3Range", 0, -2, 2, 1);
osc3Detune  = hslider("osc3Detune [unit:cents]", 0, -100, 100, 0.1);
osc3LfoMode = nentry("osc3LfoMode", 0, 0, 1, 1);
osc3LfoRate = hslider("osc3LfoRate [unit:Hz]", 1, 0.1, 20, 0.01);

// Mixer
osc1Level  = hslider("osc1Level", 0.75, 0, 1, 0.001);
osc2Level  = hslider("osc2Level", 0, 0, 1, 0.001);
osc3Level  = hslider("osc3Level", 0, 0, 1, 0.001);
noiseLevel = hslider("noiseLevel", 0, 0, 1, 0.001);
noiseType  = nentry("noiseType", 0, 0, 1, 1);

// Filter
cutoff    = hslider("cutoff [unit:Hz]", 2000, 20, 20000, 1);
resonance = hslider("resonance", 0.3, 0, 1, 0.001);
keyTrack  = hslider("keyTrack", 0, 0, 1, 0.001);

// Filter envelope
filterEnvAmt  = hslider("filterEnvAmt [unit:Hz]", 0, 0, 10000, 1);
filterAttack  = hslider("filterAttack [unit:s]", 0.01, 0.001, 4, 0.001);
filterDecay   = hslider("filterDecay [unit:s]", 0.3, 0.001, 4, 0.001);
filterSustain = hslider("filterSustain", 0.5, 0, 1, 0.001);
filterRelease = hslider("filterRelease [unit:s]", 0.3, 0.001, 8, 0.001);

// Amp envelope
ampAttack  = hslider("ampAttack [unit:s]", 0.01, 0.001, 4, 0.001);
ampDecay   = hslider("ampDecay [unit:s]", 0.5, 0.001, 4, 0.001);
ampSustain = hslider("ampSustain", 0.7, 0, 1, 0.001);
ampRelease = hslider("ampRelease [unit:s]", 0.3, 0.001, 8, 0.001);
drLock     = nentry("drLock", 0, 0, 1, 1);

// Glide
glideOn   = nentry("glideOn", 0, 0, 1, 1);
glideRate = hslider("glideRate [unit:s]", 0, 0, 5, 0.001);

// Modulation
modMix      = hslider("modMix", 0, 0, 1, 0.001);
modWheel    = hslider("modWheel", 0, 0, 1, 0.001);
modToOsc1   = nentry("modToOsc1", 0, 0, 1, 1);
modToOsc2   = nentry("modToOsc2", 0, 0, 1, 1);
modToFilter = nentry("modToFilter", 0, 0, 1, 1);

// Delay
delayOn       = nentry("delayOn", 0, 0, 1, 1);
delayTime     = hslider("delayTime [unit:s]", 0.3, 0.01, 1.0, 0.001);
delayFeedback = hslider("delayFeedback", 0.3, 0, 0.9, 0.001);
delayMix      = hslider("delayMix", 0.3, 0, 1, 0.001);

// Reverb
reverbOn       = nentry("reverbOn", 0, 0, 1, 1);
reverbMix      = hslider("reverbMix", 0.5, 0, 1, 0.001);
reverbDecay    = hslider("reverbDecay", 0.5, 0, 1, 0.001);
reverbTone     = hslider("reverbTone [unit:Hz]", 4000, 1000, 16000, 1);
reverbPreDelay = hslider("reverbPreDelay [unit:s]", 0, 0, 0.1, 0.0001);

// Master
masterVol = hslider("masterVol", 0.75, 0, 1, 0.001);

// ─── Glide ────────────────────────────────────────────────────────────────────

glideTime = glideOn * glideRate;
glideFreq = freq : si.smooth(ba.tau2pole(glideTime));

// ─── Oscillator helper ────────────────────────────────────────────────────────

// Six waveforms: tri(0), rev-saw(1), saw(2), square(3), wide-pulse(4), narrow-pulse(5)
revSaw(f) = 0 - os.sawtooth(f);
oscWaves(f) = os.triangle(f), revSaw(f), os.sawtooth(f),
              os.square(f), os.pulsetrain(f, 0.67), os.pulsetrain(f, 0.1);

selectWave(waveIdx, f) = oscWaves(f) : ba.selectn(6, int(waveIdx));

// ─── Oscillators ─────────────────────────────────────────────────────────────

osc1Freq = glideFreq * pow(2, osc1Range);

osc2BaseFreq = glideFreq * pow(2, osc2Range);
osc2Freq     = osc2BaseFreq * pow(2, osc2Detune / 1200);

osc3BaseFreq   = glideFreq * pow(2, osc3Range);
osc3AudioFreq  = osc3BaseFreq * pow(2, osc3Detune / 1200);
osc3ActualFreq = select2(int(osc3LfoMode), osc3AudioFreq, osc3LfoRate);
osc3Signal     = selectWave(osc3Wave, osc3ActualFreq);

// ─── Modulation ──────────────────────────────────────────────────────────────

// noiseSrc is also used in the Mixer below; Faust CSE-folds the signal so both
// paths share the same generator instance (intentional — correlated noise).
noiseSrc = select2(int(noiseType), no.noise, no.pink_noise);

modSrc = osc3Signal * (1 - modMix) + noiseSrc * modMix;
modSig = modSrc * modWheel;

modFilterDepth = 2000;

// When route=1 applies 2-semitone pitch deviation; when route=0 factor=1 (no modulation)
osc1ModFreq = osc1Freq * (pow(2, modSig * 2 / 12) * modToOsc1 + (1 - modToOsc1));
osc2ModFreq = osc2Freq * (pow(2, modSig * 2 / 12) * modToOsc2 + (1 - modToOsc2));

osc1ModSig = selectWave(osc1Wave, osc1ModFreq);
osc2ModSig = selectWave(osc2Wave, osc2ModFreq);

// ─── Mixer ────────────────────────────────────────────────────────────────────

osc3Mix  = osc3Signal * osc3Level * (1 - osc3LfoMode);

mixerOut = osc1ModSig * osc1Level
         + osc2ModSig * osc2Level
         + osc3Mix
         + noiseSrc * noiseLevel;

// ─── Envelopes ───────────────────────────────────────────────────────────────

filterEnvOut       = en.adsr(filterAttack, filterDecay, filterSustain, filterRelease, gate);
effectiveAmpRelease = select2(int(drLock), ampRelease, ampDecay);
ampEnvOut          = en.adsr(ampAttack, ampDecay, ampSustain, effectiveAmpRelease, gate);

// ─── Ladder Filter ────────────────────────────────────────────────────────────

filterModHz = modSig * modToFilter * modFilterDepth;
cutoffMod   = max(20, min(20000,
                cutoff
                + keyTrack * (glideFreq - 261.63)
                + filterEnvOut * filterEnvAmt
                + filterModHz));

filteredSig = mixerOut : ve.moog_vcf(resonance, cutoffMod);

// ─── Tape Delay ───────────────────────────────────────────────────────────────

maxDelayLen       = 96000;
wowLfo            = os.osc(0.5) * 0.003;
tapeTime          = min(maxDelayLen - 1, max(1, delayTime * ma.SR + wowLfo * delayTime * ma.SR));
delayFeedbackSafe = delayFeedback : max(0) : min(0.9);
feedbackPath      = _ * delayFeedbackSafe : fi.lowpass(1, 6000) : ma.tanh;
delayInput        = masterOut * int(delayOn);
delayWet          = delayInput : +~(de.fdelay(maxDelayLen, tapeTime) : feedbackPath);
delayOut          = masterOut * (1 - delayMix) + delayWet * delayMix;
delayStage        = select2(int(delayOn), masterOut, delayOut);

// ─── Reverb ───────────────────────────────────────────────────────────────────

// Smooth all reverb params to prevent zipper noise when knobs are adjusted.
reverbDecayS    = reverbDecay    : si.smoo;
reverbToneS     = reverbTone     : si.smoo;
reverbPreDelayS = reverbPreDelay : si.smoo;
reverbMixS      = reverbMix      : si.smoo;

// Buffer covers 100 ms at 48 kHz (4800 samples + 1 headroom); max pre-delay halves to ~50 ms at 96 kHz.
// mono_freeverb(fb1=decay, fb2=0.5 room-size fixed, damp=0 internal damping off, spread=0 mono).
reverbWet = de.fdelay(4801, reverbPreDelayS * ma.SR)
          : re.mono_freeverb(reverbDecayS, 0.5, 0, 0)
          : fi.lowpass(1, reverbToneS)
          : fi.dcblocker;

// ─── Signal Chain ─────────────────────────────────────────────────────────────
// oscillators → mixer → ladder filter → VCA → master volume → tape delay → reverb → stereo split

vcaOut    = filteredSig * ampEnvOut;
masterOut = vcaOut * masterVol;
reverbOut = delayStage <: (_ * (1 - reverbMixS), reverbWet * reverbMixS) :> _;
process   = select2(int(reverbOn), delayStage, reverbOut) <: _, _;
