<template>
  <div class="tool-skeleton bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
    <el-skeleton animated>
      <template #template>
        <!-- 头部区域 (图标 + 标题 + 简介) -->
        <div class="flex items-center mb-6">
          <el-skeleton-item
            variant="circle"
            style="width: 48px; height: 48px; margin-right: 16px"
          />
          <div class="flex-1">
            <el-skeleton-item variant="h3" style="width: 30%; height: 24px; margin-bottom: 8px" />
            <el-skeleton-item variant="text" style="width: 60%" />
          </div>
        </div>

        <!-- 操作区域 (按钮 / 输入框) -->
        <div class="mb-6 flex gap-4">
          <el-skeleton-item variant="button" style="width: 120px" />
          <el-skeleton-item variant="button" style="width: 120px" />
        </div>

        <!-- 主要内容区域 (结果展示 / canvas) -->
        <div class="skeleton-content">
          <el-skeleton-item
            variant="rect"
            style="width: 100%; height: 300px; margin-bottom: 16px; border-radius: 8px"
          />
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script setup lang="ts">
  // 这是一个纯展示组件，无需逻辑
</script>

<style scoped>
  .tool-skeleton {
    min-height: 400px;
  }
</style>
