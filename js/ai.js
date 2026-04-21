// ai.js — ZenVitals AI Companion (Advanced Context-Aware Engine)

const AI = {

  // ─── Intent Detection ────────────────────────────────────────────────────────
  _detectIntent(message) {
    const m = message.toLowerCase();
    if (/stress|anxious|anxiety|overwhelm|panic|tense|pressure/.test(m)) return 'stress';
    if (/tired|exhausted|drained|fatigue|no energy|low energy/.test(m)) return 'energy';
    if (/sleep|insomnia|rest|awake|nap|bedtime/.test(m)) return 'sleep';
    if (/motivat|lazy|procrastinat|focus|productive|stuck|uninspired/.test(m)) return 'motivation';
    if (/sad|depress|unhappy|down|hopeless|empty|lonely/.test(m)) return 'mental';
    if (/breath|relax|calm|meditat|mindful/.test(m)) return 'calm';
    if (/exercise|workout|active|move|walk|gym/.test(m)) return 'exercise';
    if (/score|wellness|health|overall|status/.test(m)) return 'score';
    if (/mood|feel|emotion|happy|great/.test(m)) return 'mood';
    if (/eat|diet|nutrition|food|hydrat|water/.test(m)) return 'nutrition';
    return 'general';
  },

  // ─── Scenario Classification ─────────────────────────────────────────────────
  _classifyState(data) {
    const stress = Number(data?.stress ?? data?.STRESS ?? 5);
    const energy = Number(data?.energy ?? data?.ENERGY ?? 5);
    const sleep = Number(data?.sleepHours ?? data?.sleep ?? data?.SLEEP ?? 7);
    const mood = data?.mood ?? 'okay';
    const score = Number(data?.score ?? 50);
    const activity = Number(data?.activity ?? 5);

    const isBurnout = stress > 7 && energy < 4 && sleep < 5;
    const isHighStress = stress > 7;
    const isLowEnergy = energy < 4;
    const isPoorSleep = sleep < 5;
    const isGoodState = stress <= 4 && energy >= 7 && sleep >= 7;
    const isRecovery = stress > 5 && energy < 5;
    const isMoodLow = ['low', 'awful'].includes(mood);

    return { isBurnout, isHighStress, isLowEnergy, isPoorSleep, isGoodState, isRecovery, isMoodLow, stress, energy, sleep, mood, score, activity };
  },

  // ─── Random Picker Helper ────────────────────────────────────────────────────
  _pick(arr) {
    if (!arr || !Array.isArray(arr) || arr.length === 0) {
      return "Keep tracking your wellness — small improvements add up over time.";
    }
    return arr[Math.floor(Math.random() * arr.length)];
  },

  // ─── Scenario Response Library ───────────────────────────────────────────────
  _burnoutResponse(d) {
    return this._pick([
      `⚠️ Based on your recent check-ins, you're showing classic burnout signals — stress at ${d.stress}/10, energy at ${d.energy}/10, and only ${d.sleep}h of sleep. Your body is sending a clear SOS. Today, cancel one non-essential task, drink a full glass of water, and get to bed 45 minutes early.`,
      `⚠️ Your pattern shows a dangerous combo: high stress (${d.stress}/10), depleted energy (${d.energy}/10), and poor sleep (${d.sleep}h). That's burnout territory. Please prioritise rest over output today — even a 20-minute nap and a short walk outside can start turning this around.`,
      `⚠️ Your data paints a burnout picture right now — high stress, low energy, and insufficient sleep all at once. This is your body's way of asking for a full reset. Block 30 minutes this afternoon for total rest, no screens, no tasks.`,
    ]);
  },

  _highStressResponse(d) {
    return this._pick([
      `Your stress level is sitting at ${d.stress}/10 — that's quite elevated. Try the 4-7-8 breathing technique right now: inhale for 4 seconds, hold for 7, exhale for 8. Even two rounds can noticeably lower your tension.`,
      `Based on your check-ins, stress has been a recurring theme (currently ${d.stress}/10). Step away from your screen for 5 minutes — a short walk or just standing outside can lower cortisol faster than you'd expect.`,
      `Your current stress level of ${d.stress}/10 suggests your nervous system is in overdrive. Write down the top 3 things stressing you and pick only one to act on today. Shrinking the list mentally can feel like a weight lifted.`,
      `High stress detected (${d.stress}/10). One underrated fix: progressive muscle relaxation. Tighten each muscle group for 5 seconds, then release, starting from your feet up. It takes under 10 minutes and works.`,
    ]);
  },

  _lowEnergyResponse(d) {
    return this._pick([
      `Your energy is at ${d.energy}/10 — your body is clearly running low. Start with the basics: drink 500ml of water now, eat something with protein in the next hour, and avoid any caffeine after 2 PM.`,
      `Based on your check-ins, your energy has dipped to ${d.energy}/10. A 20-minute power nap (set an alarm!) can restore alertness better than another coffee. Pair it with a 5-minute walk when you wake up.`,
      `Your energy levels (${d.energy}/10) suggest you're running on empty. Consider a short burst of movement — even 10 jumping jacks can trigger an energy release. Also check if you've eaten enough today; low blood sugar silently tanks energy.`,
    ]);
  },

  _poorSleepResponse(d) {
    return this._pick([
      `Your sleep data shows only ${d.sleep} hours — well below the recommended 7–9. Tonight, try dimming all screens 30 minutes before bed and keeping your room cool (around 18°C). Consistency matters more than duration at first.`,
      `Based on your pattern, you're averaging around ${d.sleep}h of sleep. A sleep debt builds fast. Try setting a fixed wake-up time for the next 5 days — even on weekends. Your body clock will start syncing within days.`,
      `${d.sleep} hours isn't giving your brain enough recovery time. One quick win: avoid eating within 2 hours of bedtime. Digestion keeps your body active and delays deep sleep onset.`,
    ]);
  },

  _recoveryResponse(d) {
    return this._pick([
      `Your stress is elevated (${d.stress}/10) while your energy is already low (${d.energy}/10) — that's a recovery moment, not a push-harder moment. Protect your energy today: one task at a time, short breaks every 45 minutes, and an earlier bedtime tonight.`,
      `Your data shows a pattern where stress is outpacing your recovery capacity (stress ${d.stress}, energy ${d.energy}). The fix isn't to try harder — it's to recover smarter. Schedule at least two 10-minute breaks with no phone or work today.`,
    ]);
  },

  _goodStateResponse(d) {
    return this._pick([
      `Your numbers look solid right now — stress at ${d.stress}/10, energy at ${d.energy}/10, and ${d.sleep}h of sleep. This is the momentum window. Use it to tackle something meaningful while you're in this state.`,
      `Based on your recent check-ins, you're in a genuinely good place. Stress is managed, energy is up, sleep is healthy. The best thing you can do is reinforce the habits that got you here — consistency is the real win.`,
      `Your wellness data is looking balanced and strong. When everything aligns like this, it's worth journaling briefly about what's working so you can return to those habits when things get harder.`,
    ]);
  },

  _motivationResponse(d) {
    return this._pick([
      `Motivation follows action, not the other way around. Pick the smallest possible version of what you need to do and start there — even 5 minutes counts. Based on your energy level (${d.energy}/10), small wins are your best bet right now.`,
      `Feeling stuck is usually a sign of task overwhelm, not laziness. Break whatever you're avoiding into 3 micro-steps and do only the first one. Your current energy (${d.energy}/10) is enough for that.`,
      `Your pattern shows you're capable — your best score was ${d.score}/100. Motivation dips are normal. Try a "2-minute start" rule: commit to just 2 minutes on the task. Most people keep going once they've started.`,
    ]);
  },

  _mentalSupportResponse(d) {
    return this._pick([
      `It sounds like you're going through a tough stretch emotionally. Your mood data reflects that too. You don't need to push through right now — acknowledging how you feel is step one. Consider a short journaling session or talking to someone you trust today.`,
      `Based on your recent check-ins, your emotional state has been heavy. That's valid, and it's okay to not be okay. Try a grounding exercise: name 5 things you can see, 4 you can touch, 3 you can hear. It brings you back to the present moment.`,
      `Your wellness data shows emotional stress alongside your other metrics. Be gentle with yourself today. Even small acts of self-care — a warm drink, a short walk, some music you love — genuinely shift your emotional baseline.`,
    ]);
  },

  _sleepAdviceResponse(d) {
    if (d.sleep >= 7) {
      return this._pick([
        `Great news — your ${d.sleep} hours of sleep puts you in the optimal range. Keep protecting that bedtime routine; it's clearly working for your overall score of ${d.score}.`,
        `You're hitting ${d.sleep} hours consistently — that's one of the best things you can do for every other metric. Your energy and stress levels both benefit when sleep is solid. Keep the streak going.`,
      ]);
    }
    return this._poorSleepResponse(d);
  },

  _energyAdviceResponse(d) {
    if (d.energy >= 7) {
      return this._pick([
        `Your energy is at a healthy ${d.energy}/10 right now. Maintain it by keeping meals balanced, staying hydrated, and protecting your sleep — those three are what's driving it.`,
        `Energy at ${d.energy}/10 is a good place to be. Use it strategically — tackle your most demanding tasks in the first half of your day when it's naturally highest.`,
      ]);
    }
    return this._lowEnergyResponse(d);
  },

  _calmResponse() {
    return this._pick([
      `Try box breathing right now: inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat 4 times. It activates your parasympathetic nervous system within minutes.`,
      `The 4-7-8 technique is worth trying: inhale for 4 seconds, hold for 7, exhale slowly for 8. Even one round can noticeably reduce tension. Your nervous system responds faster than you think.`,
      `A simple body scan can help: close your eyes, take three slow breaths, and mentally note where you're holding tension. Then consciously release each spot. It takes 3 minutes and genuinely works.`,
    ]);
  },

  _exerciseResponse(d) {
    return this._pick([
      `Regular movement is one of the highest-leverage wellness habits. Given your current energy (${d.energy}/10), start with a 10-minute walk — low barrier, real benefits. Aim to build to 30 minutes daily over the next two weeks.`,
      `Even light activity resets your stress hormones. With stress at ${d.stress}/10, a 15-minute walk outside could be more effective than any app right now. Fresh air + movement is underrated medicine.`,
      `Target 150 minutes of moderate activity per week — that's just 22 minutes a day. Given your wellness score of ${d.score}, adding consistent movement would likely be the single biggest lever to improve it.`,
    ]);
  },

  _scoreResponse(d) {
    const label = d.score >= 70 ? 'strong' : d.score >= 40 ? 'moderate' : 'low';
    return this._pick([
      `Your current wellness score is ${d.score}/100 — that's a ${label} baseline. Your biggest opportunity right now: ${d.stress > 6 ? 'reducing stress' : d.sleep < 6 ? 'improving sleep' : d.energy < 5 ? 'boosting energy' : 'maintaining consistency'}.`,
      `Score of ${d.score}/100. Based on your check-in data, the fastest path to improvement is addressing your ${d.sleep < 5 ? 'sleep deficit' : d.stress > 7 ? 'elevated stress' : d.energy < 4 ? 'low energy' : 'current habits'}. Focus there first.`,
    ]);
  },

  _moodResponse(d) {
    const moodMap = {
      great: `Your mood is great today — lean into it. This is the right time to do something creative or social.`,
      good: `You're in a good mood, and your overall data supports that. Keep doing what you're doing today.`,
      okay: `An "okay" mood often means you're coasting. One small act of intentionality — a walk, a conversation, a task completed — can shift it toward good.`,
      low: `A low mood, combined with your current metrics (stress ${d.stress}, energy ${d.energy}), suggests your system needs care today. Be kind to yourself and do one thing that genuinely restores you.`,
      awful: `Feeling awful is real and valid. Based on your data, multiple factors may be compounding right now. Please reach out to someone you trust — you don't have to process this alone.`,
    };
    return moodMap[d.mood] || `Your mood is ${d.mood}. Checking in with how you feel is already a step forward.`;
  },

  _nutritionResponse(d) {
    return this._pick([
      `Nutrition has a direct line to your energy (currently ${d.energy}/10) and mood. Try to ensure each meal has protein, healthy fats, and fibre — this combo stabilises blood sugar and keeps energy steady throughout the day.`,
      `Hydration is often the most overlooked energy lever. If your energy is at ${d.energy}/10, drink a full glass of water before assessing what else might help. Most people are mildly dehydrated without knowing it.`,
    ]);
  },

  _fallbackResponse(d) {
    return this._pick([
      `Based on your current data — stress ${d.stress}/10, energy ${d.energy}/10, ${d.sleep}h sleep — your wellness is ${d.score >= 60 ? 'in reasonable shape' : 'asking for some attention'}. Focus on the one area feeling heaviest today and make one small improvement there.`,
      `Your check-in snapshot: stress ${d.stress}/10, energy ${d.energy}/10, sleep ${d.sleep}h, score ${d.score}. ${d.score >= 65 ? "You're doing well overall — stay consistent." : "There's room to improve. Even one good habit stacked daily adds up fast."}`,
      `Looking at your overall pattern, the most impactful thing you can do today is ${d.sleep < 6 ? 'protect your sleep tonight' : d.stress > 6 ? 'do something calming for 10 minutes' : d.energy < 5 ? 'take a real break and rehydrate' : 'keep your current routine going'}. Small, consistent actions compound.`,
    ]);
  },

  // ─── Main Chat Entry Point ───────────────────────────────────────────────────
  chat(message, data) {
    try {
      message = (message || '').toLowerCase().trim();

      if (!data) {
        return "Start your daily check-in so I can give you personalised, data-driven insights. I need your numbers to help properly.";
      }

      const d = this._classifyState(data);
      const intent = this._detectIntent(message);

      // ── Priority 1: Burnout (most critical — check before anything else) ────
      if (d.isBurnout) return this._burnoutResponse(d);

      // ── Priority 2: Message intent (user asked something specific) ──────────
      if (intent === 'stress' || (intent === 'general' && d.isHighStress)) return this._highStressResponse(d);
      if (intent === 'energy') return this._energyAdviceResponse(d);
      if (intent === 'sleep') return this._sleepAdviceResponse(d);
      if (intent === 'motivation') return this._motivationResponse(d);
      if (intent === 'mental') return this._mentalSupportResponse(d);
      if (intent === 'calm') return this._calmResponse();
      if (intent === 'exercise') return this._exerciseResponse(d);
      if (intent === 'score') return this._scoreResponse(d);
      if (intent === 'mood') return this._moodResponse(d);
      if (intent === 'nutrition') return this._nutritionResponse(d);

      // ── Priority 3: Data-driven scenarios (no specific intent detected) ─────
      if (d.isHighStress) return this._highStressResponse(d);
      if (d.isLowEnergy) return this._lowEnergyResponse(d);
      if (d.isPoorSleep) return this._poorSleepResponse(d);
      if (d.isRecovery) return this._recoveryResponse(d);
      if (d.isMoodLow) return this._mentalSupportResponse(d);
      if (d.isGoodState) return this._goodStateResponse(d);

      // ── Priority 4: Intelligent fallback using all available data ───────────
      return this._fallbackResponse(d);
    } catch (e) {
      console.error('AI chat error:', e);
      return "I'm here for you. Try checking in again so I can help better.";
    }
  },

  // ─── Insights Generator (unchanged interface, smarter logic) ────────────────
  generateInsights(data) {
    try {
      const insights = [];
      if (!data) return insights;

      const d = this._classifyState(data);

    // Burnout — surface as highest priority single card
    if (d.isBurnout) {
      insights.push({
        type: 'warning',
        icon: '🔥',
        title: 'Burnout Risk Detected',
        body: `High stress (${d.stress}/10) + low energy (${d.energy}/10) + poor sleep (${d.sleep}h) is a burnout triangle. Your body is asking for a real reset, not just a short break.`,
        action: 'Block 30 minutes today for total rest: no screens, no tasks, no obligations.'
      });
      return insights; // Burnout card is enough — don't pile on
    }

    if (d.isHighStress) {
      insights.push({
        type: 'warning',
        icon: '🧘',
        title: 'High Stress Detected',
        body: `Your stress is at ${d.stress}/10. Sustained high stress elevates cortisol, disrupts sleep, and drains energy — it compounds quickly if left unaddressed.`,
        action: 'Try the 4-7-8 breathing technique twice today — inhale 4s, hold 7s, exhale 8s.'
      });
    }

    if (d.isLowEnergy) {
      insights.push({
        type: 'warning',
        icon: '⚡',
        title: 'Low Energy Alert',
        body: `Energy at ${d.energy}/10 is affecting your productivity and mood. Low energy and high stress create a feedback loop that is hard to break without deliberate recovery.`,
        action: 'Drink water, eat a protein-rich snack, and take a 20-minute power nap if possible.'
      });
    }

    if (d.isPoorSleep) {
      insights.push({
        type: 'warning',
        icon: '💤',
        title: 'Sleep Deficit',
        body: `Only ${d.sleep}h of sleep detected. Your brain clears waste products during sleep — less than 6h consistently impairs memory, mood, and immune function.`,
        action: 'Set a consistent bedtime alarm and dim screens 30 minutes before bed tonight.'
      });
    }

    if (d.activity < 4) {
      insights.push({
        type: 'info',
        icon: '🏃',
        title: 'Movement Needed',
        body: 'Your activity level is low. Even light movement — a 10-minute walk — releases endorphins that directly improve mood and energy within minutes.',
        action: 'Take a short walk on your next break. No gear needed.'
      });
    }

    if (d.isRecovery && !d.isHighStress && !d.isLowEnergy) {
      insights.push({
        type: 'info',
        icon: '🔄',
        title: 'Recovery Mode',
        body: `Stress (${d.stress}/10) is outpacing your energy (${d.energy}/10). Your body needs recovery time, not more output right now.`,
        action: 'Protect your energy — 45-minute work blocks with 10-minute rest breaks.'
      });
    }

    if (d.isMoodLow && !d.isHighStress) {
      insights.push({
        type: 'warning',
        icon: '💙',
        title: 'Low Mood Noted',
        body: `Your mood is logged as "${d.mood}". Emotional state significantly affects how stress and energy are experienced -- it is worth addressing directly.`,
        action: 'Try a 5-minute journaling session or call someone you trust today.'
      });
    }

    if (d.isGoodState) {
      insights.push({
        type: 'positive',
        icon: '✨',
        title: 'Peak Wellness Window',
        body: `Stress is managed (${d.stress}/10), energy is high (${d.energy}/10), and sleep is solid (${d.sleep}h). This is your performance window — use it well.`,
        action: 'Tackle your most important or creative task today while in this state.'
      });
    } else if (d.score >= 70) {
      insights.push({
        type: 'positive',
        icon: '📈',
        title: 'Strong Wellness Score',
        body: `A score of ${d.score}/100 shows you're maintaining healthy habits. Consistency here is what builds long-term resilience.`,
        action: "Keep your current routine -- and note what's working so you can repeat it."
      });
    } else if (d.score >= 40) {
      insights.push({
        type: 'info',
        icon: '🎯',
        title: 'Room to Improve',
        body: `Your score of ${d.score}/100 has real upside. The highest leverage change is usually the one area lagging behind — ${d.sleep < 6 ? 'sleep' : d.stress > 6 ? 'stress' : 'energy'}.`,
        action: `Focus on your ${d.sleep < 6 ? 'sleep routine' : d.stress > 6 ? 'stress management' : 'energy habits'} this week.`
      });
    } else {
      insights.push({
        type: 'warning',
        icon: '💪',
        title: 'Wellness Needs Attention',
        body: `Your score of ${d.score}/100 indicates multiple areas need care. Start with the basics: sleep, hydration, and one stress-relief habit daily.`,
        action: 'Begin tonight: 10-minute wind-down routine, no screens, fixed wake time tomorrow.'
      });
    }

    return insights;
    } catch (e) {
      console.error('AI insights error:', e);
      return [];
    }
  }
};