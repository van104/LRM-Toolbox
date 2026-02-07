<template>
    <div class="iframe-wrapper">
        
        <iframe :srcdoc="htmlContent" class="full-frame" title="Workout Timer" frameborder="0"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation allow-downloads allow-modals"></iframe>
    </div>
</template>

<script setup>

import htmlContent from './workout-timer-source.html?raw'
</script>

<style scoped>
.iframe-wrapper {
    width: 100%;
    
    height: calc(100vh - 64px);
    overflow: hidden;
    background: #f8fafc;
    
}

.full-frame {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
}
</style>
