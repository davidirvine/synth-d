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
osc2Detune = hslider("osc2Detune [unit:cents]", 0, -700, 700, 1);

// OSC 3
osc3Wave    = nentry("osc3Wave", 0, 0, 5, 1);
osc3Range   = nentry("osc3Range", 0, -2, 2, 1);
osc3Detune  = hslider("osc3Detune [unit:cents]", 0, -700, 700, 1);
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
filterEnvAmt  = hslider("filterEnvAmt [unit:Hz]", 0, -10000, 10000, 1);
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
delayTime     = hslider("delayTime [unit:s]", 0.3, 0.01, 2.0, 0.001);
delayFeedback = hslider("delayFeedback", 0.3, 0, 0.9, 0.001);
delayMix      = hslider("delayMix", 0.3, 0, 1, 0.001);
delayModOn    = nentry("delayModOn", 0, 0, 1, 1);
delayModRate  = hslider("delayModRate [unit:Hz]", 0.5, 0.1, 10, 0.01);
delayModDepth = hslider("delayModDepth [unit:s]", 0, 0, 0.025, 0.0001);

// Reverb
reverbOn       = nentry("reverbOn", 0, 0, 1, 1);
reverbSend     = hslider("reverbSend", 0.3, 0, 1, 0.001);
reverbDecay    = hslider("reverbDecay", 0.5, 0, 1, 0.001);
reverbDamp     = hslider("reverbDamp", 0.5, 0, 1, 0.001);
reverbPreDelay = hslider("reverbPreDelay [unit:s]", 0.015, 0, 0.1, 0.0001);

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

mixerPeak = abs(mixerOut) : vbargraph("mixerPeak [unit:linear]", 0, 4);

// ─── Envelopes ───────────────────────────────────────────────────────────────

filterEnvOut       = en.adsr(filterAttack, filterDecay, filterSustain, filterRelease, gate);
effectiveAmpRelease = select2(int(drLock), ampRelease, ampDecay);
ampEnvOut          = en.adsr(ampAttack, ampDecay, ampSustain, effectiveAmpRelease, gate);

// ─── Ladder Filter ────────────────────────────────────────────────────────────

filterModHzRaw = modSig * modToFilter * modFilterDepth;
filterModHz = filterModHzRaw : si.smooth(ba.tau2pole(0.005));
// 18 kHz: stability ceiling for ve.moog_vcf at resonance ≤ 0.97, SR = 48 kHz
// (engine.js forces sampleRate: 48000; lower this ceiling if SR can be 44.1 kHz)
cutoffMod   = max(20, min(18000,
                cutoff
                + keyTrack * (glideFreq - 261.63)
                + filterEnvOut * filterEnvAmt
                + filterModHz))
              // smooth the fully-summed, clamped value — one slew-rate limit covers all modulation sources simultaneously
              : si.smooth(ba.tau2pole(0.002));

// 0.97: documented ve.moog_vcf_2bn stability ceiling at SR = 48 kHz (matches the
// 18 kHz cutoff clamp above). Caps at the stability limit rather than 1.0 so the
// near-self-oscillation squelch zone is reachable without risking runaway resonance.
// Listening-tuned (≈0.92–0.97): final value set by ear at the audio-verification gate.
resonanceSafe = min(0.97, resonance);
filteredSig = attach(mixerOut, mixerPeak) : ma.tanh : ve.moog_vcf_2bn(resonanceSafe, cutoffMod) : ma.tanh; // tanh: soft-clip transient overload; also adds mild saturation at high levels (intentional, not redundant with the pre-filter tanh)

// ─── Tape Delay ───────────────────────────────────────────────────────────────

maxDelayLen       = 96000;
// slewStep: max delay-samples the slewed time may move per audio sample (capstan-motor
// inertia). Listening-tuned constant — final value set by ear at the audio-verification
// gate, in the same spirit as the reverb si.smoo. It sets both observable behaviours at
// once: peak pitch-bend depth (≈ slewStep) and glide duration (Δsamples / slewStep).
slewStep          = 0.25;
wowLfo            = os.osc(0.5) * 0.003;
delayModOnS       = delayModOn    : si.smoo;
delayModRateS     = delayModRate  : si.smoo;
delayModDepthS    = delayModDepth : si.smoo;
modLfo            = os.osc(delayModRateS) * delayModDepthS * ma.SR * delayModOnS;
// Rate-limited slew on the sample-domain delay length. `(rateLimit ~ _)` feeds the
// one-sample-delayed output back into `prev` (the FIRST input); `target` is the incoming
// `delayTime * ma.SR`. The ±slewStep clamp on (target - prev) bounds the per-sample move,
// then si.smoo rounds the start/end corners of the glide.
rateLimit(prev, target) = prev + max(-slewStep, min(slewStep, target - prev));
tapeTimeSlewed    = (delayTime * ma.SR) : (rateLimit ~ _) : si.smoo;
tapeTime          = min(maxDelayLen - 1, max(1, tapeTimeSlewed + wowLfo * tapeTimeSlewed + modLfo));
delayFeedbackSafe = delayFeedback : max(0) : min(0.9);
feedbackPath      = _ * delayFeedbackSafe : fi.lowpass(1, 6000) : ma.tanh;
delayInput        = masterOut * int(delayOn);
delayWet          = delayInput : +~(de.fdelay(maxDelayLen, tapeTime) : feedbackPath);
delayOut          = masterOut * (1 - delayMix) + delayWet * delayMix;
delayStage        = select2(int(delayOn), masterOut, delayOut);

// ─── Reverb ───────────────────────────────────────────────────────────────────

// Smooth all reverb params to prevent zipper noise when knobs are adjusted.
reverbDecayS    = reverbDecay    : si.smoo;
reverbDampS     = reverbDamp     : si.smoo;
reverbPreDelayS = reverbPreDelay : si.smoo;
reverbSendS     = reverbSend     : si.smoo;

// Buffer covers 100 ms at 48 kHz (4800 samples + 1 headroom); max pre-delay halves to ~50 ms at 96 kHz.
// mono_freeverb(fb1=decay, fb2=0.5 room-size fixed, damp=reverbDampS, spread=0 mono).
reverbWet = de.fdelay(4801, reverbPreDelayS * ma.SR)
          : fi.highpass(2, 180)
          : re.mono_freeverb(reverbDecayS, 0.5, reverbDampS, 0)
          : fi.dcblocker;

// ─── Signal Chain ─────────────────────────────────────────────────────────────
// oscillators → mixer → ladder filter → VCA → master volume → tape delay → reverb → stereo split

vcaOut     = filteredSig * ampEnvOut;
outputPeak = abs(vcaOut * (masterVol / 0.6)) : vbargraph("outputPeak [unit:linear]", 0, 2);
masterOut  = attach(vcaOut * (masterVol / 0.6), outputPeak) : ma.tanh;
// Send-style routing: split delayStage into the dry path (`_`) and into
// reverbWet's input, then sum (`:>`). Writing this as `delayStage + reverbWet
// * reverbSendS` would compile but leave reverbWet's input unconnected, so
// the wet path would process silence at runtime.
reverbOut = delayStage <: (_, reverbWet * reverbSendS) :> _;
process   = select2(int(reverbOn), delayStage, reverbOut) <: _, _;
