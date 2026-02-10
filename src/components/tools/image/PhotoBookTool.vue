<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon>
            <ArrowLeft />
          </el-icon>
          <span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">照片书制作</h1>
        <span class="tool-subtitle">PHOTO BOOK MAKER</span>
      </div>
      <div class="header-right">
        <el-button-group>
          <el-button type="primary" :loading="exporting" @click="exportBook">
            <el-icon>
              <Download />
            </el-icon>
            导出画册页
          </el-button>
        </el-button-group>
      </div>
    </header>

    <main class="tool-content">
      <div class="editor-layout">
        <aside class="asset-sidebar glass-card">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="图片" name="photos">
              <div class="scroll-container">
                <div class="upload-zone" @click="triggerUpload">
                  <el-icon :size="24">
                    <Plus />
                  </el-icon>
                  <span>添加照片</span>
                  <input
                    ref="fileRef"
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    @change="handleUpload"
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
              <el-slider v-model="selectedItem.rotation" :min="0" :max="360" style="width: 80px" />
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

    <footer class="footer">© 2026 LRM工具箱 - 照片书制作</footer>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import {
    ArrowLeft,
    Download,
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
  const goBack = () => router.back();

  const activeTab = ref('photos');
  const fileRef = ref(null);
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

  const triggerUpload = () => fileRef.value.click();

  const handleUpload = e => {
    const files = e.target.files;
    for (let file of files) {
      const url = URL.createObjectURL(file);
      userPhotos.value.push(url);
    }
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
  .tool-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f8fafc;
  }

  .tool-header {
    height: 64px;
    background: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    border-bottom: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-center {
    text-align: center;
  }

  .tool-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
  }

  .tool-subtitle {
    font-size: 0.75rem;
    color: #94a3b8;
    letter-spacing: 2px;
  }

  .tool-content {
    flex: 1;
    padding: 24px;
    display: flex;
    justify-content: center;
  }

  .editor-layout {
    display: grid;
    grid-template-columns: 280px 1fr 300px;
    gap: 24px;
    width: 100%;
    max-width: 1440px;
  }

  .asset-sidebar,
  .settings-sidebar {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .scroll-container {
    padding: 16px;
    height: calc(100vh - 250px);
    overflow-y: auto;
  }

  .asset-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .asset-item {
    aspect-ratio: 1;
    border-radius: 8px;
    overflow: hidden;
    background: #f1f5f9;
    cursor: grab;
    position: relative;
    transition: all 0.2s;
  }

  .asset-item:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .asset-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .asset-item .overlay {
    position: absolute;
    inset: 0;
    background: rgba(59, 130, 246, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .asset-item:hover .overlay {
    opacity: 1;
  }

  .upload-zone {
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    margin-bottom: 16px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: #64748b;
  }

  .upload-zone:hover {
    border-color: #3b82f6;
    background: #eff6ff;
    color: #3b82f6;
  }

  .template-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .template-item {
    cursor: pointer;
    text-align: center;
  }

  .temp-preview {
    aspect-ratio: 1;
    background: #f1f5f9;
    border-radius: 8px;
    padding: 8px;
    display: grid;
    gap: 4px;
    margin-bottom: 4px;
    border: 2px solid transparent;
    transition: border 0.3s;
  }

  .template-item:hover .temp-preview {
    border-color: #3b82f6;
  }

  .temp-slot {
    background: #cbd5e1;
    border-radius: 2px;
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
    background: #e2e8f0;
    border-radius: 16px;
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
    border: 1px solid transparent;
    transition: border 0.2s;
  }

  .canvas-element:hover {
    border-color: rgba(59, 130, 246, 0.5);
  }

  .canvas-element.active {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }

  .canvas-element img {
    width: 100%;
    height: auto;
    display: block;
    user-select: none;
    pointer-events: none;
  }

  .resize-handle {
    width: 12px;
    height: 12px;
    background: #3b82f6;
    border: 2px solid white;
    border-radius: 50%;
    position: absolute;
    right: -6px;
    bottom: -6px;
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
    border: 2px dashed rgba(59, 130, 246, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
  }

  .template-slot:hover {
    background: rgba(59, 130, 246, 0.1);
    border-color: #3b82f6;
  }

  .slot-hint {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1%;
    color: #3b82f6;
    font-size: 0.8rem;
    opacity: 0.6;
  }

  .context-toolbar {
    position: absolute;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    padding: 8px 16px;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .slider-group {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    color: #64748b;
  }

  .panel-section {
    padding: 20px;
    border-bottom: 1px solid #e2e8f0;
  }

  .section-title {
    font-size: 0.95rem;
    font-weight: 700;
    margin-bottom: 16px;
    color: #1e293b;
  }

  .settings-group {
    margin-bottom: 16px;
  }

  .settings-group:last-child {
    margin-bottom: 0;
  }

  .settings-group .label {
    font-size: 0.85rem;
    font-weight: 500;
    color: #64748b;
    margin-bottom: 8px;
  }

  .pattern-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .pattern-item {
    aspect-ratio: 1;
    border-radius: 4px;
    cursor: pointer;
    border: 2px solid transparent;
    background-size: center;
  }

  .pattern-item.active {
    border-color: #3b82f6;
  }

  .pattern-item.none {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.65rem;
    background: white;
    border: 1px solid #e2e8f0;
  }

  .footer {
    padding: 1rem;
    text-align: center;
    font-size: 0.85rem;
    color: #94a3b8;
    background: white;
  }

  .glass-card {
    background: white;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
  }

  :deep(.el-tabs__item) {
    font-weight: 600;
  }
</style>
