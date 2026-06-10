# Changelog

## [1.8.0](https://github.com/davidirvine/synth-d/compare/subtractive-synth-v1.7.0...subtractive-synth-v1.8.0) (2026-06-10)


### Features

* patch import/export ([#91](https://github.com/davidirvine/synth-d/issues/91)) ([0601c31](https://github.com/davidirvine/synth-d/commit/0601c31031efcd9ab770a80c51dc794e8f26c590))
* scroll-wheel input for knobs and wheels; MOD wheel becomes a non-spring control resting at 0 ([#93](https://github.com/davidirvine/synth-d/issues/93)) ([62ea2ca](https://github.com/davidirvine/synth-d/commit/62ea2ca04fe7d9766cc8ccbc7496e0b434f1eb17))

## [1.7.0](https://github.com/davidirvine/synth-d/compare/subtractive-synth-v1.6.0...subtractive-synth-v1.7.0) (2026-05-23)


### Features

* **delay:** rate-limited tape-time glide on delayTime changes ([#86](https://github.com/davidirvine/synth-d/issues/86)) ([a522307](https://github.com/davidirvine/synth-d/commit/a522307e5622e92f915f9ba41b02c3f22e126d31))


### Bug Fixes

* remove decorative header glyph ([#87](https://github.com/davidirvine/synth-d/issues/87)) ([df57627](https://github.com/davidirvine/synth-d/commit/df576275586e87d0abb1b7b67459d6ce53ed403b))

## [1.6.0](https://github.com/davidirvine/synth-d/compare/subtractive-synth-v1.5.0...subtractive-synth-v1.6.0) (2026-05-22)


### Features

* add spring-loaded MOD and PITCH wheels ([#84](https://github.com/davidirvine/synth-d/issues/84)) ([1c3c2d4](https://github.com/davidirvine/synth-d/commit/1c3c2d433389455ccf2a4b90b82154451cc2014b))
* **delay:** make mix the leftmost delay knob ([#79](https://github.com/davidirvine/synth-d/issues/79)) ([d0654f9](https://github.com/davidirvine/synth-d/commit/d0654f90cda8b4c42d78e92e7523a876a7db7d30))
* **filter:** bipolar filter contour amount ([#77](https://github.com/davidirvine/synth-d/issues/77)) ([85da4c3](https://github.com/davidirvine/synth-d/commit/85da4c34aa84668dcedc3909ab0e48128f885d28))
* render glowing purple brand glyph in app header ([#83](https://github.com/davidirvine/synth-d/issues/83)) ([1f5af3e](https://github.com/davidirvine/synth-d/commit/1f5af3e7db2bae3119cd03b0b9c54dab8d853023))
* **workflow:** fix kernel friction and add /opsx:verify completion gate ([#81](https://github.com/davidirvine/synth-d/issues/81)) ([38d221d](https://github.com/davidirvine/synth-d/commit/38d221d4aa349e30651e9ddc6385bad101320b7b))

## [1.5.0](https://github.com/davidirvine/synth-d/compare/subtractive-synth-v1.4.1...subtractive-synth-v1.5.0) (2026-05-20)


### Features

* **docs:** split CLAUDE.md into kernel and STACK.md for improved portability ([701e5a4](https://github.com/davidirvine/synth-d/commit/701e5a4555f40a56d5bc73cd88f29320b90b61cb))
* implement patch save/load functionality with localStorage persistence ([d74dc8b](https://github.com/davidirvine/synth-d/commit/d74dc8bafc7796a7eb8a51a4d784d0f8c6ae8924))
* **midi:** add test coverage for MIDI features and refactor pitchbend math ([#70](https://github.com/davidirvine/synth-d/issues/70)) ([ec8a393](https://github.com/davidirvine/synth-d/commit/ec8a393b7501a6ac42cc00132c30a5a26b13d429))
* named patch save/load/rename/delete with central parameter store ([#75](https://github.com/davidirvine/synth-d/issues/75)) ([baf4108](https://github.com/davidirvine/synth-d/commit/baf4108d33d8d77ae2062f036cc14d4019e2c957))


### Bug Fixes

* finish trunk migration, split CLAUDE.md kernel, and replace husky with .githooks ([#73](https://github.com/davidirvine/synth-d/issues/73)) ([2b04a3e](https://github.com/davidirvine/synth-d/commit/2b04a3e88fb8292482ac74ec97f34d55964c0c90))

## [1.4.1](https://github.com/davidirvine/synth-d/compare/subtractive-synth-v1.4.0...subtractive-synth-v1.4.1) (2026-05-02)


### Bug Fixes

* **keyboard:** clear key highlights on power-off ([#68](https://github.com/davidirvine/synth-d/issues/68)) ([146968a](https://github.com/davidirvine/synth-d/commit/146968a7d22c436a03566705fd8f40caf3d2de16))

## [1.4.0](https://github.com/davidirvine/synth-d/compare/subtractive-synth-v1.3.0...subtractive-synth-v1.4.0) (2026-05-01)


### Features

* enforce type correctness across the codebase ([0ead3e1](https://github.com/davidirvine/synth-d/commit/0ead3e134d71a0ada4aa297b2ac901701c086b4f))
* enhance Knob component functionality ([0ead3e1](https://github.com/davidirvine/synth-d/commit/0ead3e134d71a0ada4aa297b2ac901701c086b4f))
* introduce Conventional Commits specification ([0ead3e1](https://github.com/davidirvine/synth-d/commit/0ead3e134d71a0ada4aa297b2ac901701c086b4f))
* promote develop to main (final pre-cutover) ([bd0844b](https://github.com/davidirvine/synth-d/commit/bd0844bd69d56d164acc8769eee2311184435878))
* redefine CD pipeline deployment triggers and requirements ([0ead3e1](https://github.com/davidirvine/synth-d/commit/0ead3e134d71a0ada4aa297b2ac901701c086b4f))
* refine release management process ([0ead3e1](https://github.com/davidirvine/synth-d/commit/0ead3e134d71a0ada4aa297b2ac901701c086b4f))
* revamp reverb DSP stage and UI controls ([0ead3e1](https://github.com/davidirvine/synth-d/commit/0ead3e134d71a0ada4aa297b2ac901701c086b4f))
* update oscillator detune behavior ([0ead3e1](https://github.com/davidirvine/synth-d/commit/0ead3e134d71a0ada4aa297b2ac901701c086b4f))

## [1.3.0](https://github.com/davidirvine/synth-d/compare/subtractive-synth-v1.2.0...subtractive-synth-v1.3.0) (2026-05-01)


### Features

* promote develop to main ([#61](https://github.com/davidirvine/synth-d/issues/61)) ([1e3a589](https://github.com/davidirvine/synth-d/commit/1e3a589597b8edec81880c326f02809055a29f36))

## [1.2.0](https://github.com/davidirvine/synth-d/compare/subtractive-synth-v1.1.0...subtractive-synth-v1.2.0) (2026-05-01)


### Features

* add check for remote origin before fetching latest develop ([b2b91e7](https://github.com/davidirvine/synth-d/commit/b2b91e7775749420bdc92a9fe770af312157acf9))
* add oscilloscope component to visualize audio waveform ([89f5216](https://github.com/davidirvine/synth-d/commit/89f521658dd9a593059fbaff8287886ce13f829a))
* add subtractive synthesizer project structure and core functionality ([83e74be](https://github.com/davidirvine/synth-d/commit/83e74be612bb7cee7d78402b833d924b72c26c60))
* Add Web MIDI API support for synth control ([39b1eb8](https://github.com/davidirvine/synth-d/commit/39b1eb87242616ea96429d8770b88601f32cdbf3))
* **delay:** add feedback delay stage post-VCA with UI controls and MIDI integration ([f4903c7](https://github.com/davidirvine/synth-d/commit/f4903c70dca366f11767d9b7383329a0783535b9))
* **delay:** add tape delay stage and combined Effects panel ([55d987c](https://github.com/davidirvine/synth-d/commit/55d987cd3661190f5806b85154e54125d47fcdda))
* **delay:** implement tape delay stage with integrated effects panel for reverb and delay controls ([074e2bc](https://github.com/davidirvine/synth-d/commit/074e2bc41a0492bbd69e5241825c72d10a28c248))
* **delay:** update delay DSP stage to use de.fdelay and refine tape time calculation ([06156c0](https://github.com/davidirvine/synth-d/commit/06156c0169aebd1337b8141dc9a6322ed9d38aef))
* **dsp-engine:** update signal chain description to include tape delay stage ([4300b38](https://github.com/davidirvine/synth-d/commit/4300b38885c7015e2ebbaf7cafba209030d476f9))
* **dsp:** implement Moog Model D signal chain in FAUST ([1698595](https://github.com/davidirvine/synth-d/commit/169859516ffb4dd7b90368d8af5edfea40988f68))
* **effects:** add default values and active state checks for reverb and delay toggles ([c13cc1f](https://github.com/davidirvine/synth-d/commit/c13cc1f33ba33d9588248eb378e5c2b7806a75ce))
* **effects:** consolidate reverb functionality into Effects component and update related tests ([391f1be](https://github.com/davidirvine/synth-d/commit/391f1be8395b915aa41dc3f82d6269c0e8831b2e))
* enhance CLAUDE.md with branching rules and worktree workflow updates ([9caf91d](https://github.com/davidirvine/synth-d/commit/9caf91d4ca8699c9e2565582be89a4f11f98e321))
* implement power button for audio control, replacing click-to-start overlay ([475b3b0](https://github.com/davidirvine/synth-d/commit/475b3b0e4f9b9718ef03b8182a46ee981c76da15))
* **knob:** add showArc and bipolar props for enhanced knob behavior ([37b1f7c](https://github.com/davidirvine/synth-d/commit/37b1f7c3b143759d53f36b720012ea5257f63101))
* **knob:** add showArc and bipolar props with tests ([d786d10](https://github.com/davidirvine/synth-d/commit/d786d100c97abca9e2f2fa1fa0a66ccf5eb08954))
* **knob:** update tick label color to match knob label for visual consistency ([5c66b49](https://github.com/davidirvine/synth-d/commit/5c66b490c48a93f5a1362a0877eeb8944981c1df))
* **midi-support:** implement Web MIDI API integration for enhanced synth control ([d548d78](https://github.com/davidirvine/synth-d/commit/d548d782d537b7c6a48723628c829e507964f5b9))
* **midi-support:** implement Web MIDI API with note, pitchbend, and CC knob mapping ([faf78f7](https://github.com/davidirvine/synth-d/commit/faf78f739695d321e4f4145d4350638d517fa7c3))
* **moog-model-d:** overhaul synth architecture to Moog Model D specifications ([8f4341e](https://github.com/davidirvine/synth-d/commit/8f4341e35a8a4b7e0cdac12f843da45f78330b62))
* **power-button:** add PowerButton component with LED indicator and STARTING state ([25bae52](https://github.com/davidirvine/synth-d/commit/25bae5249bf5ce895172e3588846cf5fb9644db4))
* **power-button:** implement tri-state color scheme for power button with smooth transitions ([7eb4b4f](https://github.com/davidirvine/synth-d/commit/7eb4b4fb69019c6bc79e53a72e68b41a51f92464))
* **power-button:** rename initAudio to powerOn, add powerOff with suspend/resume lifecycle ([4ace9db](https://github.com/davidirvine/synth-d/commit/4ace9db3b599bfab194883ee6790c0a372d63590))
* **power-button:** replace click-to-start overlay with power button in App.svelte ([4834816](https://github.com/davidirvine/synth-d/commit/48348160989a8363180e2bce6789331d68b6fed0))
* **power-button:** tri-state status colors with fade transition ([a9186ac](https://github.com/davidirvine/synth-d/commit/a9186ac213d42bbc38a0ed5c68479b281abf14fa))
* promote develop to main ([#52](https://github.com/davidirvine/synth-d/issues/52)) ([8af09a4](https://github.com/davidirvine/synth-d/commit/8af09a46e020df86a51b0f13fad248d20545c5d1))
* promote develop to main ([#57](https://github.com/davidirvine/synth-d/issues/57)) ([086764e](https://github.com/davidirvine/synth-d/commit/086764e7479720c849f3cb1a852318e24cfbef4e))
* remove obsolete OPSX sync documentation and skills ([4123af9](https://github.com/davidirvine/synth-d/commit/4123af9a8d5d61ee5128150add68d669e3817ab7))
* **reverb:** add reverb parameters to faust/synth.dsp (task 1.1) ([c2bb371](https://github.com/davidirvine/synth-d/commit/c2bb37193906c10c98a05c842b050372097ed136))
* **reverb:** add reverb params to KNOB_PARAMS in App.svelte (task 3.2) ([68d62e0](https://github.com/davidirvine/synth-d/commit/68d62e0831e2299dc80c13124cec0097d08e520b))
* **reverb:** add reverbMidiState derived state in App.svelte (task 3.3) ([712cd02](https://github.com/davidirvine/synth-d/commit/712cd02574725d7be8d794a4de082855c899dfc0))
* **reverb:** add shimmer reverb stage between ladder filter and VCA with UI controls ([a731921](https://github.com/davidirvine/synth-d/commit/a73192149ecb949454abaa66db12ddf2047f4ce1))
* **reverb:** add shimmer reverb stage with UI controls and MIDI integration ([341ea09](https://github.com/davidirvine/synth-d/commit/341ea09f89535dc8ac7068519636bdadde45ae3e))
* **reverb:** add shimmerUnit feedback loop in faust/synth.dsp (task 1.2) ([f2f81b4](https://github.com/davidirvine/synth-d/commit/f2f81b484a5680386f8426e0a001867602aa7064))
* **reverb:** add wet/dry blend (shimmerOut) to faust/synth.dsp (task 1.3) ([83fa9bd](https://github.com/davidirvine/synth-d/commit/83fa9bdc58c26dc3eedde3c4f5c8fe7e194a05ba))
* **reverb:** create Reverb.svelte component with toggle and three knobs (tasks 2.1-2.5) ([5755ed9](https://github.com/davidirvine/synth-d/commit/5755ed9260120f55c3748c83e4738e660fe4b642))
* **reverb:** implement shimmer reverb stage with UI controls and MIDI integration ([862c350](https://github.com/davidirvine/synth-d/commit/862c3501ebebfe48060eaf100f9e0d319bf511da))
* **reverb:** import Reverb component in App.svelte (task 3.1) ([978ce90](https://github.com/davidirvine/synth-d/commit/978ce90bdda90fc4350ff1a8ee899bdfb17de9d7))
* **reverb:** mark 3.2b complete - reverb ranges covered by KNOB_PARAMS (task 3.2b) ([ae88c2b](https://github.com/davidirvine/synth-d/commit/ae88c2bff7a69c8634f3a53d54c1f438b7afc763))
* **reverb:** mount Reverb panel in filter-output-grid (tasks 3.4-3.5) ([a15ef2c](https://github.com/davidirvine/synth-d/commit/a15ef2c80faae206c5c30e4aaf1a897e5fc5af08))
* **reverb:** move reverb to post-master-volume position, right of output panel ([20f7409](https://github.com/davidirvine/synth-d/commit/20f7409237db044fa00916fd0b7558247018f7ee))
* **reverb:** replace shimmer with tone, pre-delay, and log-reverse decay ([59a83de](https://github.com/davidirvine/synth-d/commit/59a83deb2851d17b278eedeb38a7bda11b1eae48))
* **reverb:** replace shimmer with tone, pre-delay, and log-reverse decay ([82d692d](https://github.com/davidirvine/synth-d/commit/82d692d41a618af43fbae3d867c28c99f32d8f92))
* **reverb:** rewrite reverb section to replace shimmer with tone and pre-delay controls ([16c9521](https://github.com/davidirvine/synth-d/commit/16c9521a476d6954ef64034fccf4bd79b2ad2bdf))
* **reverb:** rewrite reverb section to replace shimmer with tone and pre-delay controls ([9a3623d](https://github.com/davidirvine/synth-d/commit/9a3623db8a177f4279e391426fd29bd00ae6603d))
* **reverb:** validate FAUST DSP builds (task 1.5) ([af2e7b6](https://github.com/davidirvine/synth-d/commit/af2e7b69aa172bda05e30b4f2e80ee45d6ac3a72))
* **reverb:** wire reverb bypass via select2 in faust/synth.dsp (task 1.4) ([79ac117](https://github.com/davidirvine/synth-d/commit/79ac117aad21d0e08c4300911de2366d877e3d0d))
* **roborev-workflow:** establish new workflow for roborev integration ([4e463c7](https://github.com/davidirvine/synth-d/commit/4e463c795be3ced66ec3dc83a6a3f9fa058e095d))
* **scope:** add real-time oscilloscope display using AnalyserNode ([17a661e](https://github.com/davidirvine/synth-d/commit/17a661ebece42d97d64229b23925314e021fe29f))
* **scripts:** add change-type prompt and stax branch creation to opsx-apply-wt ([2bcf3b8](https://github.com/davidirvine/synth-d/commit/2bcf3b8c02ff708e5e7f16d7c489fe5d46526bd3))
* section 1 — project scaffold (subtractive-synth) ([e0ba242](https://github.com/davidirvine/synth-d/commit/e0ba24240b8d2438a62a2f7164bb834289f06d90))
* section 6 — pure function modules (subtractive-synth) ([5ee7a9a](https://github.com/davidirvine/synth-d/commit/5ee7a9a8a132cdfd525d400e0a097c178a415f51))
* sections 2–5 — complete FAUST DSP (subtractive-synth) ([f168a9e](https://github.com/davidirvine/synth-d/commit/f168a9e55c42162e6edeffbb838e0b1dd0fc625e))
* **tooling:** install roborev hooks and configure post-commit review ([5f7f5a7](https://github.com/davidirvine/synth-d/commit/5f7f5a755436797545af8d380e81f8cfeb506d7a))
* **ui-polish:** standardize layout and update product name to SYNTH-D ([30a1601](https://github.com/davidirvine/synth-d/commit/30a160138e8a4ceb6cd90a5ee249d8427f4e46d6))
* **ui-polish:** update synth UI layout and controls for consistency and clarity ([1aabd78](https://github.com/davidirvine/synth-d/commit/1aabd78055cc5e46a375dcf3d31c992b16f18aee))
* **ui:** implement Moog Model D UI components (sections 9-11) ([4de8965](https://github.com/davidirvine/synth-d/commit/4de89650dbf88627e2ac6637f02f2ba76aff0cf4))
* update documentation and scripts to reflect changes from main to develop branch ([3222fc2](https://github.com/davidirvine/synth-d/commit/3222fc279827c0e126006a1956ed154bb8010488))
* **workflows:** add comprehensive workflows for stax v0.27.0 ([4e463c7](https://github.com/davidirvine/synth-d/commit/4e463c795be3ced66ec3dc83a6a3f9fa058e095d))
* **workflows:** enhance roborev workflow with dynamic branch handling and testing confirmation ([5c3c8f0](https://github.com/davidirvine/synth-d/commit/5c3c8f08b9e2160d85655a422c787ba32eace945))
* **workflows:** update roborev workflow documentation for improved clarity and process consistency ([766576c](https://github.com/davidirvine/synth-d/commit/766576c1faa26056f98ac71c34fd1328bc3b70f0))
* **workflow:** update CLAUDE.md with roborev, stacked PRs, and worktree rules ([490016d](https://github.com/davidirvine/synth-d/commit/490016dc46e4fab1172de354b84d07d37dbb0623))
* **worktree:** add scripts and documentation for managing worktrees and archiving changes ([5ae12d8](https://github.com/davidirvine/synth-d/commit/5ae12d82d654c41ea93906ac765ac921df44f2d7))


### Bug Fixes

* **audio:** use BASE_URL for WASM paths on GitHub Pages ([#13](https://github.com/davidirvine/synth-d/issues/13)) ([73f91e8](https://github.com/davidirvine/synth-d/commit/73f91e8a70b0e4f52ae34f152a2052b6d9e0b402))
* **config:** correct post_commit_review type to string mode ([5cd95f7](https://github.com/davidirvine/synth-d/commit/5cd95f70b2e5ebacce29f2eadbf4a1f4e6fb8434))
* **delay:** address roborev findings in delay artifacts ([a578c8b](https://github.com/davidirvine/synth-d/commit/a578c8bcac29ca2b9847c59201ac4879ec85fb8b))
* **delay:** resolve pseudocode consistency and task dependency ordering ([b91b14c](https://github.com/davidirvine/synth-d/commit/b91b14c21f26e4c867ffef4d5e75065907ae05b2))
* **docs:** clarify project rules and spec-driven design requirements ([0123474](https://github.com/davidirvine/synth-d/commit/0123474359757a4f4e7a46c1e66735f7d87e6edb))
* guard handleToggle against power-on failure; add faust:build script ([454f226](https://github.com/davidirvine/synth-d/commit/454f22631654b08e180a4659fc279619ec3f825c))
* **openspec:** address all roborev findings on ui-polish change artifacts ([1f09587](https://github.com/davidirvine/synth-d/commit/1f09587b2880936bef266b1f6dc80784ce248ea9))
* **openspec:** address fourth-round roborev findings on ui-polish tasks ([28c8072](https://github.com/davidirvine/synth-d/commit/28c807242a4d98431edf48f5633b2ab36d010fcb))
* **openspec:** address second-round roborev findings on ui-polish tasks ([440d2bc](https://github.com/davidirvine/synth-d/commit/440d2bc54873c701c5c098626f88419adaf84602))
* **openspec:** address third-round roborev findings on ui-polish tasks ([1e802b6](https://github.com/davidirvine/synth-d/commit/1e802b63a5bec22f4da01cd8619ea4308ffb4b48))
* **openspec:** renumber tasks 6.4/6.5 to 6.3/6.4 after merging old 6.3 ([2898319](https://github.com/davidirvine/synth-d/commit/289831911a5aee36b4e168d7455882998cc137f8))
* **reverb:** add fi.dcblocker to reverb wet path to remove DC bias ([fac64cd](https://github.com/davidirvine/synth-d/commit/fac64cd98805ba547c395c0b177beeb9558f964b))
* **reverb:** commit synth.json artifact and correct ba.clip in design.md ([02b89c9](https://github.com/davidirvine/synth-d/commit/02b89c9402f7def6e3e17c84c3d774caaccaafa6))
* **reverb:** correct FAUST pseudocode and task descriptions ([a77f760](https://github.com/davidirvine/synth-d/commit/a77f76054cde812e593c2a8b5e220ce4214e2aa0))
* **reverb:** fix silent reverb - replace +~ with ~ to correctly excite freeverb ([8c92bd2](https://github.com/davidirvine/synth-d/commit/8c92bd21adb4513c24578d0baa94be38cec95879))
* **reverb:** smooth reverb params to eliminate zipper noise ([0824946](https://github.com/davidirvine/synth-d/commit/08249464de56c1d9b42d0b2def549e85ab9ea850))
* **reverb:** use ba.clip(-1,1) to preserve bipolar audio in shimmer feedback ([7937ca9](https://github.com/davidirvine/synth-d/commit/7937ca95b10bd9725e2747c86953348b30510c70))
* **scripts:** switch back to develop after stax create in opsx-apply-worktree ([1966371](https://github.com/davidirvine/synth-d/commit/1966371f14eb445c8cadcdec9c2300d0cc12727a))
* **ui:** address verification warnings — disabled states, stacked noise btns, doc updates ([7a411b8](https://github.com/davidirvine/synth-d/commit/7a411b848f8715338f13c807dfe5015c84d6c8ca))

## [1.1.0](https://github.com/davidirvine/synth-d/compare/subtractive-synth-v1.0.2...subtractive-synth-v1.1.0) (2026-04-25)


### Features

* **ci:** add promotion and backmerge PR automation ([2edabe2](https://github.com/davidirvine/synth-d/commit/2edabe2b596596c07214e5d584d5436901ee69dd))


### Bug Fixes

* **build:** generate synth.json and bust Faust cache ([e296e4f](https://github.com/davidirvine/synth-d/commit/e296e4f41d32bb34d38c6f90b26b009e5a38ba7f))
* **ci:** bump Faust cache key in preview workflow to faust-v2- ([5e681a4](https://github.com/davidirvine/synth-d/commit/5e681a4fe565329da7d8444909e24ef6202e8b76))

## [1.0.2](https://github.com/davidirvine/synth-d/compare/subtractive-synth-v1.0.1...subtractive-synth-v1.0.2) (2026-04-25)


### Bug Fixes

* **audio:** use BASE_URL for WASM asset paths ([3140c0e](https://github.com/davidirvine/synth-d/commit/3140c0e8331cc8a98d13d27bd91523e4c4f64753))

## [1.0.1](https://github.com/davidirvine/synth-d/compare/subtractive-synth-v1.0.0...subtractive-synth-v1.0.1) (2026-04-25)


### Bug Fixes

* **ci:** trigger release-please on develop pushes ([61b5cf4](https://github.com/davidirvine/synth-d/commit/61b5cf45c64bc60f605bcee3d843bb3d5ac8df38))
* **deploy:** set Vite base path for GitHub Pages ([03ae3d6](https://github.com/davidirvine/synth-d/commit/03ae3d6ef570dac2316a1476440fd080de73564a))

## 1.0.0 (2026-04-25)


### Features

* add check for remote origin before fetching latest develop ([b2b91e7](https://github.com/davidirvine/synth-d/commit/b2b91e7775749420bdc92a9fe770af312157acf9))
* add oscilloscope component to visualize audio waveform ([89f5216](https://github.com/davidirvine/synth-d/commit/89f521658dd9a593059fbaff8287886ce13f829a))
* add subtractive synthesizer project structure and core functionality ([83e74be](https://github.com/davidirvine/synth-d/commit/83e74be612bb7cee7d78402b833d924b72c26c60))
* Add Web MIDI API support for synth control ([39b1eb8](https://github.com/davidirvine/synth-d/commit/39b1eb87242616ea96429d8770b88601f32cdbf3))
* **cicd:** add GitHub Actions CI/CD pipeline ([#5](https://github.com/davidirvine/synth-d/issues/5)) ([15184a7](https://github.com/davidirvine/synth-d/commit/15184a72a4fa96ca94bdd66ac0d016b2de8edd1a))
* **delay:** add feedback delay stage post-VCA with UI controls and MIDI integration ([f4903c7](https://github.com/davidirvine/synth-d/commit/f4903c70dca366f11767d9b7383329a0783535b9))
* **delay:** add tape delay stage and combined Effects panel ([55d987c](https://github.com/davidirvine/synth-d/commit/55d987cd3661190f5806b85154e54125d47fcdda))
* **delay:** implement tape delay stage with integrated effects panel for reverb and delay controls ([074e2bc](https://github.com/davidirvine/synth-d/commit/074e2bc41a0492bbd69e5241825c72d10a28c248))
* **delay:** update delay DSP stage to use de.fdelay and refine tape time calculation ([06156c0](https://github.com/davidirvine/synth-d/commit/06156c0169aebd1337b8141dc9a6322ed9d38aef))
* **dsp-engine:** update signal chain description to include tape delay stage ([4300b38](https://github.com/davidirvine/synth-d/commit/4300b38885c7015e2ebbaf7cafba209030d476f9))
* **dsp:** implement Moog Model D signal chain in FAUST ([1698595](https://github.com/davidirvine/synth-d/commit/169859516ffb4dd7b90368d8af5edfea40988f68))
* **effects:** add default values and active state checks for reverb and delay toggles ([c13cc1f](https://github.com/davidirvine/synth-d/commit/c13cc1f33ba33d9588248eb378e5c2b7806a75ce))
* **effects:** consolidate reverb functionality into Effects component and update related tests ([391f1be](https://github.com/davidirvine/synth-d/commit/391f1be8395b915aa41dc3f82d6269c0e8831b2e))
* enhance CLAUDE.md with branching rules and worktree workflow updates ([9caf91d](https://github.com/davidirvine/synth-d/commit/9caf91d4ca8699c9e2565582be89a4f11f98e321))
* implement power button for audio control, replacing click-to-start overlay ([475b3b0](https://github.com/davidirvine/synth-d/commit/475b3b0e4f9b9718ef03b8182a46ee981c76da15))
* **knob:** add showArc and bipolar props for enhanced knob behavior ([37b1f7c](https://github.com/davidirvine/synth-d/commit/37b1f7c3b143759d53f36b720012ea5257f63101))
* **knob:** add showArc and bipolar props with tests ([d786d10](https://github.com/davidirvine/synth-d/commit/d786d100c97abca9e2f2fa1fa0a66ccf5eb08954))
* **knob:** update tick label color to match knob label for visual consistency ([5c66b49](https://github.com/davidirvine/synth-d/commit/5c66b490c48a93f5a1362a0877eeb8944981c1df))
* **midi-support:** implement Web MIDI API integration for enhanced synth control ([d548d78](https://github.com/davidirvine/synth-d/commit/d548d782d537b7c6a48723628c829e507964f5b9))
* **midi-support:** implement Web MIDI API with note, pitchbend, and CC knob mapping ([faf78f7](https://github.com/davidirvine/synth-d/commit/faf78f739695d321e4f4145d4350638d517fa7c3))
* **moog-model-d:** overhaul synth architecture to Moog Model D specifications ([8f4341e](https://github.com/davidirvine/synth-d/commit/8f4341e35a8a4b7e0cdac12f843da45f78330b62))
* **openspec:** add github-actions-cicd change proposal, design, specs, and tasks ([#2](https://github.com/davidirvine/synth-d/issues/2)) ([1a3b6de](https://github.com/davidirvine/synth-d/commit/1a3b6de8f7cf51770b09e9dcc90a696cc04fc1ba))
* **power-button:** add PowerButton component with LED indicator and STARTING state ([25bae52](https://github.com/davidirvine/synth-d/commit/25bae5249bf5ce895172e3588846cf5fb9644db4))
* **power-button:** implement tri-state color scheme for power button with smooth transitions ([7eb4b4f](https://github.com/davidirvine/synth-d/commit/7eb4b4fb69019c6bc79e53a72e68b41a51f92464))
* **power-button:** rename initAudio to powerOn, add powerOff with suspend/resume lifecycle ([4ace9db](https://github.com/davidirvine/synth-d/commit/4ace9db3b599bfab194883ee6790c0a372d63590))
* **power-button:** replace click-to-start overlay with power button in App.svelte ([4834816](https://github.com/davidirvine/synth-d/commit/48348160989a8363180e2bce6789331d68b6fed0))
* **power-button:** tri-state status colors with fade transition ([a9186ac](https://github.com/davidirvine/synth-d/commit/a9186ac213d42bbc38a0ed5c68479b281abf14fa))
* remove obsolete OPSX sync documentation and skills ([4123af9](https://github.com/davidirvine/synth-d/commit/4123af9a8d5d61ee5128150add68d669e3817ab7))
* **reverb:** add reverb parameters to faust/synth.dsp (task 1.1) ([c2bb371](https://github.com/davidirvine/synth-d/commit/c2bb37193906c10c98a05c842b050372097ed136))
* **reverb:** add reverb params to KNOB_PARAMS in App.svelte (task 3.2) ([68d62e0](https://github.com/davidirvine/synth-d/commit/68d62e0831e2299dc80c13124cec0097d08e520b))
* **reverb:** add reverbMidiState derived state in App.svelte (task 3.3) ([712cd02](https://github.com/davidirvine/synth-d/commit/712cd02574725d7be8d794a4de082855c899dfc0))
* **reverb:** add shimmer reverb stage between ladder filter and VCA with UI controls ([a731921](https://github.com/davidirvine/synth-d/commit/a73192149ecb949454abaa66db12ddf2047f4ce1))
* **reverb:** add shimmer reverb stage with UI controls and MIDI integration ([341ea09](https://github.com/davidirvine/synth-d/commit/341ea09f89535dc8ac7068519636bdadde45ae3e))
* **reverb:** add shimmerUnit feedback loop in faust/synth.dsp (task 1.2) ([f2f81b4](https://github.com/davidirvine/synth-d/commit/f2f81b484a5680386f8426e0a001867602aa7064))
* **reverb:** add wet/dry blend (shimmerOut) to faust/synth.dsp (task 1.3) ([83fa9bd](https://github.com/davidirvine/synth-d/commit/83fa9bdc58c26dc3eedde3c4f5c8fe7e194a05ba))
* **reverb:** create Reverb.svelte component with toggle and three knobs (tasks 2.1-2.5) ([5755ed9](https://github.com/davidirvine/synth-d/commit/5755ed9260120f55c3748c83e4738e660fe4b642))
* **reverb:** implement shimmer reverb stage with UI controls and MIDI integration ([862c350](https://github.com/davidirvine/synth-d/commit/862c3501ebebfe48060eaf100f9e0d319bf511da))
* **reverb:** import Reverb component in App.svelte (task 3.1) ([978ce90](https://github.com/davidirvine/synth-d/commit/978ce90bdda90fc4350ff1a8ee899bdfb17de9d7))
* **reverb:** mark 3.2b complete - reverb ranges covered by KNOB_PARAMS (task 3.2b) ([ae88c2b](https://github.com/davidirvine/synth-d/commit/ae88c2bff7a69c8634f3a53d54c1f438b7afc763))
* **reverb:** mount Reverb panel in filter-output-grid (tasks 3.4-3.5) ([a15ef2c](https://github.com/davidirvine/synth-d/commit/a15ef2c80faae206c5c30e4aaf1a897e5fc5af08))
* **reverb:** move reverb to post-master-volume position, right of output panel ([20f7409](https://github.com/davidirvine/synth-d/commit/20f7409237db044fa00916fd0b7558247018f7ee))
* **reverb:** replace shimmer with tone, pre-delay, and log-reverse decay ([82d692d](https://github.com/davidirvine/synth-d/commit/82d692d41a618af43fbae3d867c28c99f32d8f92))
* **reverb:** rewrite reverb section to replace shimmer with tone and pre-delay controls ([16c9521](https://github.com/davidirvine/synth-d/commit/16c9521a476d6954ef64034fccf4bd79b2ad2bdf))
* **reverb:** rewrite reverb section to replace shimmer with tone and pre-delay controls ([9a3623d](https://github.com/davidirvine/synth-d/commit/9a3623db8a177f4279e391426fd29bd00ae6603d))
* **reverb:** validate FAUST DSP builds (task 1.5) ([af2e7b6](https://github.com/davidirvine/synth-d/commit/af2e7b69aa172bda05e30b4f2e80ee45d6ac3a72))
* **reverb:** wire reverb bypass via select2 in faust/synth.dsp (task 1.4) ([79ac117](https://github.com/davidirvine/synth-d/commit/79ac117aad21d0e08c4300911de2366d877e3d0d))
* **scope:** add real-time oscilloscope display using AnalyserNode ([17a661e](https://github.com/davidirvine/synth-d/commit/17a661ebece42d97d64229b23925314e021fe29f))
* **scripts:** add change-type prompt and stax branch creation to opsx-apply-wt ([2bcf3b8](https://github.com/davidirvine/synth-d/commit/2bcf3b8c02ff708e5e7f16d7c489fe5d46526bd3))
* section 1 — project scaffold (subtractive-synth) ([e0ba242](https://github.com/davidirvine/synth-d/commit/e0ba24240b8d2438a62a2f7164bb834289f06d90))
* section 6 — pure function modules (subtractive-synth) ([5ee7a9a](https://github.com/davidirvine/synth-d/commit/5ee7a9a8a132cdfd525d400e0a097c178a415f51))
* sections 2–5 — complete FAUST DSP (subtractive-synth) ([f168a9e](https://github.com/davidirvine/synth-d/commit/f168a9e55c42162e6edeffbb838e0b1dd0fc625e))
* **skills:** add roborev and stax skill documentation with README ([#6](https://github.com/davidirvine/synth-d/issues/6)) ([33bfbb1](https://github.com/davidirvine/synth-d/commit/33bfbb199159d0f828f586b849db5094575381e7))
* **tooling:** install roborev hooks and configure post-commit review ([5f7f5a7](https://github.com/davidirvine/synth-d/commit/5f7f5a755436797545af8d380e81f8cfeb506d7a))
* **ui-polish:** standardize layout and update product name to SYNTH-D ([30a1601](https://github.com/davidirvine/synth-d/commit/30a160138e8a4ceb6cd90a5ee249d8427f4e46d6))
* **ui-polish:** SYNTH-D rename, grid layout, Effects restructure, Key Track switch, green toggles ([#3](https://github.com/davidirvine/synth-d/issues/3)) ([fdc209a](https://github.com/davidirvine/synth-d/commit/fdc209a451e1ad094dfc82294e7204daa19bf299))
* **ui-polish:** update synth UI layout and controls for consistency and clarity ([1aabd78](https://github.com/davidirvine/synth-d/commit/1aabd78055cc5e46a375dcf3d31c992b16f18aee))
* **ui:** implement Moog Model D UI components (sections 9-11) ([4de8965](https://github.com/davidirvine/synth-d/commit/4de89650dbf88627e2ac6637f02f2ba76aff0cf4))
* update documentation and scripts to reflect changes from main to develop branch ([3222fc2](https://github.com/davidirvine/synth-d/commit/3222fc279827c0e126006a1956ed154bb8010488))
* **workflows:** add comprehensive workflows for stax v0.27.0 ([4e463c7](https://github.com/davidirvine/synth-d/commit/4e463c795be3ced66ec3dc83a6a3f9fa058e095d))
* **workflows:** enhance roborev workflow with dynamic branch handling and testing confirmation ([5c3c8f0](https://github.com/davidirvine/synth-d/commit/5c3c8f08b9e2160d85655a422c787ba32eace945))
* **workflows:** update roborev workflow documentation for improved clarity and process consistency ([766576c](https://github.com/davidirvine/synth-d/commit/766576c1faa26056f98ac71c34fd1328bc3b70f0))
* **workflow:** update CLAUDE.md with roborev, stacked PRs, and worktree rules ([490016d](https://github.com/davidirvine/synth-d/commit/490016dc46e4fab1172de354b84d07d37dbb0623))
* **worktree:** add scripts and documentation for managing worktrees and archiving changes ([5ae12d8](https://github.com/davidirvine/synth-d/commit/5ae12d82d654c41ea93906ac765ac921df44f2d7))


### Bug Fixes

* **config:** correct post_commit_review type to string mode ([5cd95f7](https://github.com/davidirvine/synth-d/commit/5cd95f70b2e5ebacce29f2eadbf4a1f4e6fb8434))
* **delay:** address roborev findings in delay artifacts ([a578c8b](https://github.com/davidirvine/synth-d/commit/a578c8bcac29ca2b9847c59201ac4879ec85fb8b))
* **delay:** resolve pseudocode consistency and task dependency ordering ([b91b14c](https://github.com/davidirvine/synth-d/commit/b91b14c21f26e4c867ffef4d5e75065907ae05b2))
* **docs:** clarify project rules and spec-driven design requirements ([0123474](https://github.com/davidirvine/synth-d/commit/0123474359757a4f4e7a46c1e66735f7d87e6edb))
* guard handleToggle against power-on failure; add faust:build script ([454f226](https://github.com/davidirvine/synth-d/commit/454f22631654b08e180a4659fc279619ec3f825c))
* **openspec:** address all roborev findings on ui-polish change artifacts ([1f09587](https://github.com/davidirvine/synth-d/commit/1f09587b2880936bef266b1f6dc80784ce248ea9))
* **openspec:** address fourth-round roborev findings on ui-polish tasks ([28c8072](https://github.com/davidirvine/synth-d/commit/28c807242a4d98431edf48f5633b2ab36d010fcb))
* **openspec:** address second-round roborev findings on ui-polish tasks ([440d2bc](https://github.com/davidirvine/synth-d/commit/440d2bc54873c701c5c098626f88419adaf84602))
* **openspec:** address third-round roborev findings on ui-polish tasks ([1e802b6](https://github.com/davidirvine/synth-d/commit/1e802b63a5bec22f4da01cd8619ea4308ffb4b48))
* **openspec:** renumber tasks 6.4/6.5 to 6.3/6.4 after merging old 6.3 ([2898319](https://github.com/davidirvine/synth-d/commit/289831911a5aee36b4e168d7455882998cc137f8))
* **reverb:** add fi.dcblocker to reverb wet path to remove DC bias ([fac64cd](https://github.com/davidirvine/synth-d/commit/fac64cd98805ba547c395c0b177beeb9558f964b))
* **reverb:** commit synth.json artifact and correct ba.clip in design.md ([02b89c9](https://github.com/davidirvine/synth-d/commit/02b89c9402f7def6e3e17c84c3d774caaccaafa6))
* **reverb:** correct FAUST pseudocode and task descriptions ([a77f760](https://github.com/davidirvine/synth-d/commit/a77f76054cde812e593c2a8b5e220ce4214e2aa0))
* **reverb:** fix silent reverb - replace +~ with ~ to correctly excite freeverb ([8c92bd2](https://github.com/davidirvine/synth-d/commit/8c92bd21adb4513c24578d0baa94be38cec95879))
* **reverb:** smooth reverb params to eliminate zipper noise ([0824946](https://github.com/davidirvine/synth-d/commit/08249464de56c1d9b42d0b2def549e85ab9ea850))
* **reverb:** use ba.clip(-1,1) to preserve bipolar audio in shimmer feedback ([7937ca9](https://github.com/davidirvine/synth-d/commit/7937ca95b10bd9725e2747c86953348b30510c70))
* **scripts:** switch back to develop after stax create in opsx-apply-worktree ([1966371](https://github.com/davidirvine/synth-d/commit/1966371f14eb445c8cadcdec9c2300d0cc12727a))
* **specs:** correct canonical specs, restore github-actions-cicd artifacts ([#4](https://github.com/davidirvine/synth-d/issues/4)) ([c8d3728](https://github.com/davidirvine/synth-d/commit/c8d3728616206e14ed7780e8682afea6bbcdc724))
* **ui:** address verification warnings — disabled states, stacked noise btns, doc updates ([7a411b8](https://github.com/davidirvine/synth-d/commit/7a411b848f8715338f13c807dfe5015c84d6c8ca))
