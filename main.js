import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const track = document.getElementById('track');
const viewport = document.getElementById('viewport');
const menuToggleBtn = document.getElementById('menuToggleBtn');
const btnText = document.getElementById('btnText');
const menuOverlay = document.getElementById('menuOverlay');
const cursorPreview = document.getElementById('cursorPreview');
const previewCard = document.getElementById('previewCard');
const previewIndex = document.getElementById('previewIndex');
const menuButtons = document.querySelectorAll('.menu-btn');
const sections = Array.from(document.querySelectorAll('.section'));

/* ================= 1. HORIZONTAL SCROLL & HIGH-PERFORMANCE MENU COLOR ================= */
let horizontalTween;

function updateMenuButtonColor() {
  if (!menuToggleBtn) return;

  let currentTheme = 'dark';

  if (activeScroller && activeScroller.scrollTop > window.innerHeight * 0.45) {
    const subSlide = activeScroller.querySelector('.section-slide-sub');
    currentTheme = subSlide ? (subSlide.getAttribute('data-theme') || 'dark') : 'dark';
  } else {
    const trackX = Math.abs(gsap.getProperty(track, 'x') || 0);
    const secWidth = window.innerWidth || 1;
    const probeOffset = 60;
    const activeIdx = Math.min(sections.length - 1, Math.max(0, Math.floor((trackX + probeOffset) / secWidth)));
    const activeSection = sections[activeIdx];
    if (activeSection) {
      currentTheme = activeSection.getAttribute('data-theme') || 'dark';
    }
  }

  if (currentTheme === 'light') {
    menuToggleBtn.classList.add('theme-light-bg');
    menuToggleBtn.classList.remove('theme-dark-bg');
  } else {
    menuToggleBtn.classList.add('theme-dark-bg');
    menuToggleBtn.classList.remove('theme-light-bg');
  }
}

function initHorizontalScroll() {
  const getScrollLength = () => track.scrollWidth - window.innerWidth;

  horizontalTween = gsap.to(track, {
    x: () => -getScrollLength(),
    ease: 'none',
    scrollTrigger: {
      trigger: viewport,
      start: 'top top',
      end: () => `+=${getScrollLength()}`,
      pin: true,
      scrub: 1, // 부드럽고 묵직한 GSAP 특유의 버터리 스크롤 관성 (PC/모바일 전체 적용)
      invalidateOnRefresh: true,
      onUpdate: () => {
        updateMenuButtonColor();
      }
    }
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ScrollTrigger.refresh();
      updateMenuButtonColor();
    }, 150);
  });

  updateMenuButtonColor();
}

/* ================= 2. FULLSCREEN MENU TOGGLE ================= */
let isMenuOpen = false;

function toggleMenu() {
  isMenuOpen = !isMenuOpen;
  menuOverlay.classList.toggle('is-open', isMenuOpen);

  if (btnText) {
    btnText.textContent = isMenuOpen ? 'Close' : 'Menu';
  }

  if (isMenuOpen) {
    menuToggleBtn.classList.add('theme-dark-bg');
    menuToggleBtn.classList.remove('theme-light-bg');

    gsap.killTweensOf(menuOverlay);
    gsap.to(menuOverlay, {
      autoAlpha: 1,
      duration: 0.35,
      ease: 'power2.out',
    });
    gsap.fromTo(
      '.menu-item',
      { y: 35, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.05, duration: 0.4, ease: 'power3.out' }
    );
  } else {
    isHovering = false;
    if (cursorPreview) gsap.to(cursorPreview, { opacity: 0, duration: 0.2 });
    gsap.to(menuOverlay, {
      autoAlpha: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: updateMenuButtonColor
    });
  }
}

if (menuToggleBtn) {
  menuToggleBtn.addEventListener('click', toggleMenu);
}

/* ================= 3. DESKTOP MOUSE LAG FOLLOWER PREVIEW ================= */
let targetX = -9999;
let targetY = -9999;
let currentX = -9999;
let currentY = -9999;
let isHovering = false;

