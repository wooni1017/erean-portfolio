# REA 심층 역공학 리포트: https://gsap.com/ 전체 GSAP 구현 백서

> **분석 도구:** REA (Reverse-Engineer-Anything) Browser Scenario, CDP Runtime & Source Extraction  
> **대상 사이트:** `https://gsap.com/` (공식 프로덕션 런타임)  
> **분석 파일:** `/js/header.js`, `/tf-assets/index-036dc494.js` (전체 디컴파일/디옵티마이즈 분석)

---

## 1. 감지 및 분석된 GSAP 플러그인 생태계

REA 심층 덤프 및 추적 결과, `gsap.com` 프로덕션에서 활성화되어 실제 화면을 구동하는 플러그인 및 도구 목록:

1. **`ScrollTrigger`**: 전역 가로 스크롤 핀, 섹션 고정, 헤더 자동 노출/숨김, 서브 트윈 컨테이너 동기화(`containerAnimation`).
2. **`CustomEase`**: 사이트 고유의 탄성/감쇠 곡선을 SVG 패스로 직접 구운 커스텀 베지어 커브 엔진.
3. **`MotionPathPlugin`**: SVG 베지어 곡선 패스 경로를 따라 볼(`scrollBall`) 오브젝트를 실시간 주행시키는 모션 엔진.
4. **`DrawSVGPlugin`**: SVG 스트로크의 시작점과 끝점(`drawSVG: "0% 100%" -> "85% 100%"`)을 스크롤 연동 마스킹으로 드로잉.
5. **`SplitText`**: 헤드라인 및 타이포그래피를 문자 단위(`type: "chars"`)로 자동 분할하여 개별 3D 회전 및 스태거 적용.
6. **`quickTo` & `quickSetter`**: 마우스 움직임 추적(스퀴글, 버튼 마그네틱 플레어) 시 GC(가비지 컬렉션) 오버헤드 없는 60fps 인터폴레이터.
7. **`gsap.matchMedia`**: `prefers-reduced-motion` 환경 감지 및 디바이스 뷰포트별 조건부 애니메이션 분기.
8. **`gsap.utils.pipe` / `mapRange` / `clamp` / `random`**: 수학적 좌표 정규화 및 무작위 애니메이션 선택 유틸리티.

---

## 2. 섹션별 실제 구현 코드 & 사용처 완전 분석

### ① Home Hero (`Class P`)
* **목적:** 진입 시 강렬한 인상 전달 및 마우스 반응형 인터랙션
* **실제 구현 코드 분석:**
  - **스퀴글 마우스 인터랙션 (`initSquiggleMouseMovement`):**
    ```javascript
    const o = t.quickTo(this.DOM.squiggle, "xPercent", { duration: 1, ease: "power3" });
    const a = t.quickTo(this.DOM.squiggle, "yPercent", { duration: 1, ease: "power3" });
    const i = t.quickTo(this.DOM.squiggle, "rotation", { duration: 1, ease: "power3" });

    window.addEventListener("mousemove", (l) => {
      const c = t.utils.mapRange(0, e, -20, 20, l.x);
      const f = t.utils.mapRange(0, r, -20, 20, l.y);
      const w = t.utils.clamp(-1, 1, t.utils.mapRange(e * 0.25, e * 0.75, 1, -1, l.x));
      i(f * 1 * w); o(c); a(f);
    });
    ```
    - 마우스 X/Y 좌표를 윈도우 폭 대비 -20% ~ +20%로 매핑하여 `quickTo`로 관성 지연 추적.
    - 화면 중앙을 기준으로 회전 방향을 역전시키는 토크 계산(`w`) 포함.
  - **글자별 3D 플립 타임라인 (`char1` ~ `char5`):**
    - `transformOrigin: "50% 100%"` 지정 후 `rotationX: -180`에서 `back.out(1.7)` 이징으로 튀어 올라오는 3D 문자 연출.
  - **오브젝트 플레어 (풍차, 원형, 별, 번개, 벌레):**
    - SVG 도형별 독립 타임라인을 라벨 파라미터로 결합하여 하나의 교향곡처럼 순차 재생.

---

