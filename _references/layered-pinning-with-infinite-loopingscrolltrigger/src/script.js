gsap.registerPlugin(ScrollTrigger);

let panels = gsap.utils.toArray(".panel"),
    copy = panels[0].cloneNode(true);
panels[0].parentNode.appendChild(copy); // copy the first panel to the end (for seamless looping)

panels.forEach((panel, i) => {
  ScrollTrigger.create({
    trigger: panel,
    start: "top top", 
    pin: true, 
    pinSpacing: false 
  });
});

let maxScroll;
let pageScrollTrigger = ScrollTrigger.create({ // snap whole page to the closest section!
  // normally we'd just do snap: 1 / panels.length but we'll use a function-based value so that we can handle the very start and end values in a special way to prevent looping on the snap
  snap(value) {
    let snappedValue = gsap.utils.snap(1 / panels.length, value);
    if (snappedValue <= 0) { // don't let it go all the way back to exactly 0 or it'll wrap. Keep it a bit more than 1px from the top.
      return 1.05 / maxScroll;
    } else if (snappedValue >= 1) { // don't let it go all the way to the end or it'll wrap. Keep it a bit more than 1px from the bottom. 
      return maxScroll / (maxScroll + 1.05);
    }
    return snappedValue;
  }  
});
function onResize() {
  maxScroll = ScrollTrigger.maxScroll(window) - 1;
}
onResize();
window.addEventListener("resize", onResize);
// make sure we use a non-passive event listener so that we can preventDefault() on the scroll if it's at the very top or bottom
window.addEventListener("scroll", e => {
  let scroll = pageScrollTrigger.scroll()
  if (scroll > maxScroll) {
    pageScrollTrigger.scroll(1);
    e.preventDefault();
  } else if (scroll < 1) {
    pageScrollTrigger.scroll(maxScroll - 1);
    e.preventDefault();
  }
}, {passive: false});

