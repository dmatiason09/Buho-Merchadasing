gsap.registerPlugin(SplitText);

let split, animation;
document.querySelector("#chars").addEventListener("click", () => {
  animation && animation.revert();
  animation = gsap.from(split.chars, {
    x: 150,
    opacity: 0,
    duration: 0.7, 
    ease: "power4",
    stagger: 0.04
  })
});

document.querySelector("#words").addEventListener("click", () => {
  animation && animation.revert();
  animation = gsap.from(split.words, {
    y: -100,
    opacity: 0,
    rotation: "random(-80, 80)",
    duration: 0.7, 
    ease: "back",
    stagger: 0.15
  })
});

document.querySelector("#lines").addEventListener("click", () => {
  animation && animation.revert();
  animation = gsap.from(split.lines, {
    rotationX: -100,
    transformOrigin: "50% 50% -160px",
    opacity: 0,
    duration: 0.8, 
    ease: "power3",
    stagger: 0.25
  })
});

function setup() {
  split && split.revert();
  animation && animation.revert();
  split = SplitText.create(".text", {type:"chars,words,lines"});
}
setup();
window.addEventListener("resize", setup);