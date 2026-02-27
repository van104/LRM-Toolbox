<template>
  <div class="brutal-pane">
    <div class="pane-header bg-blue">
      <span class="text-white">API配置.控制台</span>
    </div>

    <div class="settings-content">
      <div class="brutal-form-group">
        <label class="brutal-label">接口通信协议提供商</label>
        <select
          :value="apiConfig.provider"
          class="brutal-input"
          @change="
            $emit('update:api-config', {
              ...apiConfig,
              provider: ($event.target as HTMLSelectElement).value
            })
          "
        >
          <option value="builtin">LRM 系统内置管道 (低精度免费)</option>
          <option value="remove.bg">Remove.bg 专用轨道</option>
          <option value="baidu">Baidu 智能云 AI 集群</option>
          <option value="custom">定制网关路由 (Custom API)</option>
        </select>
      </div>

      <div v-if="apiConfig.provider === 'builtin'" class="tool-note mt-3">
        内置 API 每月享有免费调用池。默认以 0.25MP 分辨率 work 以节省带宽。
      </div>
      <div v-else-if="apiConfig.provider === 'baidu'" class="tool-note mt-3">
        需前往百度智能云获取 Access Token 所需的控制密钥。
      </div>

      <!-- Credentials Block -->
      <div v-if="apiConfig.provider !== 'builtin'" class="brutal-form-group channel-group mt-4">
        <h4>🔑 通信凭证鉴权库</h4>

        <div v-if="apiConfig.provider === 'baidu'">
          <label class="brutal-label text-sm mt-3">API Client ID</label>
          <input
            :value="apiConfig.apiKey"
            type="password"
            class="brutal-input"
            placeholder="输入 Baidu API Key"
            @input="
              $emit('update:api-config', {
                ...apiConfig,
                apiKey: ($event.target as HTMLInputElement).value
              })
            "
          />

          <label class="brutal-label text-sm mt-3">Client Secret</label>
          <input
            :value="apiConfig.baiduSecret"
            type="password"
            class="brutal-input"
            placeholder="输入 Baidu Secret Key"
            @input="
              $emit('update:api-config', {
                ...apiConfig,
                baiduSecret: ($event.target as HTMLInputElement).value
              })
            "
          />
        </div>

        <div v-else>
          <label class="brutal-label text-sm mt-3">{{
            apiConfig.provider === 'custom' ? '请求入口 URL' : '核心 Authorization Key'
          }}</label>
          <input
            :value="apiConfig.apiKey"
            :type="apiConfig.provider === 'custom' ? 'text' : 'password'"
            class="brutal-input"
            placeholder="输入授权码/URL"
            @input="
              $emit('update:api-config', {
                ...apiConfig,
                apiKey: ($event.target as HTMLInputElement).value
              })
            "
          />
        </div>

        <div v-if="apiConfig.provider === 'custom'" class="mt-3">
          <label class="brutal-label text-sm">自定义 Header 报文 (JSON)</label>
          <textarea
            :value="apiConfig.customHeaders"
            class="brutal-input"
            rows="3"
            placeholder='{"Authorization": "Bearer xxx"}'
            @input="
              $emit('update:api-config', {
                ...apiConfig,
                customHeaders: ($event.target as HTMLTextAreaElement).value
              })
            "
          ></textarea>
        </div>
      </div>

      <!-- Render Settings -->
      <div class="brutal-form-group channel-group group-pink mt-4">
        <h4>⚙️ 图形编译及渲染设置</h4>

        <label class="brutal-label text-sm mt-3">导出精度阈值</label>
        <div class="radio-bar mt-1">
          <label class="radio-pill" :class="{ active: outputConfig.size === 'preview' }">
            <input
              type="radio"
              value="preview"
              class="hidden-radio"
              :checked="outputConfig.size === 'preview'"
              @change="$emit('update:output-config', { ...outputConfig, size: 'preview' })"
            />
            基础探测 (0.25MP)
          </label>
          <label class="radio-pill" :class="{ active: outputConfig.size === 'full' }">
            <input
              type="radio"
              value="full"
              class="hidden-radio"
              :checked="outputConfig.size === 'full'"
              @change="$emit('update:output-config', { ...outputConfig, size: 'full' })"
            />
            全精度满载 (耗点)
          </label>
        </div>

        <div class="divider mt-4"></div>

        <label class="brutal-label text-sm mt-3">强制白边勾画补完计划</label>
        <label class="brutal-checkbox-label">
          <input
            :checked="strokeConfig.enabled"
            type="checkbox"
            class="brutal-checkbox"
            @change="
              $emit('update:stroke-config', {
                ...strokeConfig,
                enabled: ($event.target as HTMLInputElement).checked
              })
            "
          />
          激活外部扩充描边路径
        </label>

        <div v-if="strokeConfig.enabled" class="mt-3 indent-group">
          <div class="flex-row">
            <input
              :value="strokeConfig.color"
              type="color"
              class="brutal-color-picker brutal-shadow-sm me-3"
              @input="
                $emit('update:stroke-config', {
                  ...strokeConfig,
                  color: ($event.target as HTMLInputElement).value
                })
              "
            />
            <div style="flex: 1">
              <label class="brutal-label text-sm mb-1">蔓延厚度: {{ strokeConfig.width }}px</label>
              <input
                :value="strokeConfig.width"
                type="range"
                class="brutal-slider small-slider"
                min="1"
                max="50"
                @input="
                  $emit('update:stroke-config', {
                    ...strokeConfig,
                    width: parseInt(($event.target as HTMLInputElement).value)
                  })
                "
              />
            </div>
          </div>
        </div>

        <div class="divider mt-4"></div>

        <label class="brutal-label text-sm mt-3">导出前缀自定义</label>
        <input
          :value="outputConfig.filename"
          type="text"
          class="brutal-input"
          placeholder="自动计算命名规则"
          @input="
            $emit('update:output-config', {
              ...outputConfig,
              filename: ($event.target as HTMLInputElement).value
            })
          "
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface APIConfig {
    provider: string;
    apiKey: string;
    baiduSecret: string;
    customHeaders: string;
  }

  interface OutputConfig {
    size: string;
    filename: string;
  }

  interface StrokeConfig {
    enabled: boolean;
    color: string;
    width: number;
  }

  defineProps<{
    apiConfig: APIConfig;
    outputConfig: OutputConfig;
    strokeConfig: StrokeConfig;
  }>();

  defineEmits(['update:api-config', 'update:output-config', 'update:stroke-config']);
