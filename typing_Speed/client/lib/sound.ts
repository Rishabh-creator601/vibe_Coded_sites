let ctx: AudioContext | null = null;

/** Soft click per key, a lower thud for mistakes. Only called when the sound setting is on. */
export function playKey(isError: boolean) {
  try {
    ctx ??= new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = isError ? "square" : "triangle";
    osc.frequency.value = isError ? 140 : 620;
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  } catch {
    /* audio unavailable */
  }
}
