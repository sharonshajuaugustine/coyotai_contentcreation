// Minimal DOM-based confetti burst — no external dependency, ~20 emoji
// particles that fall and fade. Used once when an idea first crosses into
// "Done" as a small reward moment for the video maker.
export function burstConfetti() {
  const emojis = ["🎉", "✨", "🦊", "🌸"];
  for (let i = 0; i < 20; i++) {
    const el = document.createElement("div");
    el.textContent = emojis[i % emojis.length];
    el.style.position = "fixed";
    el.style.left = `${Math.random() * 100}vw`;
    el.style.top = "-2rem";
    el.style.fontSize = `${12 + Math.random() * 14}px`;
    el.style.zIndex = "9999";
    el.style.pointerEvents = "none";
    el.style.transition = "transform 1.6s ease-in, opacity 1.6s ease-in";
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transform = `translateY(${80 + Math.random() * 20}vh) rotate(${Math.random() * 360}deg)`;
      el.style.opacity = "0";
    });
    setTimeout(() => el.remove(), 1700);
  }
}
