<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <div class="header-action start">
          <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        </div>
        <h1 class="brutal-title">照片书工坊<span>.拼装()</span></h1>
        <div class="header-action end">
          <button class="brutal-btn action-btn" :disabled="exporting" @click="exportBook">
            {{ exporting ? '导出中...' : '导出画册页' }}
          </button>
        </div>
      </header>

      <main class="tool-content">
        <div class="editor-layout">
          <aside class="asset-sidebar glass-card">
            <el-tabs v-model="activeTab">
              <el-tab-pane label="图片" name="photos">
                <div class="scroll-container">
                  <div class="upload-zone" @click="triggerFileInput">
                    <el-icon :size="24">
                      <Plus />
                    </el-icon>
                    <span>添加照片</span>
                    <input
                      ref="fileInput"
                      type="file"
                      hidden
                      multiple
                      accept="image/*"
                      @change="handleFileSelect"
                    />
                  </div>
                  <div class="asset-grid">
                    <div
                      v-for="(img, idx) in userPhotos"
                      :key="idx"
                      class="asset-item photo"
                      draggable="true"
                      @dragstart="startDrag($event, 'image', img)"
                      @click="addItem('image', img)"
                    >
                      <img :src="img" />
                      <div class="overlay">
                        <el-icon>
                          <Plus />
                        </el-icon>
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="模板" name="templates">
                <div class="scroll-container">
                  <div class="template-grid">
                    <div
                      v-for="temp in templates"
                      :key="temp.id"
                      class="template-item"
                      @click="applyTemplate(temp)"
                    >
                      <div class="temp-preview" :class="temp.id">
                        <div v-for="i in temp.slots" :key="i" class="temp-slot"></div>
                      </div>
                      <span>{{ temp.name }}</span>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="贴纸" name="stickers">
                <div class="scroll-container">
                  <div class="asset-grid">
                    <div
                      v-for="stk in stickers"
                      :key="stk.id"
                      class="asset-item sticker"
                      draggable="true"
                      @dragstart="startDrag($event, 'sticker', stk)"
                      @click="addSticker(stk)"
                    >
                      <div class="sticker-icon" :style="{ backgroundColor: stk.color }">
                        <el-icon :size="24">
                          <component :is="stk.icon" />
                        </el-icon>
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </aside>

          <section class="workspace" @dragover.prevent @dragenter.prevent @drop="onDrop">
            <div
              class="canvas-container"
              :style="canvasContainerStyle"
              @dragover.prevent
              @drop.stop="onDrop"
            >
              <div
                ref="bookCanvas"
                class="book-canvas shadow-xl"
                :style="canvasStyle"
                @mousedown="deselectAll"
                @dragover.prevent
                @drop.stop="onDrop"
              >
                <div
                  v-for="item in canvasItems"
                  :key="item.id"
                  class="canvas-element"
                  :class="{ active: selectedId === item.id }"
                  :style="getElementStyle(item)"
                  @mousedown.stop="selectItem(item, $event)"
                >
                  <img v-if="item.type === 'image'" :src="item.src" draggable="false" />

                  <div
                    v-if="item.type === 'sticker'"
                    class="sticker-wrapper"
                    :style="{ backgroundColor: item.color }"
                  >
                    <el-icon :size="item.width * 2">
                      <component :is="IconMap[item.icon]" />
                    </el-icon>
                  </div>

                  <div
                    v-if="selectedId === item.id"
                    class="resize-handle se"
                    @mousedown.stop="startResize(item, $event)"
                  ></div>
                </div>

                <div v-if="currentTemplate" class="template-overlay">
                  <div
                    v-for="(slot, idx) in currentTemplate.slots_data"
                    :key="idx"
                    class="template-slot"
                    :style="getSlotStyle(slot)"
                    @dragover.prevent
                    @drop.stop="onDropToTemplate(idx)"
                  >
                    <div v-if="!slot.occupied" class="slot-hint">
                      <el-icon>
                        <Picture />
                      </el-icon>
                      <span>拖拽照片至此</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="selectedItem" class="context-toolbar glass-card">
              <el-button-group size="small">
                <el-button @click="moveLayer(1)"
                  ><el-icon> <Top /> </el-icon
                ></el-button>
                <el-button @click="moveLayer(-1)"
                  ><el-icon> <Bottom /> </el-icon
                ></el-button>
                <el-button type="danger" @click="removeItem"
                  ><el-icon> <Delete /> </el-icon
                ></el-button>
              </el-button-group>
              <el-divider direction="vertical" />
              <div class="slider-group">
                <span>旋转</span>
                <el-slider
                  v-model="selectedItem.rotation"
                  :min="0"
                  :max="360"
                  style="width: 80px"
                />
              </div>
              <el-divider direction="vertical" />
              <div class="slider-group">
                <span>不透明度</span>
                <el-slider
                  v-model="selectedItem.opacity"
                  :min="0"
                  :max="1"
                  :step="0.01"
                  style="width: 80px"
                />
              </div>
            </div>
          </section>

          <aside class="settings-sidebar glass-card">
            <div class="panel-section">
              <h3 class="section-title">画册设置</h3>
              <div class="settings-group">
                <div class="label">尺寸 / 纵横比</div>
                <el-select v-model="config.aspectRatio" @change="resetCanvas">
                  <el-option label="正方形 (1:1)" value="1:1" />
                  <el-option label="经典横向 (4:3)" value="4:3" />
                  <el-option label="经典纵向 (3:4)" value="3:4" />
                  <el-option label="高清巨幕 (16:9)" value="16:9" />
                </el-select>
              </div>
              <div class="settings-group">
                <div class="label">打印分辨率</div>
                <el-select v-model="config.dpi">
                  <el-option label="屏幕预览 (72 DPI)" :value="72" />
                  <el-option label="标准打印 (150 DPI)" :value="150" />
                  <el-option label="高清写真 (300 DPI)" :value="300" />
                </el-select>
              </div>
            </div>

            <div class="panel-section">
              <h3 class="section-title">背景定制</h3>
              <div class="settings-group">
                <div class="label">填充底色</div>
                <el-color-picker v-model="config.bgColor" show-alpha />
              </div>
              <div class="settings-group">
                <div class="label">背景纹理</div>
                <div class="pattern-grid">
                  <div
                    v-for="p in patterns"
                    :key="p.id"
                    class="pattern-item"
                    :class="{ active: config.pattern === p.url }"
                    :style="{ backgroundImage: `url(${p.url})` }"
                    @click="config.pattern = p.url"
                  ></div>
                  <div class="pattern-item none" @click="config.pattern = ''">无</div>
                </div>
              </div>
            </div>

            <div v-if="selectedItem && selectedItem.type === 'sticker'" class="panel-section">
              <h3 class="section-title">贴纸样式</h3>
              <div class="settings-group">
                <div class="label">主题色</div>
                <el-color-picker v-model="selectedItem.color" />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import {
    Plus,
    Picture,
    Delete,
    Top,
    Bottom,
    Star,
    PriceTag,
    CircleCheck,
    Location,
    Opportunity,
    Brush,
    Handbag,
    GoldMedal,
    MagicStick,
    Trophy
  } from '@element-plus/icons-vue';
  import html2canvas from 'html2canvas';
  import { useFileHandler } from '@/composables';

  const IconMap = {
    Star,
    PriceTag,
    CircleCheck,
    Location,
    Opportunity,
    Brush,
    Handbag,
    GoldMedal,
    MagicStick,
    Trophy
  };

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const activeTab = ref('photos');
  const { fileInput, triggerFileInput } = useFileHandler({
    accept: 'image/*',
    readMode: 'none'
  });
  const exporting = ref(false);

  const userPhotos = ref([]);

  onMounted(() => {
    const examples = [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1511576661531-b3837da126ba?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=400&fit=crop'
    ];
    examples.forEach(url => {
      if (!userPhotos.value.includes(url)) userPhotos.value.push(url);
    });
  });
  const canvasItems = ref([]);
  const selectedId = ref(null);

  const config = reactive({
    aspectRatio: '1:1',
    bgColor: '#ffffff',
    pattern: '',
    dpi: 150
  });

  const stickers = [
    { id: 1, icon: 'Star', color: '#ffd700' },
    { id: 2, icon: 'PriceTag', color: '#ff4d4f' },
    { id: 3, icon: 'CircleCheck', color: '#52c41a' },
    { id: 4, icon: 'Location', color: '#1890ff' },
    { id: 5, icon: 'Opportunity', color: '#722ed1' },
    { id: 6, icon: 'Brush', color: '#eb2f96' },
    { id: 7, icon: 'Handbag', color: '#fa8c16' },
    { id: 8, icon: 'GoldMedal', color: '#faad14' },
    { id: 9, icon: 'MagicStick', color: '#13c2c2' },
    { id: 10, icon: 'Trophy', color: '#fa8c16' }
  ];

  const patterns = [
    { id: 1, url: 'https://www.transparenttextures.com/patterns/cubes.png' },
    { id: 2, url: 'https://www.transparenttextures.com/patterns/diagonal-striped-brick.png' },
    { id: 3, url: 'https://www.transparenttextures.com/patterns/pinstriped-suit.png' },
    { id: 4, url: 'https://www.transparenttextures.com/patterns/paper-fibers.png' }
  ];

  const templates = [
    {
      id: 'single',
      name: '大片封面',
      slots: 1,
      slots_data: [{ left: 5, top: 5, width: 90, height: 90, occupied: false }]
    },
    {
      id: 'vertical-2',
      name: '双图对齐',
      slots: 2,
      slots_data: [
        { left: 5, top: 5, width: 90, height: 42.5, occupied: false },
        { left: 5, top: 52.5, width: 90, height: 42.5, occupied: false }
      ]
    },
    {
      id: 'grid-4',
      name: '经典四宫',
      slots: 4,
      slots_data: [
        { left: 5, top: 5, width: 42.5, height: 42.5, occupied: false },
        { left: 52.5, top: 5, width: 42.5, height: 42.5, occupied: false },
        { left: 5, top: 52.5, width: 42.5, height: 42.5, occupied: false },
        { left: 52.5, top: 52.5, width: 42.5, height: 42.5, occupied: false }
      ]
    }
  ];

  const currentTemplate = ref(null);

  const canvasStyle = computed(() => {
    const [w, h] = config.aspectRatio.split(':').map(Number);
    return {
      aspectRatio: `${w}/${h}`,
      backgroundColor: config.bgColor,
      backgroundImage: config.pattern ? `url(${config.pattern})` : 'none',
      position: 'relative',
      overflow: 'hidden'
    };
  });

  const canvasContainerStyle = computed(() => {
    const [w, h] = config.aspectRatio.split(':').map(Number);
    return {
      width: w >= h ? '90%' : 'auto',
      height: w >= h ? 'auto' : '90%',
      aspectRatio: `${w}/${h}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    };
  });

  const handleFileSelect = event => {
    const files = Array.from(event.target.files);
    for (let file of files) {
      const url = URL.createObjectURL(file);
      userPhotos.value.push(url);
    }
    event.target.value = '';
  };

  const selectItem = (item, e) => {
    selectedId.value = item.id;
    startMove(item, e);
  };

  const deselectAll = () => {
    selectedId.value = null;
  };

  const selectedItem = computed(() => canvasItems.value.find(i => i.id === selectedId.value));

  const getElementStyle = item => ({
    left: item.x + '%',
    top: item.y + '%',
    width: item.width + '%',
    height: 'auto',
    opacity: item.opacity,
    transform: `rotate(${item.rotation || 0}deg)`,
    zIndex: item.zIndex,
    position: 'absolute'
  });

  const getSlotStyle = slot => ({
    left: slot.left + '%',
    top: slot.top + '%',
    width: slot.width + '%',
    height: slot.height + '%',
    position: 'absolute'
  });

  const draggingAsset = ref(null);

  const startDrag = (e, type, data) => {
    draggingAsset.value = { type, data };

    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'copy';
    }
  };

  const onDrop = e => {
    if (!draggingAsset.value) return;
    const { type, data } = draggingAsset.value;

    const canvasRect = document.querySelector('.book-canvas')?.getBoundingClientRect();
    if (!canvasRect || canvasRect.width === 0) {
      addItem(type, data, 10, 10);
      draggingAsset.value = null;
      return;
    }

    let x = ((e.clientX - canvasRect.left) / canvasRect.width) * 100;
    let y = ((e.clientY - canvasRect.top) / canvasRect.height) * 100;

    x = Math.max(0, Math.min(x, 70));
    y = Math.max(0, Math.min(y, 70));

    addItem(type, data, x, y);
    draggingAsset.value = null;
  };

  const addItem = (type, data, x = 20, y = 20) => {
    const newItem = {
      id: Date.now(),
      type,
      x,
      y,
      width: type === 'image' ? 30 : 10,
      opacity: 1,
      rotation: 0,
      zIndex: canvasItems.value.length + 50
    };

    if (type === 'image') newItem.src = data;
    if (type === 'sticker') {
      newItem.icon = data.icon;
      newItem.color = data.color;
    }

    canvasItems.value.push(newItem);
    selectedId.value = newItem.id;
  };

  const addSticker = stk => {
    addItem('sticker', stk);
  };

  const applyTemplate = temp => {
    if (canvasItems.value.length > 0) {
      ElMessageBox.confirm('应用新模板将清空当前画布上的图片，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          executeApplyTemplate(temp);
        })
        .catch(() => {});
    } else {
      executeApplyTemplate(temp);
    }
  };

  const executeApplyTemplate = temp => {
    currentTemplate.value = JSON.parse(JSON.stringify(temp));

    canvasItems.value = canvasItems.value.filter(i => i.type !== 'image');
  };

  const onDropToTemplate = idx => {
    if (!draggingAsset.value || draggingAsset.value.type !== 'image') return;
    const slot = currentTemplate.value.slots_data[idx];

    const newItem = {
      id: Date.now(),
      type: 'image',
      x: slot.left,
      y: slot.top,
      width: slot.width,
      src: draggingAsset.value.data,
      opacity: 1,
      rotation: 0,
      zIndex: 10
    };
    canvasItems.value.push(newItem);
    slot.occupied = true;
    draggingAsset.value = null;
  };

  let isMoving = false;
  let isResizing = false;
  let startX, startY, startLeft, startTop, startWidth;

  const startMove = (item, e) => {
    isMoving = true;
    startX = e.clientX;
    startY = e.clientY;
    const canvasRect = document.querySelector('.book-canvas').getBoundingClientRect();
    startLeft = (item.x / 100) * canvasRect.width;
    startTop = (item.y / 100) * canvasRect.height;

    document.addEventListener('mousemove', moving);
    document.addEventListener('mouseup', stopAll);
  };

  const moving = e => {
    if (!isMoving) return;
    const item = selectedItem.value;
    if (!item) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const canvasRect = document.querySelector('.book-canvas').getBoundingClientRect();
    item.x = ((startLeft + dx) / canvasRect.width) * 100;
    item.y = ((startTop + dy) / canvasRect.height) * 100;
  };

  const startResize = (item, e) => {
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    const canvasRect = document.querySelector('.book-canvas').getBoundingClientRect();
    startWidth = (item.width / 100) * canvasRect.width;

    document.addEventListener('mousemove', resizing);
    document.addEventListener('mouseup', stopAll);
  };

  const resizing = e => {
    if (!isResizing) return;
    const item = selectedItem.value;
    if (!item) return;

    const dx = e.clientX - startX;
    const canvasRect = document.querySelector('.book-canvas').getBoundingClientRect();
    item.width = ((startWidth + dx) / canvasRect.width) * 100;
    if (item.width < 5) item.width = 5;
  };

  const stopAll = () => {
    isMoving = false;
    isResizing = false;
    document.removeEventListener('mousemove', moving);
    document.removeEventListener('mousemove', resizing);
    document.removeEventListener('mouseup', stopAll);
  };

  const moveLayer = dir => {
    if (!selectedItem.value) return;
    selectedItem.value.zIndex += dir;
  };

  const removeItem = () => {
    canvasItems.value = canvasItems.value.filter(i => i.id !== selectedId.value);
    selectedId.value = null;
  };

  const resetCanvas = () => {
    currentTemplate.value = null;
    canvasItems.value = [];
  };

  const exportBook = async () => {
    exporting.value = true;

    selectedId.value = null;
    await nextTick();

    try {
      const canvasEl = document.querySelector('.book-canvas');

      const scale = config.dpi / 72;
      const canvas = await html2canvas(canvasEl, {
        scale: scale,
        useCORS: true,
        backgroundColor: null
      });

      const link = document.createElement('a');
      link.download = `photobook_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      ElMessage.success('导出成功！');
    } catch (err) {
      console.error(err);
      ElMessage.error('转换失败，请检查网络或素材权限');
    } finally {
      exporting.value = false;
    }
  };

  onUnmounted(() => {
    userPhotos.value.forEach(url => URL.revokeObjectURL(url));
  });
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  .brutal-wrapper {
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    min-height: 100vh;
    padding: 1.5rem;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
  }
  .brutal-container {
    max-width: 1600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  .brutal-header {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  .header-action.start {
    display: flex;
    justify-content: flex-start;
  }
  .header-action.end {
    display: flex;
    justify-content: flex-end;
  }
  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 2.5rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #ff4b4b;
  }
  .brutal-title span {
    color: #ff4b4b;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }

  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.6rem 1.25rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }
  .brutal-btn:hover:not(:disabled) {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active:not(:disabled) {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }
  .brutal-btn:disabled {
    background: #e0e0e0;
    color: #888;
    border-color: #888;
    box-shadow: 2px 2px 0px #888;
    cursor: not-allowed;
  }
  .action-btn {
    background: #00e572;
    color: #111;
  }

  .tool-content {
    flex: 1;
    padding: 0;
    display: flex;
    justify-content: center;
  }

  .editor-layout {
    display: grid;
    grid-template-columns: 280px 1fr 300px;
    gap: 1.5rem;
    width: 100%;
    max-width: 1600px;
  }

  .asset-sidebar,
  .settings-sidebar {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
  }

  .scroll-container {
    padding: 16px;
    height: calc(100vh - 200px);
    overflow-y: auto;
  }

  .asset-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .asset-item {
    aspect-ratio: 1;
    overflow: hidden;
    background: #f1f5f9;
    cursor: grab;
    position: relative;
    transition: all 0.2s;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
  }

  .asset-item:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .asset-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .asset-item .overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 217, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #111;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .asset-item:hover .overlay {
    opacity: 1;
  }

  .upload-zone {
    border: 3px dashed #111;
    padding: 20px;
    text-align: center;
    margin-bottom: 16px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: #111;
    font-weight: 700;
  }

  .upload-zone:hover {
    background: #ffd900;
    border-style: solid;
  }

  .template-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .template-item {
    cursor: pointer;
    text-align: center;
    font-weight: 700;
  }

  .temp-preview {
    aspect-ratio: 1;
    background: #f1f5f9;
    padding: 8px;
    display: grid;
    gap: 4px;
    margin-bottom: 4px;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.2s;
  }

  .template-item:hover .temp-preview {
    background: #ffd900;
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .temp-slot {
    background: #cbd5e1;
  }

  .single .temp-slot {
    grid-column: 1 / -1;
    grid-row: 1 / -1;
  }

  .vertical-2 {
    grid-template-rows: 1fr 1fr;
  }

  .grid-4 {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
  }

  .sticker-icon {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .workspace {
    background: repeating-conic-gradient(#e0e0e0 0% 25%, white 0% 50%) 50% / 20px 20px;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .canvas-container {
    padding: 0;
    position: relative;
    max-width: 100%;
    max-height: 100%;
  }

  .book-canvas {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
  }

  .canvas-element {
    cursor: move;
    border: 2px solid transparent;
    transition: border 0.15s;
  }

  .canvas-element:hover {
    border-color: #ffd900;
  }

  .canvas-element.active {
    border-color: #ff4b4b;
    box-shadow: 0 0 0 3px rgba(255, 75, 75, 0.3);
  }

  .canvas-element img {
    width: 100%;
    height: auto;
    display: block;
    user-select: none;
    pointer-events: none;
  }

  .resize-handle {
    width: 14px;
    height: 14px;
    background: #ff4b4b;
    border: 3px solid #111;
    position: absolute;
    right: -7px;
    bottom: -7px;
    cursor: se-resize;
  }

  .sticker-wrapper {
    width: 100%;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .template-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .template-slot {
    pointer-events: auto;
    border: 3px dashed rgba(0, 0, 0, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .template-slot:hover {
    background: rgba(255, 217, 0, 0.2);
    border-color: #111;
  }

  .slot-hint {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1%;
    color: #111;
    font-size: 0.8rem;
    font-weight: 700;
    opacity: 0.7;
  }

  .context-toolbar {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    padding: 8px 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 6px 6px 0px #111;
    z-index: 200;
  }

  .slider-group {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    color: #111;
    font-weight: 700;
  }

  .panel-section {
    padding: 16px;
    border-bottom: 4px solid #111;
    transition: background 0.15s;
  }

  .panel-section:hover {
    background: #fffbe6;
  }

  .section-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1rem;
    font-weight: 800;
    margin-bottom: 16px;
    color: #111;
    padding-left: 12px;
    border-left: 5px solid #ffd900;
    transition:
      transform 0.1s,
      border-color 0.1s;
  }

  .panel-section:hover .section-title {
    transform: translateX(4px);
    border-left-color: #ff4b4b;
  }

  .settings-group {
    margin-bottom: 16px;
  }

  .settings-group:last-child {
    margin-bottom: 0;
  }

  .settings-group .label {
    font-size: 0.85rem;
    font-weight: 700;
    color: #111;
    margin-bottom: 8px;
  }

  .pattern-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .pattern-item {
    aspect-ratio: 1;
    cursor: pointer;
    border: 3px solid #111;
    background-size: center;
    box-shadow: 2px 2px 0px #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
  }

  .pattern-item:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .pattern-item:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px #111;
  }

  .pattern-item.active {
    border-color: #ff4b4b;
    box-shadow: 0 0 0 2px #ff4b4b;
    transform: translate(-2px, -2px);
  }

  .pattern-item.none {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 800;
    background: white;
  }

  .glass-card {
    /* Override: Neobrutalism styling applied via specific selectors instead */
    border-radius: 0;
  }

  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }

  :deep(.el-tabs__nav) {
    position: relative;
  }

  :deep(.el-tabs__header) {
    margin: 0;
    padding: 0.25rem 0.5rem;
    border-bottom: 4px solid #111;
    background: #ffd900;
  }

  :deep(.el-tabs__item) {
    font-weight: 800;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 0.95rem;
    color: #111;
    padding: 0.5rem 1.25rem !important;
    height: auto;
    line-height: 1.4;
    border: 3px solid transparent;
    transition:
      transform 0.1s,
      border-color 0.1s,
      box-shadow 0.1s,
      background 0.1s;
    position: relative;
    z-index: 1;
  }

  :deep(.el-tabs__item:hover) {
    color: #111;
    transform: translate(-2px, -2px);
    border-color: #111;
    box-shadow: 4px 4px 0px #111;
    background: #fff;
  }

  :deep(.el-tabs__item:active) {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px #111;
  }

  :deep(.el-tabs__item.is-active) {
    color: #111;
    background: #fff;
    border-color: #111;
    box-shadow: 4px 4px 0px #111;
    transform: translate(-2px, -2px);
  }

  :deep(.el-tabs__active-bar) {
    display: none;
  }

  :deep(.el-tabs__content) {
    transition: none;
  }

  :deep(.el-tab-pane) {
    animation: brutal-fade-in 0.25s ease;
  }

  @keyframes brutal-fade-in {
    0% {
      opacity: 0;
      transform: translateY(8px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .asset-sidebar,
  [data-theme='dark'] .settings-sidebar {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .workspace {
    background: #333;
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .asset-item {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .upload-zone {
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .upload-zone:hover {
    background: #b28f00;
  }
  [data-theme='dark'] .temp-preview {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .template-item:hover .temp-preview {
    background: #b28f00;
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .panel-section {
    border-bottom-color: #555;
  }
  [data-theme='dark'] .section-title {
    color: #eee;
  }
  [data-theme='dark'] .settings-group .label {
    color: #aaa;
  }
  [data-theme='dark'] .pattern-item {
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .context-toolbar {
    background: #333;
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .action-btn {
    background: #00994c;
    color: #fff;
    border-color: #eee;
  }
</style>
