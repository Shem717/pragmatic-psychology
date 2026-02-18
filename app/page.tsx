'use client';

import React, { useState, useRef } from 'react';
import { Brain, Zap, RefreshCw, ShieldCheck, Activity, ArrowRight, Lock, X, CheckCircle } from 'lucide-react';

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const scienceRef = useRef<HTMLElement>(null);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">

      {/* Email Capture Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
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
                <h3 className="text-2xl font-bold text-white mb-2">You're In.</h3>
                <p className="text-slate-400">The full protocol is on its way to your inbox.</p>
              </div>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-cyan-400 mb-4">
                  <Activity className="w-3 h-3" />
                  <span>Free — Applied Neuroscience Framework</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Get The Full Protocol</h3>
                <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                  Enter your email and we'll send you the complete Pragmatic Psychology reprogramming framework — the 5-step system to update your body's predictive coding.
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
                <p className="mt-4 text-xs text-slate-600 text-center">No spam. Unsubscribe anytime.</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-cyan-400" />
            <span className="font-bold tracking-tight text-white">Pragmatic Psychology</span>
          </div>
          <button
            onClick={openModal}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-lg font-medium transition-all text-sm"
          >
            Get the Protocol
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-medium text-cyan-400 mb-6">
            <Activity className="w-3 h-3" />
            <span>Applied Neuroscience Framework</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
            You're Not Broken. <br />
            You're Running <span className="text-cyan-400">Outdated Protection Protocols</span>.
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            You've analyzed your trauma. You understand your patterns. But your nervous system doesn't read your journal.
            <br className="hidden md:block" />
            Learn the neurobiological protocol to update your body's predictive coding directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={openModal}
              className="bg-cyan-500 hover:bg-cyan-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              Start The Reprogramming <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollTo(scienceRef)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-8 py-4 rounded-xl font-medium text-lg transition-all border border-slate-700"
            >
              Read The Science
            </button>
          </div>
        </div>
      </section>

      {/* The Problem: System 1 vs System 2 */}
      <section ref={scienceRef as React.RefObject<HTMLDivElement>} className="py-24 bg-slate-900 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Why "Doing The Work" Hasn't Fixed It</h2>
              <p className="text-slate-400 mb-6 leading-relaxed">
                You understand your triggers. You've journaled. You rationally know you're safe. Yet your heart still races. Why?
              </p>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Because you have a <strong className="text-cyan-400">Mind-Body Lag</strong>. Your cortex (System 1) knows the truth, but your amygdala (System 2) is still running predictive models based on old trauma. Logic doesn't speak to the amygdala. Experience does.
              </p>
              <ul className="space-y-4">
                {[
                  "The High Road: Conscious, Logical, Slow (Updated via Therapy)",
                  "The Low Road: Unconscious, Visceral, Fast (Updated via Experience)",
                  "The Gap: Mental calm vs. Physical terror"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <ShieldCheck className="w-5 h-5 text-cyan-500 mt-1 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 shadow-2xl relative">
              <div className="absolute top-4 right-4 bg-red-500/10 text-red-400 text-xs px-2 py-1 rounded border border-red-500/20">
                Low Road Alert
              </div>
              <div className="space-y-6 font-mono text-sm">
                <div className="p-4 bg-slate-900 rounded border border-slate-800">
                  <div className="text-slate-500 mb-1">// High Road (Cortex)</div>
                  <div className="text-green-400">Status: SAFE</div>
                  <div className="text-slate-400">"This email is not a threat."</div>
                </div>
                <div className="flex justify-center text-slate-600">↓ NO CONNECTION ↓</div>
                <div className="p-4 bg-slate-900 rounded border border-red-900/30">
                  <div className="text-slate-500 mb-1">// Low Road (Amygdala)</div>
                  <div className="text-red-400 animate-pulse">Status: DANGER DETECTED</div>
                  <div className="text-slate-400">Initiating fight-or-flight response...</div>
                  <div className="text-slate-400">Heart rate: ELEVATED</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution: Predictive Processing */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">The Mechanism: Predictive Processing</h2>
          <p className="text-slate-400 text-lg">
            Your brain is a prediction machine. Anxiety is simply a prediction error. <br className="hidden md:block" />
            <span className="text-cyan-400 font-mono">Threat Probability × Coping Capacity = Anxiety Response</span>
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { icon: RefreshCw, title: "Identify the Error", desc: "Pinpoint where your brain is overestimating threat or underestimating capacity based on past data." },
            { icon: Zap, title: "Visceral Counter-Programming", desc: "Run intense, embodied simulations. If the trauma was loud, the cure cannot be quiet. Override the fear with dominance." },
            { icon: Lock, title: "Reconsolidate Memory", desc: "Open the neural pathway and overwrite the fear response with a new experience of mastery." }
          ].map((card, i) => (
            <div key={i} className="bg-slate-900/50 p-8 rounded-xl border border-slate-800 hover:border-cyan-500/50 transition-all group">
              <card.icon className="w-10 h-10 text-cyan-500 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
              <p className="text-slate-400 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The Protocol Steps */}
      <section className="py-24 bg-slate-900 px-6 border-y border-slate-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">The Reprogramming Protocol</h2>
            <p className="text-slate-400 mt-4">5 Steps to Psychological Sovereignty</p>
          </div>
          <div className="space-y-8">
            {[
              { step: "01", title: "Identify the Prediction Error", desc: "Write out: 'My brain predicts X is dangerous. The reality is Y.'" },
              { step: "02", title: "Separate Identity from State", desc: "You are not 'anxious'. You are a person whose system is running an anxiety loop." },
              { step: "03", title: "Design Embodied Simulations", desc: "Create intense, visceral mental scenarios where you dominate the threat. Not calm—powerful." },
              { step: "04", title: "Hebbian Wiring", desc: "Neurons that fire together, wire together. Manually build the new highway through high-frequency repetition." },
              { step: "05", title: "Tolerate The Lag", desc: "Lead, don't follow. The physical fear is just residual momentum, not a signal of current truth." }
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start p-6 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-4xl font-black text-slate-800">{item.step}</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-cyan-900/10 to-slate-950 pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Stop Managing Symptoms. <br />Start Rewiring Code.</h2>
          <p className="text-xl text-slate-400 mb-10">
            You don't need another therapist. You need to become the programmer of your own mind.
          </p>
          <button
            onClick={openModal}
            className="bg-white text-slate-950 hover:bg-slate-200 px-10 py-5 rounded-xl font-bold text-xl transition-all shadow-xl shadow-cyan-500/10"
          >
            Get The Full Framework
          </button>
          <p className="mt-6 text-sm text-slate-500">
            Based on Applied Neuroscience & Memory Reconsolidation
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800 text-center text-slate-600">
        <p>© 2026 Pragmatic Psychology. All rights reserved.</p>
      </footer>

    </div>
  );
}
