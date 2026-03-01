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
    <!-- Code bracket / File base -->
    <path d="M16 18l1 1h4V5h-4l-1 1" />
    <path d="M8 6l-1-1H3v14h4l1-1" />

    <!-- Scrambled lines to represent obfuscation -->
    <path d="M7 9h2" opacity="0.5" />
    <path d="M15 9h2" opacity="0.5" />
    <path d="M7 12h1" opacity="0.5" />
    <path d="M16 12h1" opacity="0.5" />
    <path d="M7 15h3" opacity="0.5" />

    <!-- Centered Lock Symbol -->
    <rect x="8" y="11" width="8" height="6" rx="1" />
    <path d="M10 11V9a2 2 0 1 1 4 0v2" />

    <!-- JS letters silhouette/hint -->
    <path d="M4 8v4" stroke-width="1.5" />
    <path d="M20 8v4" stroke-width="1.5" />
  </svg>
</template>