if (!ScrollTrigger.isTouch && cursorPreview) {
  gsap.ticker.add(() => {
    if (!isMenuOpen || !isHovering) return;

    if (currentX === -9999 && targetX !== -9999) {
      currentX = targetX;
      currentY = targetY;
    }
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;

    gsap.set(cursorPreview, {
      x: currentX,
      y: currentY,
    });
  });

  menuButtons.forEach((btn) => {
    btn.addEventListener('mouseenter', (e) => {
      isHovering = true;
      const idx = btn.getAttribute('data-index') || '1';
      if (previewIndex) {
        previewIndex.textContent = `[${idx}]`;
      }

      const btnRect = btn.getBoundingClientRect();
      const cardWidth = previewCard ? previewCard.offsetWidth : 360;

      targetY = btnRect.top;
      targetX = Math.min(e.clientX + 40, window.innerWidth - cardWidth - 20);

      if (currentX < -1000) {
        currentX = targetX;
        currentY = targetY;
        gsap.set(cursorPreview, { x: currentX, y: currentY });
      }

      gsap.killTweensOf(cursorPreview);
      gsap.to(cursorPreview, {
        opacity: 1,
        duration: 0.25,
        ease: 'power2.out',
      });
    });

    btn.addEventListener('mousemove', (e) => {
      const btnRect = btn.getBoundingClientRect();
      const cardWidth = previewCard ? previewCard.offsetWidth : 360;

      targetY = btnRect.top;
      targetX = Math.min(e.clientX + 40, window.innerWidth - cardWidth - 20);
    });

    btn.addEventListener('mouseleave', () => {
      isHovering = false;
      gsap.killTweensOf(cursorPreview);
      gsap.to(cursorPreview, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
      });
    });

    btn.addEventListener('click', (e) => {
      e.preventDefault();
    });
  });
}

