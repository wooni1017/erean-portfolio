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
  const pill1 = document.getElementById('pill1');
  const r1p2 = document.querySelector('#splitRow1 > .text-phrase:last-child');

  const r2p1 = document.querySelector('#splitRow2 > .text-phrase:first-child');
  const pill2 = document.getElementById('pill2');
  const r2dot = document.querySelector('#splitRow2 .dot-phrase');

  const allRiseTargets = [
    ...(r1p1 ? r1p1.querySelectorAll('.split-char') : []),
    pill1,
    ...(r1p2 ? r1p2.querySelectorAll('.split-char') : []),
    ...(r2p1 ? r2p1.querySelectorAll('.split-char') : []),
    pill2,
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

  // Initialize the Mac Drag & Drop Sequence
  initMacDragAndDropSequence();
}

/* ================= 6. SECTION 2: MAC CURSOR DRAG & DROP & USER INTERACTIVE PLAY =================
 * 1. 초기 1회 자동 실행:
 *    섹션 진입 시 가상 맥 커서가 로고와 👾 이모지를 끌고 와 각각 Pill 1, Pill 2에 안착.
 *    이후 섹션을 완전히 벗어나기 전까지는 다시 반복 실행되지 않음 (repeat: 0).
 * 2. 사용자 직접 드래그 & 드롭:
 *    사용자가 마우스/터치로 필 안의 아이템(로고, 이모지)을 밖으로 자유롭게 끌어다 놓을 수 있음.
 *    드래그 시 실시간 속도 비례 틸트(Wobble), 스케일업(1.3x), 드롭 섀도우 활성화.
 *    필 안쪽에 놓으면 탄성 스냅백으로 쏙 안착.
 * 3. 밖으로 꺼내 놓았을 때의 자동 복구 가상 맥 커서 루틴 (Rescue):
 *    사용자가 바깥에 내려놓으면 0.65초 뒤 가상 맥 마우스가 등장하여
 *    해당 위치로 이동 ➔ 찝어서 ➔ 원래 필 안으로 흔들림 물리와 함께 끌고 들어와 안착 ➔ 퇴장.
 *    사용자가 다시 건드리면 가상 커서는 즉시 양보하고 사라짐.
 */