</script>

<style scoped>
  .brutal-pane {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    transition: transform 0.2s;
  }
  .brutal-pane:hover {
    transform: translate(-4px, -4px);
    box-shadow: 16px 16px 0px #111;
  }

  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.25rem;
    letter-spacing: 1px;
  }

  .bg-blue {
    background: #2dfdff;
    color: #111;
  }
  .text-white {
    color: #111 !important;
  }

  .settings-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    flex: 1;
    background: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 1px, transparent 1px),
      linear-gradient(90deg, #e5e5e5 1px, transparent 1px);
    background-size: 20px 20px;
  }

  .brutal-form-group {
    margin-bottom: 1.5rem;
    text-align: left;
  }

  .channel-group {
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    padding: 1.25rem;
    background: #fff;
  }
  .channel-group h4 {
    margin: 0 0 1rem 0;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
  }

  .channel-group.group-pink {
    background: #ff9ecf;
  }

  .brutal-label {
    display: block;
    margin-bottom: 0.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    color: #111;
  }
  .text-sm {
    font-size: 0.9rem;
  }

  .brutal-input {
    width: 100%;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 1rem;
    padding: 0.75rem;
    border: 3px solid #111;
    border-radius: 0;
    box-shadow: 4px 4px 0px #111;
    outline: none;
    transition: all 0.1s;
    background: #fff;
    box-sizing: border-box;
  }
  .brutal-input:focus {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .tool-note {
    font-size: 0.85rem;
    color: #111;
    font-weight: bold;
    border-left: 4px solid #ff4b4b;
    padding-left: 0.5rem;
    background: rgba(255, 75, 75, 0.1);
    padding: 0.5rem;
    text-align: left;
  }

  .radio-bar {
    display: flex;
    gap: 0.5rem;
    background: #fff;
    padding: 0.5rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
  }
  .radio-pill {
    flex: 1;
    text-align: center;
    padding: 0.5rem;
    border: 2px solid transparent;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.1s;
    background: transparent;
  }
  .radio-pill.active {
    background: #111;
    color: #fff;
    border-color: #111;
  }
  .hidden-radio {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .divider {
    height: 4px;
    background: #111;
    margin: 1rem 0;
  }

  .brutal-checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 0.95rem;
    background: #fff;
    border: 3px solid #111;
    padding: 0.75rem;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }
  .brutal-checkbox {
    appearance: none;
    width: 24px;
    height: 24px;
    border: 3px solid #111;
    background: #fff;
    cursor: pointer;
    position: relative;
    margin: 0;
  }
  .brutal-checkbox:checked {
    background: #111;
  }
  .brutal-checkbox:checked::after {
    content: '✓';
    color: #fff;
    position: absolute;
    left: 4px;
    top: -2px;
    font-size: 18px;
  }

  .indent-group {
    padding-left: 1rem;
    border-left: 4px solid #111;
  }

  .flex-row {
    display: flex;
    align-items: center;
  }
  .me-3 {
    margin-right: 1rem;
  }

  .brutal-color-picker {
    width: 48px;
    height: 48px;
    border: 3px solid #111;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    padding: 0;
  }

  .brutal-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 12px;
    background: #fff;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
    outline: none;
  }
  .brutal-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 24px;
    background: #ff4b4b;
    border: 3px solid #111;
    cursor: pointer;
  }

  /* Dark Mode Overrides */
  [data-theme='dark'] .brutal-pane {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 12px 12px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .bg-blue {
    background: #075985;
    color: #fff;
  }
  [data-theme='dark'] .settings-content {
    background: #222;
    background-image:
      linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px);
  }
  [data-theme='dark'] .brutal-input {
    background: #111;
    border-color: #eee;
    color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .channel-group {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .channel-group.group-pink {
    background: #9d174d;
  }
  [data-theme='dark'] .brutal-label {
    color: #eee;
  }
  [data-theme='dark'] .tool-note {
    background: rgba(238, 238, 238, 0.1);
    color: #eee;
    border-left-color: #eee;
  }
  [data-theme='dark'] .radio-bar {
    background: #111;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .radio-pill.active {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .brutal-checkbox-label {
    background: #111;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-checkbox {
    background: #222;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-checkbox:checked {
    background: #eee;
  }
  [data-theme='dark'] .brutal-checkbox:checked::after {
    color: #111;
  }
  [data-theme='dark'] .divider {
    background: #eee;
  }
  [data-theme='dark'] .brutal-slider {
    background: #222;
    border-color: #eee;
  }

  .mt-3 {
    margin-top: 1rem;
  }
  .mt-4 {
    margin-top: 1.5rem;
  }
</style>
