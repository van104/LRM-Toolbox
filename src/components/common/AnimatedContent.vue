<template>
  <div ref="elRef" :class="className" :style="{ visibility: 'hidden' }">
    <slot />
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, watch } from 'vue';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  gsap.registerPlugin(ScrollTrigger);

  const props = defineProps({
    distance: { type: Number, default: 100 },
    direction: { type: String, default: 'vertical' },
    reverse: { type: Boolean, default: false },
    duration: { type: Number, default: 0.8 },
    ease: { type: String, default: 'power3.out' },
    initialOpacity: { type: Number, default: 0 },
    animateOpacity: { type: Boolean, default: true },
    scale: { type: Number, default: 1 },
    threshold: { type: Number, default: 0.1 },
    delay: { type: Number, default: 0 },
    disappearAfter: { type: Number, default: 0 },
    disappearDuration: { type: Number, default: 0.5 },
    disappearEase: { type: String, default: 'power3.in' },
    className: { type: String, default: '' },
    container: { type: [String, Object], default: null },
    triggerKey: { type: [String, Number, Object], default: null }
  });

  const emit = defineEmits(['complete', 'disappearance-complete']);
  const elRef = ref(null);
  let st = null;
  let tl = null;

  const initAnimation = () => {
    const el = elRef.value;
    if (!el) return;

    if (st) st.kill();
    if (tl) tl.kill();

    let scrollerTarget = props.container || null;
    if (typeof scrollerTarget === 'string') {
      scrollerTarget = document.querySelector(scrollerTarget);
    }

    const axis = props.direction === 'horizontal' ? 'x' : 'y';
    const offset = props.reverse ? -props.distance : props.distance;
    const startPct = (1 - props.threshold) * 100;

    gsap.set(el, {
      [axis]: offset,
      scale: props.scale,
      opacity: props.animateOpacity ? props.initialOpacity : 1,
      visibility: 'visible'
    });

    tl = gsap.timeline({
      paused: true,
      delay: props.delay,
      onComplete: () => {
        emit('complete');
        if (props.disappearAfter > 0) {
          gsap.to(el, {
            [axis]: props.reverse ? props.distance : -props.distance,
            scale: 0.8,
            opacity: props.animateOpacity ? props.initialOpacity : 0,
            delay: props.disappearAfter,
            duration: props.disappearDuration,
            ease: props.disappearEase,
            onComplete: () => emit('disappearance-complete')
          });
        }
      }
    });

    tl.to(el, {
      [axis]: 0,
      scale: 1,
      opacity: 1,
      duration: props.duration,
      ease: props.ease
    });

    st = ScrollTrigger.create({
      trigger: el,
      scroller: scrollerTarget,
      start: `top ${startPct}%`,
      once: false,
      onEnter: () => tl.play()
    });
  };

  onMounted(() => {
    initAnimation();
  });

  onUnmounted(() => {
    if (st) st.kill();
    if (tl) tl.kill();
  });

  watch(
    () => props.triggerKey,
    () => {
      if (tl) tl.seek(0).pause();
      initAnimation();
    }
  );
</script>
