<template>
  <span
    ref="containerRef"
    :class="parentClassName"
    class="decrypted-text-wrapper"
    v-bind="hoverProps"
  >
    <span class="sr-only">{{ text }}</span>
    <span aria-hidden="true">
      <span
        v-for="(char, index) in displayTextArray"
        :key="index"
        :class="isRevealedOrDone(index) ? className : encryptedClassName"
      >
        {{ char }}
      </span>
    </span>
  </span>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, watch, computed } from 'vue';

  const props = defineProps({
    text: {
      type: String,
      required: true
    },
    speed: {
      type: Number,
      default: 50
    },
    maxIterations: {
      type: Number,
      default: 10
    },
    sequential: {
      type: Boolean,
      default: false
    },
    revealDirection: {
      type: String,
      default: 'start'
    },
    useOriginalCharsOnly: {
      type: Boolean,
      default: false
    },
    characters: {
      type: String,
      default: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+'
    },
    className: {
      type: String,
      default: ''
    },
    parentClassName: {
      type: String,
      default: ''
    },
    encryptedClassName: {
      type: String,
      default: ''
    },
    animateOn: {
      type: String,
      default: 'hover'
    }
  });

  const displayText = ref(props.text);
  const isHovering = ref(false);
  const isScrambling = ref(false);
  const revealedIndices = ref(new Set());
  const hasAnimated = ref(false);
  const containerRef = ref(null);

  let interval = null;

  const displayTextArray = computed(() => displayText.value.split(''));

  const isRevealedOrDone = index => {
    return revealedIndices.value.has(index) || !isScrambling.value || !isHovering.value;
  };

  const getNextIndex = revealedSet => {
    const textLength = props.text.length;
    switch (props.revealDirection) {
      case 'start':
        return revealedSet.size;
      case 'end':
        return textLength - 1 - revealedSet.size;
      case 'center': {
        const middle = Math.floor(textLength / 2);
        const offset = Math.floor(revealedSet.size / 2);
        const nextIndex = revealedSet.size % 2 === 0 ? middle + offset : middle - offset - 1;

        if (nextIndex >= 0 && nextIndex < textLength && !revealedSet.has(nextIndex)) {
          return nextIndex;
        }

        for (let i = 0; i < textLength; i++) {
          if (!revealedSet.has(i)) return i;
        }
        return 0;
      }
      default:
        return revealedSet.size;
    }
  };

  const shuffleText = (originalText, currentRevealed) => {
    const availableChars = props.useOriginalCharsOnly
      ? Array.from(new Set(originalText.split(''))).filter(char => char !== ' ')
      : props.characters.split('');

    if (props.useOriginalCharsOnly) {
      const positions = originalText.split('').map((char, i) => ({
        char,
        isSpace: char === ' ',
        index: i,
        isRevealed: currentRevealed.has(i)
      }));

      const nonSpaceChars = positions.filter(p => !p.isSpace && !p.isRevealed).map(p => p.char);

      for (let i = nonSpaceChars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nonSpaceChars[i], nonSpaceChars[j]] = [nonSpaceChars[j], nonSpaceChars[i]];
      }

      let charIndex = 0;
      return positions
        .map(p => {
          if (p.isSpace) return ' ';
          if (p.isRevealed) return originalText[p.index];
          return nonSpaceChars[charIndex++];
        })
        .join('');
    } else {
      return originalText
        .split('')
        .map((char, i) => {
          if (char === ' ') return ' ';
          if (currentRevealed.has(i)) return originalText[i];
          return availableChars[Math.floor(Math.random() * availableChars.length)];
        })
        .join('');
    }
  };

  const startAnimation = () => {
    let currentIteration = 0;
    setIsHovering(true);
    isScrambling.value = true;

    if (interval) clearInterval(interval);

    interval = setInterval(() => {
      if (props.sequential) {
        if (revealedIndices.value.size < props.text.length) {
          const nextIndex = getNextIndex(revealedIndices.value);
          revealedIndices.value.add(nextIndex);
          displayText.value = shuffleText(props.text, revealedIndices.value);
        } else {
          stopAnimation();
        }
      } else {
        displayText.value = shuffleText(props.text, revealedIndices.value);
        currentIteration++;
        if (currentIteration >= props.maxIterations) {
          stopAnimation();
        }
      }
    }, props.speed);
  };

  const stopAnimation = () => {
    if (interval) clearInterval(interval);
    isScrambling.value = false;
    setIsHovering(false);
    displayText.value = props.text;
    revealedIndices.value.clear();
  };

  const setIsHovering = val => {
    isHovering.value = val;
  };

  const hoverProps = computed(() => {
    if (props.animateOn === 'hover' || props.animateOn === 'both') {
      return {
        onMouseenter: () => startAnimation(),
        onMouseleave: () => stopAnimation()
      };
    }
    return {};
  });

  watch(
    () => props.text,
    newText => {
      displayText.value = newText;
    }
  );

  onMounted(() => {
    if (props.animateOn !== 'view' && props.animateOn !== 'both') return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasAnimated.value) {
            startAnimation();
            hasAnimated.value = true;
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.value) {
      observer.observe(containerRef.value);
    }

    onUnmounted(() => {
      if (containerRef.value) {
        observer.unobserve(containerRef.value);
      }
      if (interval) clearInterval(interval);
    });
  });

  onUnmounted(() => {
    if (interval) clearInterval(interval);
  });
</script>

<style scoped>
  .decrypted-text-wrapper {
    display: inline-block;
    white-space: pre-wrap;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }
</style>
