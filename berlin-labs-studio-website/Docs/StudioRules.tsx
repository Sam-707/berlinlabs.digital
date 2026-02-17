import React from 'react';

/**
 * BERLINLABS Studio Rules & Principles
 *
 * This document defines how BerlinLabs builds, evaluates, and evolves products and experiments.
 * It exists to reduce noise, prevent confusion, and protect long-term clarity.
 */

export const StudioRules: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto p-12 text-slate-800 dark:text-slate-200 leading-relaxed font-sans animate-in fade-in duration-700">
      <header className="mb-16">
        <div className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold mb-4">Studio Constitution</div>
        <h1 className="text-4xl font-display font-bold mb-6 tracking-tight">BerlinLabs — Studio Rules</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-light italic">
          This document defines the operational discipline of BERLINLABS. It ensures intentionality,
          reduces confusion, and protects long-term clarity in every initiative.
        </p>
      </header>

      <div className="prose dark:prose-invert max-w-none text-sm space-y-12">

        {/* === PART 1: WHAT WE ARE === */}

        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 border-b border-slate-100 dark:border-white/5 pb-2">
            1. What We Are
          </h2>
          <p>
            BerlinLabs is a <strong>product studio</strong>. We build products (with a promise),
            prototypes (near-product), and experiments (question-first).
          </p>
          <p className="mt-4">
            We operate as the <strong>operational layer</strong> for independent businesses.
            We design digital foundations that allow business processes to scale without fragmentation.
          </p>
        </section>

        {/* === PART 2: CORE DISTINCTIONS === */}

        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 border-b border-slate-100 dark:border-white/5 pb-2">
            2. Core Distinctions
          </h2>
          <div className="space-y-4">
            <p>
              An <strong>experiment</strong> exists to answer a question.<br />
              A <strong>product</strong> exists to solve a repeated problem.
            </p>
            <p className="text-slate-500 italic">
              Experiments are allowed to fail. Products must deliver.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 border-b border-slate-100 dark:border-white/5 pb-2">
            3. Status Ladder
          </h2>
          <div className="bg-slate-900 p-4 rounded-xl font-mono text-[10px] text-primary tracking-widest text-center">
            EXPERIMENT → PROTOTYPE → PRODUCT
          </div>
        </section>

        {/* === PART 3: OPERATIONAL PRINCIPLES === */}

        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 border-b border-slate-100 dark:border-white/5 pb-2">
            4. Friction First
          </h2>
          <p>
            Every initiative must address a defined operational friction.
            Clarity and reduced workload are the primary metrics of success.
          </p>
          <p className="mt-4 text-slate-500 italic">
            If complexity is not reduced by a feature, it is removed.
          </p>
        </section>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 border-b border-slate-100 dark:border-white/5 pb-2">
            5. Validation & Graduation
          </h2>
          <p>
            Experiments graduate to products only when operational necessity is evident
            through repeatable usage and measurable time savings.
          </p>
          <ul className="mt-4 space-y-2 list-disc list-inside">
            <li><strong>Gate 1 (Pull):</strong> Unprompted requests or organic sharing</li>
            <li><strong>Gate 2 (Identity):</strong> "This is for [person] who needs [outcome]"</li>
            <li><strong>Gate 3 (Stability):</strong> Focus shifts from 'what' to 'reliability'</li>
          </ul>
        </section>

        {/* === PART 4: STUDIO ARCHIVE === */}

        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 border-b border-slate-100 dark:border-white/5 pb-2">
            6. Studio Archive
          </h2>
          <p>
            The archive is institutional memory. It preserves experiments safely and makes
            our thinking visible without selling.
          </p>
          <p className="mt-4">
            Experiments must document why they exist and what they are trying to learn.
            They are allowed to fail and allowed to be public.
          </p>
        </section>

        {/* === PART 5: WHAT WE AVOID === */}

        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 border-b border-slate-100 dark:border-white/5 pb-2">
            7. What We Avoid
          </h2>
          <p className="text-slate-500 italic">
            Premature monetization, vanity metrics, over-engineering, and converting
            experiments into hype.
          </p>
        </section>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 border-b border-slate-100 dark:border-white/5 pb-2">
            8. Design Restraint
          </h2>
          <p>
            Systems should perform invisibly. We architect for longevity.
            Transient technology is avoided in favor of durable, functional systems
            that solve core problems.
          </p>
        </section>

        {/* === PART 6: DECISION RULE === */}

        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 border-b border-slate-100 dark:border-white/5 pb-2">
            9. Decision Rule
          </h2>
          <p>
            When unsure, choose the option that <strong>reduces confusion</strong> and
            <strong>preserves optionality</strong> while keeping scope small.
          </p>
        </section>

      </div>

      <footer className="pt-24 pb-12 text-center border-t border-slate-100 dark:border-white/5 mt-24">
        <p className="text-[9px] uppercase tracking-[0.5em] text-primary font-bold">
          Practical. Validated. Stable.
        </p>
      </footer>
    </div>
  );
};

export default StudioRules;
