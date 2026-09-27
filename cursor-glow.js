const el = document.documentElement;
let x = 0,
  y = 0,
  tx = 0,
  ty = 0,
  raf = null;

addEventListener("mousemove", (e) => {
  tx = e.clientX;
  ty = e.clientY;
  if (!raf) raf = requestAnimationFrame(tick);
});

function tick() {
  x += (tx - x) * 0.18;
  y += (ty - y) * 0.18;
  el.style.setProperty("--cursor-x", x + "px");
  el.style.setProperty("--cursor-y", y + "px");
  raf =
    Math.abs(tx - x) > 0.5 || Math.abs(ty - y) > 0.5
      ? requestAnimationFrame(tick)
      : null;
}
