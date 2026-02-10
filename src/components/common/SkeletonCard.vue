<template>
  <div class="skeleton-card">
    <div class="skeleton-icon"></div>
    <div class="skeleton-content">
      <div class="skeleton-title"></div>
      <div class="skeleton-text"></div>
      <div class="skeleton-footer">
        <div class="skeleton-tag"></div>
        <div class="skeleton-tag"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .skeleton-card {
    padding: 1.25rem;
    border-radius: 12px;
    background: var(--bg-card, #ffffff);
    border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
    display: flex;
    gap: 1rem;
    height: 100%;
  }

  .skeleton-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    flex-shrink: 0;
  }

  .skeleton-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .skeleton-title {
    height: 18px;
    width: 50%;
    border-radius: 4px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    margin-bottom: 0.75rem;
  }

  .skeleton-text {
    height: 14px;
    width: 90%;
    border-radius: 4px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    margin-bottom: 0.5rem;
  }

  .skeleton-footer {
    margin-top: auto;
    display: flex;
    gap: 0.5rem;
  }

  .skeleton-tag {
    height: 20px;
    width: 40px;
    border-radius: 10px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  [data-theme='dark'] .skeleton-icon,
  [data-theme='dark'] .skeleton-title,
  [data-theme='dark'] .skeleton-text,
  [data-theme='dark'] .skeleton-tag {
    background: linear-gradient(90deg, #2a2a35 25%, #35354a 50%, #2a2a35 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  [data-theme='dark'] .skeleton-card {
    background: #1e293b;
    border-color: #334155;
  }
</style>
