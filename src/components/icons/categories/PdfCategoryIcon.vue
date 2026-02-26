<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <!-- Document shell -->
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />

    <!-- 'PDF' characters: Evenly spaced, P lengthened, and balanced -->
    <g stroke-width="1.2" transform="translate(0, 0.5)">
      <!-- P: Lengthened vertical stem -->
      <path d="M6.5 13.5v4" />
      <path d="M6.5 13.5h1.2a1.2 1.2 0 0 1 0 2.4h-1.2" />

      <!-- D: Shifted right to increase gap with P -->
      <path d="M11 13.5v4h0.6a1.5 1.5 0 0 0 0-4h-0.6" />

      <!-- F: Shifted right to balance spacing -->
      <path d="M15.5 13.5v4" />
      <path d="M15.5 13.5H18" />
      <path d="M15.5 15.5h1.5" />
    </g>
  </svg>
</template>