function initMacDragAndDropSequence() {
  const container = document.querySelector('.split-editorial-container');
  const cursor = document.getElementById('macCursor');
  const pill1 = document.getElementById('pill1');
  const pill2 = document.getElementById('pill2');
  const dragLogo = document.getElementById('dragLogoInner');
  const dragEmoji = document.getElementById('dragEmojiInner');
  const sectionDesigner = document.querySelector('.section-designer');

  if (!container || !cursor || !pill1 || !pill2 || !dragLogo || !dragEmoji) return;

  function getCenter(el) {
    const elR = el.getBoundingClientRect();
    const contR = container.getBoundingClientRect();
    return {
      x: elR.left - contR.left + elR.width / 2,
      y: elR.top - contR.top + elR.height / 2,
    };
  }

  let macIntroTimeline = null;
  let activeRescueTimeline = null;
  let activeRescueTimer = null;
  let hasInitialPlayed = false;
  let isUserInteracting = false;
  const outsideItems = new Set(); // tracks 'logo', 'emoji'

  function cancelAnyMacAction() {
    if (activeRescueTimer) {
      clearTimeout(activeRescueTimer);
      activeRescueTimer = null;
    }
    if (activeRescueTimeline) {
      activeRescueTimeline.kill();
      activeRescueTimeline = null;
    }
    if (macIntroTimeline && macIntroTimeline.isActive()) {
      macIntroTimeline.pause();
    }
    gsap.to(cursor, { opacity: 0, duration: 0.15, overwrite: 'auto' });
  }

  function buildIntroTimeline() {
    if (macIntroTimeline) {
      macIntroTimeline.kill();
    }

    const p1 = getCenter(pill1);
    const p2 = getCenter(pill2);

    const row1 = document.getElementById('splitRow1');
    const row2 = document.getElementById('splitRow2');
    const contR = container.getBoundingClientRect();
    const r1R = row1 ? row1.getBoundingClientRect() : null;
    const r2R = row2 ? row2.getBoundingClientRect() : null;

    // Starting positions:
    // Logo starts cleanly below Row 2 (to be dragged UP into Pill 1)
    const logoGrabY = r2R ? (r2R.bottom - contR.top + 36) : (p1.y + 260);
    const logoGrabX = p1.x - 20;
    const logoOffsetX = logoGrabX - p1.x;
    const logoOffsetY = logoGrabY - p1.y;

    // Emoji starts cleanly above Row 1 (to be dragged DOWN into Pill 2)
    const emojiGrabY = r1R ? (r1R.top - contR.top - 40) : (p2.y - 200);
    const emojiGrabX = p2.x + 36;
    const emojiOffsetX = emojiGrabX - p2.x;
    const emojiOffsetY = emojiGrabY - p2.y;

    // repeat: 0 => 한 번만 실행하고 대기!
    macIntroTimeline = gsap.timeline({
      repeat: 0,
      paused: true,
      onComplete: () => {
        outsideItems.delete('logo');
        outsideItems.delete('emoji');
      }
    });

    // 0. Setup initial states
    macIntroTimeline
      .set(cursor, { x: logoGrabX - 80, y: logoGrabY + 120, opacity: 0, scale: 1, rotation: 0 })
      .set(dragLogo, { x: logoOffsetX, y: logoOffsetY, scale: 0.95, rotation: -6, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.12))' })
      .set(dragEmoji, { x: emojiOffsetX, y: emojiOffsetY, scale: 0.95, rotation: 8, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.12))' })
      .set([pill1, pill2], { scale: 1, borderColor: 'rgba(0, 0, 0, 0.22)' })

      // 1. Mac cursor glides in towards Logo
      .to(cursor, { opacity: 1, x: logoGrabX, y: logoGrabY, duration: 0.6, ease: 'power2.out' })

      // 2. Cursor clicks on Logo (Grab pop & click scale)
      .to(cursor, { scale: 0.78, duration: 0.09, yoyo: true, repeat: 1, ease: 'power2.inOut' })
      .to(dragLogo, {
        scale: 1.35,
        rotation: 14,
        filter: 'drop-shadow(0 16px 24px rgba(0,0,0,0.28))',
        duration: 0.14,
        ease: 'back.out(2.2)'
      }, '<')

      // 3. Cursor drags Logo UP into Pill 1 (with dynamic dangling wobble!)
      .to(cursor, { x: p1.x, y: p1.y, duration: 0.85, ease: 'power2.inOut' }, '+=0.04')
      .to(dragLogo, { x: 0, y: 0, duration: 0.85, ease: 'power2.inOut' }, '<')
      .to(dragLogo, { rotation: -18, duration: 0.17, ease: 'sine.inOut' }, '<+=0.05')
      .to(dragLogo, { rotation: 14, duration: 0.17, ease: 'sine.inOut' }, '>-0.02')
      .to(dragLogo, { rotation: -9, duration: 0.17, ease: 'sine.inOut' }, '>-0.02')
      .to(dragLogo, { rotation: 5, duration: 0.17, ease: 'sine.inOut' }, '>-0.02')
      .to(dragLogo, { rotation: 0, duration: 0.17, ease: 'power2.out' }, '>-0.02')

      // 4. Cursor drops Logo into Pill 1 (Release & squash & stretch settling!)
      .to(cursor, { scale: 1, duration: 0.1 }, '-=0.1')
      .to(pill1, { scale: 1.1, borderColor: '#000000', duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' }, '<')
      .to(dragLogo, {
        scaleY: 0.7,
        scaleX: 1.38,
        filter: 'drop-shadow(0 0px 0px rgba(0,0,0,0))',
        duration: 0.1,
        ease: 'power3.in'
      }, '<')
      .to(dragLogo, {
        scaleY: 1.14,
        scaleX: 0.9,
        duration: 0.16,
        ease: 'power2.out'
      })
      .to(dragLogo, {
        scale: 1,
        duration: 0.38,
        ease: 'elastic.out(1.2, 0.4)'
      })

      // 5. Cursor glides UP towards Emoji floating above Pill 2
      .to(cursor, { x: emojiGrabX, y: emojiGrabY, duration: 0.75, ease: 'power3.inOut' }, '+=0.2')

      // 6. Cursor clicks on Emoji (Grab pop & click scale)
      .to(cursor, { scale: 0.78, duration: 0.09, yoyo: true, repeat: 1, ease: 'power2.inOut' })
      .to(dragEmoji, {
        scale: 1.38,
        rotation: -16,
        filter: 'drop-shadow(0 16px 24px rgba(0,0,0,0.28))',
        duration: 0.14,
        ease: 'back.out(2.4)'
      }, '<')

      // 7. Cursor drags Emoji DOWN into Pill 2 (with dynamic dangling wobble!)
      .to(cursor, { x: p2.x, y: p2.y, duration: 0.9, ease: 'power2.inOut' }, '+=0.04')
      .to(dragEmoji, { x: 0, y: 0, duration: 0.9, ease: 'power2.inOut' }, '<')
      .to(dragEmoji, { rotation: 20, duration: 0.18, ease: 'sine.inOut' }, '<+=0.05')
      .to(dragEmoji, { rotation: -16, duration: 0.18, ease: 'sine.inOut' }, '>-0.02')
      .to(dragEmoji, { rotation: 10, duration: 0.18, ease: 'sine.inOut' }, '>-0.02')
      .to(dragEmoji, { rotation: -5, duration: 0.18, ease: 'sine.inOut' }, '>-0.02')
      .to(dragEmoji, { rotation: 0, duration: 0.18, ease: 'power2.out' }, '>-0.02')

      // 8. Cursor drops Emoji into Pill 2 (Release & squash & stretch settling!)
      .to(cursor, { scale: 1, duration: 0.1 }, '-=0.1')
      .to(pill2, { scale: 1.1, borderColor: '#000000', duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' }, '<')
      .to(dragEmoji, {
        scaleY: 0.68,
        scaleX: 1.4,
        filter: 'drop-shadow(0 0px 0px rgba(0,0,0,0))',
        duration: 0.1,
        ease: 'power3.in'
      }, '<')
      .to(dragEmoji, {
        scaleY: 1.15,
        scaleX: 0.9,
        duration: 0.16,
        ease: 'power2.out'
      })
      .to(dragEmoji, {
        scale: 1,
        duration: 0.38,
        ease: 'elastic.out(1.2, 0.4)'
      })

      // 9. Cursor smoothly exits
      .to(cursor, { x: '+=100', y: '+=110', opacity: 0, duration: 0.65, ease: 'power2.in' }, '+=0.35');
  }

  buildIntroTimeline();

  // ---------------- Mac Rescue System (단일 커서 연속 이동 회수 루틴) ----------------
  function scheduleRescue() {
    if (activeRescueTimer) clearTimeout(activeRescueTimer);
    if (isUserInteracting) return;

    activeRescueTimer = setTimeout(() => {
      runContinuousRescue();
    }, 550);
  }

  function runContinuousRescue() {
    if (isUserInteracting) return;

    // 회수 대상 필터 (실제 필 중심에서 45px 이상 벗어난 아이템들)
    const itemsToRescue = Array.from(outsideItems).filter((itemType) => {
      const item = itemType === 'logo' ? dragLogo : dragEmoji;
      const dist = Math.hypot(gsap.getProperty(item, 'x') || 0, gsap.getProperty(item, 'y') || 0);
      return dist >= 45;
    });

    if (itemsToRescue.length === 0) return;

    if (activeRescueTimeline) {
      activeRescueTimeline.kill();
      activeRescueTimeline = null;
    }

    const currentCursorOpacity = gsap.getProperty(cursor, 'opacity') || 0;
    const isCursorOnScreen = currentCursorOpacity > 0.3;

    activeRescueTimeline = gsap.timeline({
      onComplete: () => {
        activeRescueTimeline = null;
        if (outsideItems.size > 0 && !isUserInteracting) {
          runContinuousRescue();
        }
      }
    });

    itemsToRescue.forEach((itemType, idx) => {
      const item = itemType === 'logo' ? dragLogo : dragEmoji;
      const pill = itemType === 'logo' ? pill1 : pill2;
      const isFirst = idx === 0;
      const isLast = idx === itemsToRescue.length - 1;

      const itemR = item.getBoundingClientRect();
      const contR = container.getBoundingClientRect();
      const pillCenter = getCenter(pill);

      const itemContX = itemR.left - contR.left + itemR.width / 2;
      const itemContY = itemR.top - contR.top + itemR.height / 2;

      // 1. 단일 마우스 커서의 끊김 없는 자연스러운 이동 (fade out 없이 그대로 이동!)
      if (isFirst) {
        if (!isCursorOnScreen) {
          const startX = itemContX + (itemType === 'logo' ? -70 : 70);
          const startY = itemContY + (itemType === 'logo' ? 90 : -90);
          activeRescueTimeline
            .set(cursor, { x: startX, y: startY, opacity: 0, scale: 1, rotation: 0 })
            .to(cursor, { opacity: 1, x: itemContX, y: itemContY, duration: 0.55, ease: 'power2.out' });
        } else {
          // 이미 화면에 커서가 있으면 이전 위치에서 바로 대상 아이템으로 슥 이동
          activeRescueTimeline
            .to(cursor, { x: itemContX, y: itemContY, duration: 0.7, ease: 'power3.inOut' });
        }
      } else {
        // 다음 아이템으로 이동: 페이드 아웃 절대 없이, 방금 넣은 필에서 다음 아이템 위치로 단일 포인터가 활공 이동!
        activeRescueTimeline
          .to(cursor, { x: itemContX, y: itemContY, duration: 0.75, ease: 'power3.inOut' }, '+=0.2');
      }

      // 2. 픽업 클릭 & 팝 피드백
      activeRescueTimeline
        .to(cursor, { scale: 0.78, duration: 0.09, yoyo: true, repeat: 1, ease: 'power2.inOut' })
        .to(item, {
          scale: 1.35,
          rotation: itemType === 'logo' ? 14 : -14,
          filter: 'drop-shadow(0 16px 24px rgba(0,0,0,0.28))',
          duration: 0.14,
          ease: 'back.out(2.2)'
        }, '<')

        // 3. 필 안으로 흔들리며 끌고 들어가기 (펜듈럼 댕글링 물리)
        .to(cursor, { x: pillCenter.x, y: pillCenter.y, duration: 0.85, ease: 'power2.inOut' }, '+=0.04')
        .to(item, { x: 0, y: 0, duration: 0.85, ease: 'power2.inOut' }, '<')
        .to(item, { rotation: itemType === 'logo' ? -18 : 18, duration: 0.17, ease: 'sine.inOut' }, '<+=0.05')
        .to(item, { rotation: itemType === 'logo' ? 14 : -14, duration: 0.17, ease: 'sine.inOut' }, '>-0.02')
        .to(item, { rotation: itemType === 'logo' ? -8 : 8, duration: 0.17, ease: 'sine.inOut' }, '>-0.02')
        .to(item, { rotation: 0, duration: 0.17, ease: 'power2.out' }, '>-0.02')

        // 4. 필 안 안착 & 스쿼시 스트레치
        .to(cursor, { scale: 1, duration: 0.1 }, '-=0.1')
        .to(pill, { scale: 1.1, borderColor: '#000000', duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' }, '<')
        .to(item, {
          scaleY: 0.7,
          scaleX: 1.38,
          filter: 'drop-shadow(0 0px 0px rgba(0,0,0,0))',
          duration: 0.1,
          ease: 'power3.in'
        }, '<')
        .to(item, {
          scaleY: 1.14,
          scaleX: 0.9,
          duration: 0.16,
          ease: 'power2.out'
        })
        .to(item, {
          scale: 1,
          duration: 0.38,
          ease: 'elastic.out(1.2, 0.4)'
        })
        .add(() => {
          outsideItems.delete(itemType);
        });

      // 5. 모든 외부 아이템을 다 집어넣었을 때 비로소 커서가 부드럽게 퇴장!
      if (isLast) {
        activeRescueTimeline
          .to(cursor, { x: '+=80', y: '+=80', opacity: 0, duration: 0.55, ease: 'power2.in' }, '+=0.3');
      }
    });
  }

  // ---------------- 사용자 직접 드래그 & 드롭 핸들러 ----------------
  function setupUserDraggable(item, pill, itemType) {
    let startPointerX = 0;
    let startPointerY = 0;
    let startItemX = 0;
    let startItemY = 0;
    let isCurrentItemDragging = false;
    let prevPointerX = 0;

    function onPointerMove(e) {
      if (!isCurrentItemDragging) return;
      e.preventDefault();

      const dx = e.clientX - startPointerX;
      const dy = e.clientY - startPointerY;
      const newX = startItemX + dx;
      const newY = startItemY + dy;

      // 이동 속도에 맞춘 생동감 있는 회전 틸트
      const velocityX = e.clientX - prevPointerX;
      prevPointerX = e.clientX;
      const targetRot = Math.max(-24, Math.min(24, velocityX * 1.6));

      gsap.to(item, {
        x: newX,
        y: newY,
        rotation: targetRot,
        duration: 0.05,
        ease: 'power1.out',
        overwrite: 'auto'
      });
    }

    function onDragEnd(e) {
      if (!isCurrentItemDragging) return;
      isCurrentItemDragging = false;
      isUserInteracting = false;
      item.classList.remove('is-dragging');

      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onDragEnd);
      window.removeEventListener('pointercancel', onDragEnd);

      try {
        if (e && e.pointerId) item.releasePointerCapture(e.pointerId);
      } catch (_) {}

      const curX = gsap.getProperty(item, 'x') || 0;
      const curY = gsap.getProperty(item, 'y') || 0;
      const distFromPill = Math.hypot(curX, curY);

      if (distFromPill < 60) {
        // 필 안쪽에 놓음 ➔ 쏙 안착
        outsideItems.delete(itemType);
        gsap.to(item, {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          filter: 'drop-shadow(0 0px 0px rgba(0,0,0,0))',
          duration: 0.45,
          ease: 'elastic.out(1.2, 0.45)',
          overwrite: 'auto'
        });
        gsap.to(pill, {
          scale: 1.08,
          duration: 0.12,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out'
        });
      } else {
        // 필 바깥에 놓음 ➔ 드롭 지점에 머무르고, 맥 마우스가 와서 회수하도록 예약
        outsideItems.add(itemType);
        gsap.to(item, {
          rotation: 0,
          scale: 1.05,
          filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.18))',
          duration: 0.25,
          ease: 'back.out(1.6)',
          overwrite: 'auto'
        });

        scheduleRescue();
      }
    }

    function onPointerDown(e) {
      if (e.button !== 0 && e.pointerType === 'mouse') return;

      e.preventDefault();
      cancelAnyMacAction();
      isUserInteracting = true;
      isCurrentItemDragging = true;

      startPointerX = e.clientX;
      startPointerY = e.clientY;
      prevPointerX = e.clientX;
      startItemX = gsap.getProperty(item, 'x') || 0;
      startItemY = gsap.getProperty(item, 'y') || 0;

      try {
        item.setPointerCapture(e.pointerId);
      } catch (_) {}
      item.classList.add('is-dragging');

      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', onDragEnd);
      window.addEventListener('pointercancel', onDragEnd);

      gsap.to(item, {
        scale: 1.32,
        filter: 'drop-shadow(0 16px 26px rgba(0,0,0,0.28))',
        duration: 0.16,
        ease: 'back.out(2.2)',
        overwrite: 'auto'
      });
    }

    item.addEventListener('pointerdown', onPointerDown);
    pill.addEventListener('pointerdown', (e) => {
      // If clicking pill but not item, start drag
      if (!isCurrentItemDragging) onPointerDown(e);
    });
  }

  setupUserDraggable(dragLogo, pill1, 'logo');
  setupUserDraggable(dragEmoji, pill2, 'emoji');

  // ScrollTrigger: 섹션 진입 시 최초 1회만 실행!
  // 섹션을 완전히 벗어나면 상태 리셋하여 재진입 시 다시 실행 가능
  if (horizontalTween) {
    ScrollTrigger.create({
      trigger: sectionDesigner,
      containerAnimation: horizontalTween,
      start: 'left 80%',
      end: 'right 20%',
      onEnter: () => {
        if (!hasInitialPlayed) {
          hasInitialPlayed = true;
          macIntroTimeline && macIntroTimeline.play(0);
        }
      },
      onLeave: () => {
        hasInitialPlayed = false;
        cancelAnyMacAction();
      },
      onEnterBack: () => {
        if (!hasInitialPlayed) {
          hasInitialPlayed = true;
          macIntroTimeline && macIntroTimeline.play(0);
        }
      },
      onLeaveBack: () => {
        hasInitialPlayed = false;
        cancelAnyMacAction();
      },
    });
  }

  // Dynamic recalculation on window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildIntroTimeline();
      if (hasInitialPlayed) {
        if (!outsideItems.has('logo')) gsap.set(dragLogo, { x: 0, y: 0, scale: 1, rotation: 0 });
        if (!outsideItems.has('emoji')) gsap.set(dragEmoji, { x: 0, y: 0, scale: 1, rotation: 0 });
      }
    }, 200);
  });
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