### ② Home Intro (`Class T`)
* **목적:** 텍스트 가독성 유도 및 GSAP SVG 드로잉 시연
* **실제 구현 코드 분석:**
  - **SplitText 기반 하이라이트 순차 스태거 (`staggerWord`):**
    ```javascript
    staggerWord(e) {
      return t.to(e, {
        color: "#0ae448",
        ease: "power3.inOut",
        duration: 0.8,
        stagger: { each: 0.075, repeat: 1, yoyo: true }
      });
    }
    ```
    - 단어 내부 글자들을 하나씩 초록색(#0ae448)으로 물들였다가 yoyo로 되돌리는 하이라이트 파동.
  - **DrawSVG 식물 줄기 자라나기 & 꽃 만개:**
    ```javascript
    a.to(this.DOM.stem, {
      keyframes: [
        { drawSVG: "0% 100%", ease: "power4.inOut", duration: 1 },
        { drawSVG: "100% 100%", ease: "power4.inOut", duration: 1, delay: 0.8 }
      ]
    }, 0);
    a.to(this.DOM.flower, {
      keyframes: [
        { scale: 1, ease: "power2.out", duration: 0.6 },
        { scale: 0, ease: "power2.inOut", rotateZ: 360, duration: 0.6, delay: 1.2 }
      ]
    }, 0.8);
    ```

---

### ③ Home Animate Showcase (`Class S`)
* **목적:** GSAP의 대표 기능(이징, 3D 원근, 복합 안무, 스냅)을 가로 스크롤 쇼케이스로 구현
* **실제 구현 코드 분석:**
  - **대규모 수평 스크롤 고정 (`containerAnimation`):**
    - `#home-animate-trigger`를 핀 고정하고 가로 이동 tween(`this.scrollTween`)을 생성한 뒤, 모든 자식 트리거가 `containerAnimation: this.scrollTween, horizontal: true`로 동작하도록 설계.
  - **`nice` 메서드:**
    - `elastic.out(1, 0.75)`를 사용해 위에서 튕겨 떨어지는 텍스트 탄성 연출 (`yPercent: -300 -> 0`, `rotateZ: -20 -> 0`).
  - **`super` 메서드 (3D 회전):**
    - `perspective: 800px` 공간 안에서 `rotateY: -25`, `rotateX: -85`에서 `back.out(1.4)`로 펼쳐지는 3D 입체 텍스트.
  - **`eases` 메서드 (CustomEase 직접 추출):**
    ```javascript
    const customEase1 = CustomEase.create("custom", "M0,0 C0,0.408 0.11,0.712 0.222,0.712 0.35,0.712 0.37,0.506 0.498,0.532 0.658,0.564 0.582,0.911 0.736,1.024 0.784,1.059 0.826,1.054 0.89,1.024 0.916,1.011 0.946,1 1,1 ");
    ```
    - 수학 공식이 아닌 순수 SVG 곡선 데이터를 파싱하여 완벽한 비대칭 스프링 감쇠 곡선 생성.
  - **`choreograph` 메서드 (오케스트레이션):**
    - 여러 엘리먼트의 `xPercent`와 `yPercent`를 키프레임과 라벨로 교차 동기화.
  - **`snap` 메서드 (키프레임 이산 회전):**
    ```javascript
    a.to(e, {
      keyframes: [
        { rotationZ: 90, ...o },
        { rotationZ: 180, delay: 1, ...o },
        { rotationZ: 270, delay: 1, ...o },
        { rotationZ: 360, delay: 1, ...o }
      ],
      repeat: -1
    });
    ```

---

### ④ Home Tools Showcase (`Class b`)
* **목적:** 실제 인터랙티브 도구 시연
* **실제 구현 코드 분석:**
  - **MotionPath 주행 (`playIndexToolsScroll`):**
    ```javascript
    t.timeline({
      defaults: { duration: 1.25, ease: "power3.inOut" },
      scrollTrigger: { trigger: this.el.scrollRow, start: "top 75%", end: "top 50%", once: true }
    })
    .to(this.el.scrollBall, {
      motionPath: {
        path: this.el.scrollPath,
        align: this.el.scrollPath,
        alignOrigin: [0.5, 0.5]
      }
    })
    .to(this.el.scrollMask, { drawSVG: "85% 100%" }, "<");
    ```
    - 볼(`scrollBall`)이 곡선 베지어 패스(`scrollPath`)를 따라 회전하며 달리고, 동시에 `DrawSVG` 마스크가 열리며 궤적이 드러남.
  - **UI 컴포넌트 & 텍스트 인터랙션:**
    - 슬라이더, 토글 스위치, 텍스트 형태 변환(Circle Wrapper <-> Square Wrapper) 타임라인 동시 구동.

---

### ⑤ Global Header (`Header` in `header.js`)
* **목적:** 전역 내비게이션, 반응형 메뉴, 브랜드 경험
* **실제 구현 코드 분석:**
  - **5중 무작위 로고 타임라인:**
    - `gsap.utils.random([this.tlLogo, this.tlLogo2, this.tlLogo3, this.tlLogo4, this.tlLogo5])`
    - 마우스를 올릴 때마다 5개 중 무작위 1개가 선정되어 SVG 각 노드가 완전히 다른 모프/트랜스폼을 재생.
  - **수학적 파이프라인 버튼 플레어 (`button__flair`):**
    - `gsap.utils.pipe(gsap.utils.mapRange(0, width, 0, 100), gsap.utils.clamp(0, 100))`을 통과시켜 0~100%로 보정된 정밀 좌표를 `quickSetter`로 즉시 반영.
  - **Sticky Header ScrollTrigger:**
    - 25px 하향 스크롤 시 `y: -50`으로 숨김, 1px이라도 상향 스크롤 시 `y: 0`으로 즉시 복귀.

---

## 3. 요약 결론

`gsap.com`은 단순 트윈 집합체가 아니라:
1. **`Class O extends _` 기반의 컴포넌트 블록 팩토리 아키텍처**
2. **`quickTo` / `quickSetter` + `gsap.utils.pipe`를 활용한 제로 오버헤드 마우스 물리 엔진**
3. **`CustomEase` SVG 패스 커브 추출을 통한 완벽한 감성 이징 제어**
4. **`MotionPath` + `DrawSVG` 결합을 통한 정밀 벡터 궤적 애니메이션**
5. **가로 스크롤 `pin`과 `containerAnimation`을 결합한 대규모 하위 타임라인 동기화**  
등 GSAP의 모든 상위급 플러그인과 아키텍처 패턴을 집대성하여 운영하고 있습니다.