/* ================= 4. SECTION 1: ARROW -> EREAN -> ARROW (IMAGE 1 SPEC) ================= */
function initSection1HeroSequence() {
  const leftStem = document.querySelector('#arrowLeftWrap .arrow-stem');
  const leftHead = document.querySelector('#arrowLeftWrap .arrow-head');
  const rightStem = document.querySelector('#arrowRightWrap .arrow-stem');
  const rightHead = document.querySelector('#arrowRightWrap .arrow-head');

  const c0 = document.querySelector('.hero-sequence-container .char-0');
  const c1 = document.querySelector('.hero-sequence-container .char-1');
  const c2 = document.querySelector('.hero-sequence-container .char-2');
  const c3 = document.querySelector('.hero-sequence-container .char-3');
  const c4 = document.querySelector('.hero-sequence-container .char-4');

  if (!leftStem || !c0) return;

  gsap.set(c0, { transformOrigin: 'center bottom' });
  gsap.set(c1, { transformOrigin: 'center center', transformStyle: 'preserve-3d' });
  gsap.set(c2, { transformOrigin: 'center center' });
  gsap.set(c3, { transformOrigin: '50% 0%' });
  gsap.set(c4, { transformOrigin: 'center center' });

  function createChar0Tween() {
    const tl = gsap.timeline();
    tl.to(c0, { y: -45, scaleY: 1.25, scaleX: 0.85, duration: 0.28, ease: 'power2.out' })
      .to(c0, { y: 0, scaleY: 0.72, scaleX: 1.35, duration: 0.22, ease: 'power3.in' })
      .to(c0, { scaleY: 1, scaleX: 1, duration: 0.2, ease: 'elastic.out(1, 0.4)' });
    return tl;
  }

  function createChar1Tween() {
    const tl = gsap.timeline();
    tl.to(c1, { rotationY: 360, duration: 0.65, ease: 'power3.inOut' })
      .set(c1, { rotationY: 0 });
    return tl;
  }

  function createChar2Tween() {
    const tl = gsap.timeline();
    tl.to(c2, { x: -20, skewX: 25, duration: 0.08, ease: 'steps(1)' })
      .to(c2, { x: 22, skewX: -28, scaleY: 1.15, duration: 0.08, ease: 'steps(1)' })
      .to(c2, { x: 0, skewX: 0, scaleY: 1, duration: 0.08, ease: 'steps(1)' });
    return tl;
  }

  function createChar3Tween() {
    const tl = gsap.timeline();
    tl.to(c3, { rotationZ: -18, duration: 0.22, ease: 'power1.out' })
      .to(c3, { rotationZ: 14, duration: 0.32, ease: 'sine.inOut' })
      .to(c3, { rotationZ: 0, duration: 0.22, ease: 'power2.out' });
    return tl;
  }

  function createChar4Tween() {
    const tl = gsap.timeline();
    tl.to(c4, { scale: 1.45, duration: 0.12, ease: 'power2.out' })
      .to(c4, { scale: 1.05, duration: 0.1, ease: 'power2.in' })
      .to(c4, { scale: 1.3, duration: 0.1, ease: 'power2.out' })
      .to(c4, { scale: 1, duration: 0.2, ease: 'elastic.out(1, 0.5)' });
    return tl;
  }

  const masterHeroSeq = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });

  masterHeroSeq
    .set([leftStem, rightStem], { strokeDashoffset: 400, opacity: 1 })
    .set([leftHead, rightHead], { strokeDashoffset: 250, opacity: 1 })
    .to(leftStem, { strokeDashoffset: 0, duration: 0.55, ease: 'power2.inOut' })
    .to(leftHead, { strokeDashoffset: 0, duration: 0.25, ease: 'power2.out' }, '-=0.1')
    .addLabel('chars')
    .add(createChar0Tween(), 'chars+=0.05')
    .add(createChar1Tween(), 'chars+=0.25')
    .add(createChar2Tween(), 'chars+=0.45')
    .add(createChar3Tween(), 'chars+=0.65')
    .add(createChar4Tween(), 'chars+=0.85')
    .to(rightStem, { strokeDashoffset: 0, duration: 0.55, ease: 'power2.inOut' }, 'chars+=1.1')
    .to(rightHead, { strokeDashoffset: 0, duration: 0.25, ease: 'power2.out' }, '-=0.1')
    .to([leftStem, leftHead, rightStem, rightHead], { opacity: 0, duration: 0.35, ease: 'power2.in' }, '+=0.4');

  const heroSection = document.querySelector('.section-hero');
  if (heroSection && horizontalTween) {
    ScrollTrigger.create({
      trigger: heroSection,
      containerAnimation: horizontalTween,
      start: 'left right',
      end: 'right left',
      onLeave: () => masterHeroSeq.pause(),
      onEnterBack: () => masterHeroSeq.resume(),
    });
  }
}

/* ================= 5. SECTION 2: CHAR-BY-CHAR RISING EDITORIAL (IMAGE 2 SPEC) ================= */
function initSection2CharRiseEditorial() {
  const sectionDesigner = document.querySelector('.section-designer');
  if (!sectionDesigner) return;

  const phrases = sectionDesigner.querySelectorAll('.text-phrase');
  phrases.forEach((phrase) => {
    const text = phrase.textContent.trim();
    let html = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === ' ') {
        html += '<span class="split-space">&nbsp;</span>';
      } else {
        html += `<span class="split-char-parent"><span class="split-char">${char}</span></span>`;
      }
    }
    phrase.innerHTML = html;
  });

  const r1p1 = document.querySelector('#splitRow1 > .text-phrase:first-child');
  const logoItem = document.querySelector('#splitRow1 .inline-pill-capsule');
  const r1p2 = document.querySelector('#splitRow1 > .text-phrase:last-child');

  const r2p1 = document.querySelector('#splitRow2 > .text-phrase:first-child');
  const emojiItem = document.querySelector('#splitRow2 .inline-pill-capsule');
  const r2dot = document.querySelector('#splitRow2 .dot-phrase');

  const allRiseTargets = [
    ...(r1p1 ? r1p1.querySelectorAll('.split-char') : []),
    logoItem,
    ...(r1p2 ? r1p2.querySelectorAll('.split-char') : []),
    ...(r2p1 ? r2p1.querySelectorAll('.split-char') : []),
    emojiItem,
    ...(r2dot ? r2dot.querySelectorAll('.split-char') : [])
  ].filter(Boolean);

  if (horizontalTween) {
    gsap.from(allRiseTargets, {
      yPercent: 120,
      opacity: 0,
      duration: 0.75,
      stagger: 0.035,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: sectionDesigner,
        containerAnimation: horizontalTween,
        start: 'left 80%',
        toggleActions: 'play none none reverse',
        invalidateOnRefresh: true,
      }
    });
  }
}

