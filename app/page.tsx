'use client';

import React, { useState, useRef } from 'react';
import {
  Brain,
  Activity,
  ArrowRight,
  X,
  CheckCircle,
  Play,
  FlaskConical,
  Target,
  AlertTriangle,
} from 'lucide-react';

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const videosRef = useRef<HTMLElement>(null);
  const scienceRef = useRef<HTMLElement>(null);
  const protocolRef = useRef<HTMLElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openModal = () => {
    setSubmitted(false);
    setEmail('');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setShowModal(false);
      setSubmitted(false);
      setEmail('');
    }, 2500);
  };

  const videos = [
    {
      id: 'TOTW_bsKkbE',
      episode: '01',
      title: "Why Your Anxiety Isn't Broken",
      description:
        "The High Road / Low Road model of fear. Why your brain is doing exactly what it was designed to do — and why willpower and talk therapy can't reach the Low Road.",
    },
    {
      id: 'eX1_yI7scug',
      episode: '02',
      title: 'The Mental Simulation Protocol',
      description:
        'The 6-step system for rewriting predictive codes at source. Intensity requirements, repetition thresholds, and the incompatible states principle.',
    },
    {
      id: 'AipBMvDBw70',
      episode: '03',
      title: 'The Neuroscience of Why This Works',
      description:
        'Memory reconsolidation (Nader & LeDoux, 2000), predictive coding (Friston), and constructed emotion (Barrett). The peer-reviewed mechanisms behind the protocol.',
    },
    {
      id: 'ieR3n0laLAg',
      episode: '04',
      title: 'Troubleshooting the Protocol',
      description:
        'The 5 failure modes, how to find the root prediction vs. surface trigger, Yerkes-Dodson intensity calibration, and adaptations for aphantasia.',
    },
  ];

  const protocolSteps = [
    {
      number: '01',
      title: 'Identify the Trigger',
      description:
        'Map the exact situation that activates the fear response. Not the emotion — the predictive code. Your brain fires this prediction before the event happens.',
    },
    {
      number: '02',
      title: 'Map the Prediction Error',
      description:
        "What outcome is your brain predicting? Fear is not a feeling — it's a forecast. You need the precise forecast to update it. Surface triggers mask root predictions.",
    },
    {
      number: '03',
      title: 'Design Incompatible Scenarios',
      description:
        "Create mental scenarios that make the fear prediction physically impossible. Not calm alternatives — viscerally, absurdly, over-the-top incompatible. Mild is useless.",
    },
    {
      number: '04',
      title: 'Run With Full Emotional Engagement',
      description:
        'The simulation must feel real to the amygdala. Calm visualization does nothing. Intensity is not optional — it is the mechanism. The Low Road updates on activation, not cognition.',
    },
    {
      number: '05',
      title: 'Repeat 50–100+ Times',
      description:
        'Your brain updates predictions through Bayesian weight-shifting. Single exposures do not move the needle. Repetition is how the new prediction gains enough predictive mass to displace the old one.',
    },
    {
      number: '06',
      title: 'Test in Real-World Exposure',
      description:
        'Controlled real-world re-exposure confirms the update. This is where reconsolidation is verified — and where you reclaim psychological sovereignty over the pattern.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">

      {/* ── EMAIL CAPTURE MODAL ─────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full mx-6 relative shadow-2xl shadow-cyan-500/10">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">{"You're In."}</h3>
                <p className="text-slate-400">
                  The full protocol framework is on its way to your inbox.
                </p>
              </div>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-cyan-400 mb-4">
                  <Activity className="w-3 h-3" />
                  <span>Free — Applied Neuroscience Framework</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Get The Full Protocol</h3>
                <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                  The complete 6-step reprogramming framework as a PDF — including intensity
                  calibration guide, failure mode checklist, and the reconsolidation protocol for
                  CPTSD.
                </p>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    Send Me The Protocol <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
                <p className="mt-4 text-xs text-slate-600 text-center">
                  No spam. Unsubscribe anytime.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-white text-sm tracking-tight">
              Pragmatic Psychology
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-xs text-slate-400">
            <button
              onClick={() => scrollTo(videosRef)}
              className="hover:text-white transition-colors"
            >
              The Series
            </button>
            <button
              onClick={() => scrollTo(protocolRef)}
              className="hover:text-white transition-colors"
            >
              The Protocol
            </button>
            <button
              onClick={() => scrollTo(scienceRef)}
              className="hover:text-white transition-colors"
            >
              The Science
            </button>
          </div>
          <button
            onClick={openModal}
            className="bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all"
          >
            Get the Protocol
          </button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-cyan-400 mb-8">
            <Play className="w-3 h-3" />
            <span>4-Part Video Series · Applied Neuroscience</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tight mb-6">
            Your Brain<br />
            {"Isn't"} <span className="text-cyan-400">Broken.</span><br />
            {"It's"} Running<br />
            Outdated Software.
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl leading-relaxed mb-4">
            Fear, anxiety, and compulsive patterns are not malfunctions. They are prediction
            codes — installed by experience, running automatically on the Low Road (amygdala)
            before your conscious mind can intervene. The High Road (cortex) cannot overwrite
            them through talk. But it can through simulation.
          </p>

          <p className="text-base text-slate-400 max-w-2xl leading-relaxed mb-10">
            I eliminated a lifelong dog phobia and a bee phobia using nothing but mental
            simulation. No therapist. No medication. No years of CBT. This series is the exact
            mechanism — sourced from peer-reviewed neuroscience — explained in four videos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => scrollTo(videosRef)}
              className="group bg-cyan-500 hover:bg-cyan-400 text-white font-bold px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Play className="w-4 h-4" />
              Watch Episode 1 Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollTo(scienceRef)}
              className="border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-bold px-8 py-4 rounded-xl transition-all text-sm"
            >
              Read The Science
            </button>
          </div>
        </div>
      </section>

      {/* ── THE PROBLEM ──────────────────────────────────────── */}
      <section className="py-20 px-6 bg-slate-900/40">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-orange-400 mb-8">
            <AlertTriangle className="w-3 h-3" />
            <span>{"Why Everything You've Tried Has Failed"}</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight mb-8">
            Therapy Talks to the Wrong<br />Part of Your Brain
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-slate-800/50 border border-red-900/40 rounded-2xl p-6">
              <div className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3">
                The High Road (Cortex)
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                Conscious thought, language, logic, narrative. This is what therapy addresses. It
                can recognize that a situation is objectively safe. It cannot make the amygdala
                agree.
              </p>
              <p className="text-red-400/80 text-xs">
                {"↳ Talk therapy, CBT, journaling, affirmations — all High Road interventions. The High Road doesn't have write access to the Low Road."}
              </p>
            </div>

            <div className="bg-slate-800/50 border border-cyan-900/40 rounded-2xl p-6">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3">
                The Low Road (Amygdala)
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                Subcortical, pre-conscious, faster than thought. This is where fear actually
                lives — as a predictive code, not a memory. It fires before you can intervene.
              </p>
              <p className="text-cyan-400/80 text-xs">
                {"↳ The Low Road can only be updated through reconsolidation — which requires emotional activation, not cognitive reframing."}
              </p>
            </div>
          </div>

          <p className="text-slate-400 text-lg leading-relaxed max-w-3xl">
            Joseph LeDoux identified two fear pathways in 1996. The short route — thalamus
            directly to amygdala — bypasses the cortex entirely. {"It's"} why you flinch before
            you think. Talking about the flinch {"doesn't"} stop the flinch. Reprogramming the
            prediction does.
          </p>
        </div>
      </section>

      {/* ── THE VIDEO SERIES ─────────────────────────────────── */}
      <section ref={videosRef as React.RefObject<HTMLDivElement>} className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-cyan-400 mb-6">
              <Play className="w-3 h-3" />
              <span>The Complete Series</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
              Four Videos. One Framework.
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Watch in order. Each episode builds on the last. Episode 1 establishes the model.
              Episode 4 is where most people fail — and where this framework separates from
              everything else.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
              >
                <div className="aspect-video w-full bg-slate-950">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
                <div className="p-6">
                  <div className="text-5xl font-black text-slate-800 leading-none mb-3">
                    {video.episode}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{video.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{video.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE 6-STEP PROTOCOL ──────────────────────────────── */}
      <section
        ref={protocolRef as React.RefObject<HTMLDivElement>}
        className="py-20 px-6 bg-slate-900/40"
      >
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-cyan-400 mb-8">
            <Target className="w-3 h-3" />
            <span>The Mental Simulation Protocol</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Six Steps to<br />Psychological Sovereignty
          </h2>
          <p className="text-slate-400 text-lg mb-12 max-w-2xl">
            This is not a relaxation technique. It is not exposure therapy. It is a deliberate
            rewrite of the prediction code using memory reconsolidation and Bayesian
            weight-shifting.
          </p>

          <div className="space-y-4">
            {protocolSteps.map((step) => (
              <div
                key={step.number}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex gap-6"
              >
                <div className="text-3xl font-black text-slate-700 leading-none shrink-0 w-10">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-white font-bold mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-cyan-950/30 border border-cyan-900/40 rounded-2xl p-6">
            <p className="text-cyan-300 text-sm leading-relaxed">
              <span className="font-bold">Critical note on intensity:</span> The most common
              failure mode is running the simulation too calmly. The amygdala does not update on
              mild simulations. The emotional activation must be visceral, over-the-top, and
              physically felt. If {"you're"} comfortable during the simulation, {"you're"} not
              doing it correctly. Episode 4 covers all five failure modes in full.
            </p>
          </div>
        </div>
      </section>

      {/* ── THE SCIENCE ──────────────────────────────────────── */}
      <section ref={scienceRef as React.RefObject<HTMLDivElement>} className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-violet-400 mb-8">
            <FlaskConical className="w-3 h-3" />
            <span>Peer-Reviewed Mechanisms</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            {"This Isn't Pseudoscience."}<br />
            {"It's"} Applied Neuroscience.
          </h2>
          <p className="text-slate-400 text-lg mb-12 max-w-2xl">
            Every claim in this framework is traceable to peer-reviewed research. Episode 3
            walks through the full mechanistic case.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">
                Memory Reconsolidation
              </div>
              <p className="text-white font-semibold mb-2">Karim Nader & Joseph LeDoux</p>
              <p className="text-slate-400 text-sm leading-relaxed">
                2000{' '}
                <em>Nature</em> paper demonstrated that consolidated fear memories become labile
                upon reactivation — and can be rewritten before restabilizing. Fear is not
                permanent. It is a file that can be opened and overwritten.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">
                Predictive Coding
              </div>
              <p className="text-white font-semibold mb-2">Karl Friston</p>
              <p className="text-slate-400 text-sm leading-relaxed">
                The brain is not a passive receiver of sensation — it is a prediction machine
                that models expected outcomes and fires in advance. Anxiety is a high-confidence
                prediction, not a response to reality. The protocol targets the prediction
                weight, not the sensation.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">
                Constructed Emotion
              </div>
              <p className="text-white font-semibold mb-2">Lisa Feldman Barrett</p>
              <p className="text-slate-400 text-sm leading-relaxed">
                Emotions are not hardwired reflexes — they are constructions, built from
                interoceptive predictions and conceptual knowledge. This means they are
                updatable. The emotional response you have today is not the one you are locked
                into.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">
                Reconsolidation vs. Extinction
              </div>
              <p className="text-white font-semibold mb-2">
                Daniela Schiller & Michelle Craske
              </p>
              <p className="text-slate-400 text-sm leading-relaxed">
                Standard exposure therapy creates an extinction memory — a competing file that
                suppresses but does not delete the fear. Reconsolidation rewrites the original
                file. The difference is why exposure therapy produces relapse. This protocol
                targets reconsolidation, not extinction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPARISON + FINAL CTA ───────────────────────────── */}
      <section className="py-20 px-6 bg-slate-900/40">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-slate-900 border border-red-900/30 rounded-2xl p-6">
              <div className="text-xs font-bold text-red-400 uppercase tracking-widest mb-4">
                Traditional Therapy
              </div>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex gap-2">
                  <span className="text-red-500 shrink-0">✕</span> Targets the High Road
                  (cortex)
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 shrink-0">✕</span> Builds extinction memories
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 shrink-0">✕</span> High relapse rate
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 shrink-0">✕</span> Requires ongoing dependence
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 shrink-0">✕</span> Years of weekly sessions
                </li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-red-900/30 rounded-2xl p-6">
              <div className="text-xs font-bold text-red-400 uppercase tracking-widest mb-4">
                Willpower / Mindset
              </div>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex gap-2">
                  <span className="text-red-500 shrink-0">✕</span> Tries to suppress the Low
                  Road
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 shrink-0">✕</span> Requires constant effort
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 shrink-0">✕</span> Collapses under stress
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 shrink-0">✕</span> Treats symptoms, not code
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 shrink-0">✕</span> Reinforces the belief{' '}
                  {"you're"} broken
                </li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-cyan-900/40 rounded-2xl p-6">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4">
                This Protocol
              </div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex gap-2">
                  <span className="text-cyan-400 shrink-0">✓</span> Targets the Low Road
                  directly
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-400 shrink-0">✓</span> Rewrites the prediction code
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-400 shrink-0">✓</span> Self-administered — no
                  therapist
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-400 shrink-0">✓</span> Reconsolidation, not
                  extinction
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-400 shrink-0">✓</span> Durable results, not
                  suppression
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <p className="text-2xl md:text-3xl font-black text-white mb-2">
              {"You don't need a therapist to fix you."}
            </p>
            <p className="text-slate-400 text-lg mb-8">
              You need write access to the Low Road.
            </p>
            <button
              onClick={openModal}
              className="group bg-cyan-500 hover:bg-cyan-400 text-white font-bold px-10 py-5 rounded-xl transition-all inline-flex items-center justify-center gap-2 text-base"
            >
              Get The Full Protocol
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="mt-4 text-xs text-slate-600">
              Free. The complete 6-step framework + failure mode guide.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="py-12 px-6 border-t border-slate-800/60">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-500 text-sm font-medium">Pragmatic Psychology</span>
          </div>
          <p className="text-slate-600 text-xs text-center">
            This content is for educational purposes. Not a substitute for clinical care if you
    0       are experiencing a mental health crisis.
          </p>
          <a
            href="https://www.youtube.com/@Shem717"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 bg-slate-900 border border-slate-700/60 hover:border-red-500/50 rounded-2xl px-4 py-2.5 transition-all hover:bg-slate-800/80 hover:shadow-lg hover:shadow-red-500/10"
          >
            <div className="relative shrink-0">
              <img
                src="https://yt3.googleusercontent.com/TrO0hh4RJslVvACe0SIARvXanp7VVdGxIlmqXy6UVVSzlCITLd0FIelS0wIrcx6gMUe-yXLu=s88-c-k-c0x00ffffff-no-rj"
                alt="Samuel Clow"
                className="w-9 h-9 rounded-full ring-1 ring-slate-700 group-hover:ring-red-500/40 transition-all"
              />
              <svg
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 text-red-500 bg-slate-950 rounded-full p-px"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-semibold leading-none group-hover:text-red-400 transition-colors">
                Samuel Clow
              </p>
              <p className="text-slate-500 text-xs mt-0.5">@Shem717</p>
            </div>
          </a>
        </div>
      </footer>
    </div>
  );
}
