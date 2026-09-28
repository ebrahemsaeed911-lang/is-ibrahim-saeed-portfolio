/* Line-by-line reveal.
   CSS cannot detect where a paragraph wraps, so split the text into words,
   measure where each word actually lands, group words that share a line,
   and expose that as a --line index. The stagger in SCSS is driven by it.
   Re-runs on resize because reflowing the text changes the line breaks. */

const SELECTOR = ".bio__heading, .bio__objective";
const LINE_TOLERANCE = 4;

function splitIntoWords(element) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes = [];

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeValue.trim()) textNodes.push(node);
  }

  const words = [];

  for (const textNode of textNodes) {
    const fragment = document.createDocumentFragment();
    const parts = textNode.nodeValue.split(/(\s+)/);

    for (const part of parts) {
      if (!part) continue;

      if (/^\s+$/.test(part)) {
        fragment.appendChild(document.createTextNode(part));
        continue;
      }

      const word = document.createElement("span");
      word.className = "reveal-word";
      word.textContent = part;
      fragment.appendChild(word);
      words.push(word);
    }

    textNode.parentNode.replaceChild(fragment, textNode);
  }

  return words;
}

function assignLineIndices(words) {
  let index = -1;
  let previousTop = null;

  for (const word of words) {
    const top = Math.round(word.offsetTop);

    if (previousTop === null || Math.abs(top - previousTop) > LINE_TOLERANCE) {
      index++;
      previousTop = top;
    }

    word.style.setProperty("--line", index);
  }

  return index + 1;
}

function prepare(element) {
  if (element.dataset.revealReady) return null;

  const words = splitIntoWords(element);
  if (!words.length) return null;

  element.dataset.revealReady = "";
  return { element, words };
}

const prepared = [];
const groups = new Set(document.querySelectorAll(SELECTOR));

for (const group of groups) {
  const result = prepare(group);
  if (result) prepared.push(result);
}

function measure() {
  for (const { words } of prepared) assignLineIndices(words);
}

if (prepared.length) {
  measure();
  // one frame later so fonts are loaded and the line boxes are final
  requestAnimationFrame(() => {
    measure();
    for (const { element } of prepared) element.classList.add("reveal-ready");
  });

  let resizeTimer;
  addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measure, 150);
  });
}
