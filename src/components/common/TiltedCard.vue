<template>
    <figure ref="figureRef" class="tilted-card-figure" :style="{ height: containerHeight, width: containerWidth }"
        @mousemove="handleMouse" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
        <div v-if="showMobileWarning" class="tilted-card-mobile-alert">
            This effect is not optimized for mobile. Check on desktop.
        </div>

        
        <div class="tilted-card-inner" :style="innerStyle">
            
            <slot />

            <div v-if="displayOverlayContent" class="tilted-card-overlay">
                <slot name="overlay" />
            </div>
        </div>

        <figcaption v-if="showTooltip && captionText" class="tilted-card-caption" :style="captionStyle">
            {{ captionText }}
        </figcaption>
    </figure>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useSpring } from '@vueuse/motion';

const props = defineProps({
    captionText: { type: String, default: '' },
    containerHeight: { type: String, default: '100%' },
    containerWidth: { type: String, default: '100%' },
    scaleOnHover: { type: Number, default: 1.05 },
    rotateAmplitude: { type: Number, default: 14 },
    showMobileWarning: { type: Boolean, default: false },
    showTooltip: { type: Boolean, default: true },
    displayOverlayContent: { type: Boolean, default: false },
});

const figureRef = ref(null);
const lastY = ref(0);


const rotateX = useSpring(0, { stiffness: 100, damping: 30, mass: 2 });
const rotateY = useSpring(0, { stiffness: 100, damping: 30, mass: 2 });
const scale = useSpring(1, { stiffness: 100, damping: 30, mass: 2 });
const opacity = useSpring(0);
const rotateFigcaption = useSpring(0, { stiffness: 350, damping: 30, mass: 1 });

const mouseX = ref(0);
const mouseY = ref(0);

function handleMouse(e) {
    if (!figureRef.value) return;

    const rect = figureRef.value.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    const rotationX = (offsetY / (rect.height / 2)) * -props.rotateAmplitude;
    const rotationY = (offsetX / (rect.width / 2)) * props.rotateAmplitude;

    rotateX.set(rotationX);
    rotateY.set(rotationY);

    mouseX.value = e.clientX - rect.left;
    mouseY.value = e.clientY - rect.top;

    const velocityY = offsetY - lastY.value;
    rotateFigcaption.set(-velocityY * 0.6);
    lastY.value = offsetY;
}

function handleMouseEnter() {
    scale.set(props.scaleOnHover);
    opacity.set(1);
}

function handleMouseLeave() {
    opacity.set(0);
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
    rotateFigcaption.set(0);
}

const innerStyle = computed(() => ({
    transform: `perspective(800px) rotateX(${rotateX.value}deg) rotateY(${rotateY.value}deg) scale(${scale.value})`,
    transformStyle: 'preserve-3d',
    width: '100%',
    height: '100%'
}));

const captionStyle = computed(() => ({
    left: `${mouseX.value}px`,
    top: `${mouseY.value}px`,
    opacity: opacity.value,
    transform: `rotate(${rotateFigcaption.value}deg)`
}));
</script>

<style scoped>
.tilted-card-figure {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
}

.tilted-card-inner {
    position: relative;
    will-change: transform;
}

.tilted-card-overlay {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    will-change: transform;
    transform: translateZ(30px);
}

.tilted-card-caption {
    pointer-events: none;
    position: absolute;
    left: 0;
    top: 0;
    border-radius: 4px;
    background-color: #fff;
    padding: 4px 10px;
    font-size: 10px;
    color: #2d2d2d;
    z-index: 10;
    white-space: nowrap;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.tilted-card-mobile-alert {
    position: absolute;
    top: 1rem;
    text-align: center;
    font-size: 0.875rem;
    display: none;
    color: #fff;
    background: rgba(0, 0, 0, 0.8);
    padding: 0.5rem;
    border-radius: 4px;
    z-index: 20;
}

@media (max-width: 640px) {
    .tilted-card-mobile-alert {
        display: block;
    }

    .tilted-card-caption {
        display: none;
    }
}
</style>
