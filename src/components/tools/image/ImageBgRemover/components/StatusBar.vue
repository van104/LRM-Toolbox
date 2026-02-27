<template>
  <div class="brutal-status" :class="statusClass">
    <div class="marquee-wrapper">
      <div class="marquee-content">
        <span>
          <span v-for="i in 10" :key="i">{{ statusText }} // &nbsp;</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps({
    statusClass: {
      type: String,
      default: 'info'
    },
    statusText: {
      type: String,
      required: true
    }
  });
</script>

<style scoped>
  .brutal-status {
    background: #111;
    color: #fff;
    border: 4px solid #111;
    height: 60px;
    display: flex;
    align-items: center;
    overflow: hidden;
    box-shadow: 8px 8px 0px #111;
  }

  .brutal-status.info {
    background: #4b7bff;
  }
  .brutal-status.warn {
    background: #ff4b4b;
  }
  .brutal-status.success {
    background: #00e572;
    color: #111;
  }

  .marquee-wrapper {
    width: 100%;
    overflow: hidden;
  }

  .marquee-content {
    display: inline-block;
    white-space: nowrap;
    animation: marquee 20s linear infinite;
    font-weight: 900;
    text-transform: uppercase;
    font-size: 1.25rem;
  }

  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .brutal-status.info {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-status.success {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .brutal-status.warn {
    background: #b28f00;
    color: #fff;
  }
</style>
