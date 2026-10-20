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

/* ================= 1. HORIZONTAL SCROLL & ADAPTIVE MENU COLOR ================= */
let horizontalTween;

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
      scrub: 0.8,
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

/* ================= 4. ADAPTIVE MENU BUTTON COLOR DETECTION ================= */
function updateMenuButtonColor() {
  if (!menuToggleBtn) return;

  const btnRect = menuToggleBtn.getBoundingClientRect();
  const probeX = btnRect.left + btnRect.width / 2;
  const probeY = btnRect.top + btnRect.height / 2;

  // Temporarily disable pointer events to probe underlying section
  menuToggleBtn.style.pointerEvents = 'none';
  const underEl = document.elementFromPoint(probeX, probeY);
  menuToggleBtn.style.pointerEvents = 'auto';

  if (underEl) {
    const section = underEl.closest('.section');
    if (section) {
      const theme = section.getAttribute('data-theme');
      if (theme === 'light') {
        menuToggleBtn.classList.add('theme-light-bg');
        menuToggleBtn.classList.remove('theme-dark-bg');
      } else {
        menuToggleBtn.classList.add('theme-dark-bg');
        menuToggleBtn.classList.remove('theme-light-bg');
      }
    }
  }
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
    // When menu is open, the background is dark, so button is white
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
    gsap.to(cursorPreview, { opacity: 0, duration: 0.2 });
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

/* ================= 3. GSAP MOUSE LAG FOLLOWER PREVIEW ================= */
let targetX = -9999;
let targetY = -9999;
let currentX = -9999;
let currentY = -9999;
let isHovering = false;

gsap.ticker.add(() => {
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

/* ================= 1. SECTION 1: ARROW -> EREAN -> ARROW (이미지 1 맞춤) =================
 * 왼쪽 화살표 줄기/촉 드로잉 ➔ E, R, E, A, N 순차 격발 ➔ 오른쪽 화살표 드로잉 ➔ 무한 루프
 */
function initSection1HeroSequence() {
  const leftStem = document.querySelector('#arrowLeftWrap .arrow-stem');
  const leftHead = document.querySelector('#arrowLeftWrap .arrow-head');
  const rightStem = document.querySelector('#arrowRightWrap .arrow-stem');
  const rightHead = document.querySelector('#arrowRightWrap .arrow-head');

  const c0 = document.querySelector('.hero-sequence-container .char-0'); // E
  const c1 = document.querySelector('.hero-sequence-container .char-1'); // R
  const c2 = document.querySelector('.hero-sequence-container .char-2'); // E
  const c3 = document.querySelector('.hero-sequence-container .char-3'); // A
  const c4 = document.querySelector('.hero-sequence-container .char-4'); // N

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
    // 1. 왼쪽 화살표 줄기/촉 드로잉
    .to(leftStem, { strokeDashoffset: 0, duration: 0.55, ease: 'power2.inOut' })
    .to(leftHead, { strokeDashoffset: 0, duration: 0.25, ease: 'power2.out' }, '-=0.1')
    // 2. 글자 순차 격발 (E -> R -> E -> A -> N)
    .addLabel('chars')
    .add(createChar0Tween(), 'chars+=0.05')
    .add(createChar1Tween(), 'chars+=0.25')
    .add(createChar2Tween(), 'chars+=0.45')
    .add(createChar3Tween(), 'chars+=0.65')
    .add(createChar4Tween(), 'chars+=0.85')
    // 3. 오른쪽 화살표 드로잉 (줄기 -> 촉)
    .to(rightStem, { strokeDashoffset: 0, duration: 0.55, ease: 'power2.inOut' }, 'chars+=1.1')
    .to(rightHead, { strokeDashoffset: 0, duration: 0.25, ease: 'power2.out' }, '-=0.1')
    // 4. 페이드아웃 후 무한 루프
    .to([leftStem, leftHead, rightStem, rightHead], { opacity: 0, duration: 0.35, ease: 'power2.in' }, '+=0.4');
}

/* ================= 2. SECTION 2: CHAR-BY-CHAR RISING EDITORIAL (이미지 2 맞춤) =================
 * Web search 검증 GSAP 문자 단위 마스킹 솟구침 패턴 (Character by character rising wave)
 */
function initSection2CharRiseEditorial() {
  const sectionDesigner = document.querySelector('.section-designer');
  if (!sectionDesigner) return;

  // 글자들을 문자 단위로 자동 분할하여 클리핑 마스크 생성
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

  // 모든 솟구침 대상 (순차 순서: "I'm a" -> [Box 1] -> "Graphic" -> "Designer" -> [Box 2] -> ".")
  const r1p1 = document.querySelector('#splitRow1 > .text-phrase:first-child');
  const box1 = document.querySelector('#splitRow1 .inline-solid-box');
  const r1p2 = document.querySelector('#splitRow1 > .text-phrase:last-child');

  const r2p1 = document.querySelector('#splitRow2 > .text-phrase:first-child');
  const box2 = document.querySelector('#splitRow2 .inline-solid-box');
  const r2dot = document.querySelector('#splitRow2 .dot-phrase');

  const allRiseTargets = [
    ...(r1p1 ? r1p1.querySelectorAll('.split-char') : []),
    box1,
    ...(r1p2 ? r1p2.querySelectorAll('.split-char') : []),
    ...(r2p1 ? r2p1.querySelectorAll('.split-char') : []),
    box2,
    ...(r2dot ? r2dot.querySelectorAll('.split-char') : [])
  ].filter(Boolean);

  if (horizontalTween) {
    gsap.from(allRiseTargets, {
      yPercent: 120,
      opacity: 0,
      duration: 0.75,
      stagger: 0.035, // 글자가 하나씩 파도처럼 차례대로 솟구치는 GSAP 스태거
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

/* ================= 3. DUAL-AXIS SCROLL (HORIZONTAL + BUTTERY SMOOTH VERTICAL EXTENSION) =================
 * 각 가로 섹션의 'More' 버튼을 누르면 1섹션 높이(100vh)만큼 아래로 부드럽게 자동 스크롤.
 * 이후 상하(위아래) 휠 스크롤 시 GSAP 기반 부드러운 감속/관성(Smooth Scroll) 적용.
 * 원래 섹션(위쪽)까지 스크롤을 올리면 가로 스크롤로 자연스럽게 복귀.
 */
let activeScroller = null;
let targetVerticalY = 0;
let currentVerticalTween = null;

function initDualAxisScroll() {
  const sections = Array.from(document.querySelectorAll('.section'));
  const moreButtons = document.querySelectorAll('.more-btn');
  const backTopButtons = document.querySelectorAll('.back-top-btn');

  // GSAP 기반 관성 부드러운 수직 스크롤러
  function smoothVerticalScrollTo(scroller, targetY, duration = 0.65, onDone = null) {
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
          activeScroller = null; // 가로 스크롤로 복귀
        }
        updateMenuButtonColor();
        if (onDone) onDone();
      }
    });
  }

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
      smoothVerticalScrollTo(scroller, window.innerHeight, 0.85);
    });
  });

  // 'Top' 버튼 클릭: 해당 섹션 최상단(메인 슬라이드)으로 부드럽게 복귀
  backTopButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.getAttribute('data-index') || '0', 10);
      const section = sections[idx];
      if (!section) return;

      const scroller = section.querySelector('.section-vertical-scroller');
      if (!scroller) return;

      targetVerticalY = 0;
      smoothVerticalScrollTo(scroller, 0, 0.75);
    });
  });

  // 현재 화면 중심에 위치한 섹션의 수직 스크롤러 감지
  function getCurrentVisibleSectionScroller() {
    const probeX = window.innerWidth / 2;
    const probeY = window.innerHeight / 2;
    const under = document.elementFromPoint(probeX, probeY);
    if (!under) return null;
    const sec = under.closest('.section');
    return sec ? sec.querySelector('.section-vertical-scroller') : null;
  }

  // 휠(Wheel) 이벤트: 부드러운 상하 관성 스크롤 및 가로 모드 자동 전환
  window.addEventListener(
    'wheel',
    (e) => {
      if (isMenuOpen) return;

      // 1. 활성화된 세로 서브섹션에 있거나 아래로 스크롤 진행 중인 경우
      if (activeScroller && (activeScroller.scrollTop > 5 || targetVerticalY > 5)) {
        e.preventDefault();

        // 휠 델타 누적 (부드러운 스크롤 감속)
        targetVerticalY += e.deltaY;
        targetVerticalY = Math.max(0, Math.min(window.innerHeight, targetVerticalY));

        smoothVerticalScrollTo(activeScroller, targetVerticalY, 0.55);
        return;
      }

      // 2. 현재 보이는 섹션의 스크롤러가 내려가 있는 경우
      const currentScroller = getCurrentVisibleSectionScroller();
      if (currentScroller && (currentScroller.scrollTop > 5 || (activeScroller === currentScroller && targetVerticalY > 5))) {
        e.preventDefault();
        activeScroller = currentScroller;

        targetVerticalY += e.deltaY;
        targetVerticalY = Math.max(0, Math.min(window.innerHeight, targetVerticalY));

        smoothVerticalScrollTo(activeScroller, targetVerticalY, 0.55);
        return;
      }

      // 3. 최상단인 경우: 정상 가로 스크롤 수행
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        window.scrollBy({ top: e.deltaX });
      }
    },
    { passive: false }
  );

  // 키보드 상/하 및 좌/우 방향키 지원
  window.addEventListener('keydown', (e) => {
    if (isMenuOpen) return;

    if (activeScroller && activeScroller.scrollTop > 5) {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        targetVerticalY += window.innerHeight * 0.45;
        smoothVerticalScrollTo(activeScroller, targetVerticalY, 0.6);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        targetVerticalY -= window.innerHeight * 0.45;
        smoothVerticalScrollTo(activeScroller, targetVerticalY, 0.6);
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