/* ================= 6. DUAL-AXIS SCROLL & ROBUST MOBILE TOUCH HANDLER ================= */
let activeScroller = null;
let targetVerticalY = 0;
let currentVerticalTween = null;

function smoothVerticalScrollTo(scroller, targetY, duration = 0.55, onDone = null) {
  const maxScroll = window.innerHeight;
  targetVerticalY = Math.max(0, Math.min(maxScroll, targetY));

  if (currentVerticalTween) {
    currentVerticalTween.kill();
  }

  currentVerticalTween = gsap.to(scroller, {
    scrollTop: targetVerticalY,
    duration: duration,
    ease: 'power3.out',
    overwrite: 'auto',
    onUpdate: () => {
      updateMenuButtonColor();
    },
    onComplete: () => {
      currentVerticalTween = null;
      if (targetVerticalY <= 5) {
        scroller.scrollTop = 0;
        activeScroller = null;
      }
      updateMenuButtonColor();
      if (onDone) onDone();
    }
  });
}

function initDualAxisScroll() {
  const moreButtons = document.querySelectorAll('.more-btn');
  const backTopButtons = document.querySelectorAll('.back-top-btn');

  // 'More' 버튼 클릭: 해당 섹션 100vh 아래로 부드럽게 스크롤
  moreButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.getAttribute('data-index') || '0', 10);
      const section = sections[idx];
      if (!section) return;

      const scroller = section.querySelector('.section-vertical-scroller');
      if (!scroller) return;

      activeScroller = scroller;

      // 가로 트랙 위치를 해당 섹션으로 스냅 정렬
      const totalSections = sections.length;
      const getScrollLength = () => track.scrollWidth - window.innerWidth;
      const targetScrollY = (idx / (totalSections - 1)) * getScrollLength();
      window.scrollTo({ top: targetScrollY, behavior: 'smooth' });

      targetVerticalY = window.innerHeight;
      smoothVerticalScrollTo(scroller, window.innerHeight, 0.75);
    });
  });

  // 'Top' 버튼 클릭: 최상단으로 복귀
  backTopButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.getAttribute('data-index') || '0', 10);
      const section = sections[idx];
      if (!section) return;

      const scroller = section.querySelector('.section-vertical-scroller');
      if (!scroller) return;

      targetVerticalY = 0;
      smoothVerticalScrollTo(scroller, 0, 0.65, () => {
        activeScroller = null;
      });
    });
  });

  /* ---------- MOBILE TOUCH CONTROLLER (1:1 Finger Tracking & Anti-Jump) ---------- */
  let touchStartY = 0;
  let touchStartX = 0;
  let startScrollTop = 0;
  let isTouching = false;
  let isVerticalGesture = false;

  window.addEventListener(
    'touchstart',
    (e) => {
      if (isMenuOpen || !activeScroller) return;

      const touch = e.touches[0];
      touchStartY = touch.clientY;
      touchStartX = touch.clientX;
      startScrollTop = activeScroller.scrollTop;
      isTouching = true;
      isVerticalGesture = false;

      // 손가락이 닿는 즉시 진행 중인 스무스 애니메이션 중지하여 1:1 직접 제어권 획득
      if (currentVerticalTween) {
        currentVerticalTween.kill();
        currentVerticalTween = null;
      }
    },
    { passive: true }
  );

  window.addEventListener(
    'touchmove',
    (e) => {
      if (isMenuOpen || !activeScroller || !isTouching) return;

      const touch = e.touches[0];
      const deltaY = touchStartY - touch.clientY; // 드래그 위로 -> deltaY > 0; 드래그 아래로 -> deltaY < 0
      const deltaX = touchStartX - touch.clientX;

      if (!isVerticalGesture) {
        if (Math.abs(deltaY) > 6 && Math.abs(deltaY) > Math.abs(deltaX)) {
          isVerticalGesture = true;
        } else if (Math.abs(deltaX) > 12) {
          isTouching = false;
          return;
        }
      }

      if (isVerticalGesture) {
        if (e.cancelable) e.preventDefault();

        // 1:1 손가락 정밀 추적 (조금만 올려도 순간이동하지 않고 정확히 손가락 위치에 고정)
        let newScrollTop = startScrollTop + deltaY;

        // 경계선 저항 처리
        if (newScrollTop < 0) {
          newScrollTop = newScrollTop * 0.25;
        } else if (newScrollTop > window.innerHeight) {
          newScrollTop = window.innerHeight + (newScrollTop - window.innerHeight) * 0.25;
        }

        activeScroller.scrollTop = newScrollTop;
        targetVerticalY = newScrollTop;
        updateMenuButtonColor();
      }
    },
    { passive: false }
  );

  window.addEventListener(
    'touchend',
    () => {
      if (isMenuOpen || !activeScroller || !isTouching) return;
      isTouching = false;

      if (!isVerticalGesture) return;
      isVerticalGesture = false;

      const currentY = activeScroller.scrollTop;
      // 화면 높이의 약 35% 이상 아래로 끌어내렸을 때만 상단 메인 슬라이드로 복귀
      const threshold = window.innerHeight * 0.65;

      if (currentY < threshold) {
        // 의도적인 상단 복귀 제스처
        smoothVerticalScrollTo(activeScroller, 0, 0.45, () => {
          activeScroller = null;
        });
      } else {
        // 살짝 건드렸거나 가벼운 스크롤은 서브섹션 위치로 부드럽게 유지
        smoothVerticalScrollTo(activeScroller, window.innerHeight, 0.35);
      }
    },
    { passive: true }
  );

  /* ---------- DESKTOP WHEEL EVENT CONTROLLER ---------- */
  window.addEventListener(
    'wheel',
    (e) => {
      if (isMenuOpen || isTouching) return;

      if (activeScroller && (activeScroller.scrollTop > 5 || targetVerticalY > 5)) {
        e.preventDefault();

        targetVerticalY += e.deltaY * 0.85;
        targetVerticalY = Math.max(0, Math.min(window.innerHeight, targetVerticalY));

        smoothVerticalScrollTo(activeScroller, targetVerticalY, 0.5);
        return;
      }

      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        window.scrollBy({ top: e.deltaX });
      }
    },
    { passive: false }
  );

  /* ---------- KEYBOARD CONTROLLER ---------- */
  window.addEventListener('keydown', (e) => {
    if (isMenuOpen) return;

    if (activeScroller && activeScroller.scrollTop > 5) {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        targetVerticalY += window.innerHeight * 0.45;
        smoothVerticalScrollTo(activeScroller, targetVerticalY, 0.55);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        targetVerticalY -= window.innerHeight * 0.45;
        smoothVerticalScrollTo(activeScroller, targetVerticalY, 0.55);
      }
      return;
    }

    const step = window.innerWidth * 0.4;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      window.scrollBy({ top: step, behavior: 'smooth' });
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      window.scrollBy({ top: -step, behavior: 'smooth' });
    }
  });
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isMenuOpen) {
    toggleMenu();
  }
});

window.addEventListener('DOMContentLoaded', () => {
  initHorizontalScroll();
  initSection1HeroSequence();
  initSection2CharRiseEditorial();
  initDualAxisScroll();
});
