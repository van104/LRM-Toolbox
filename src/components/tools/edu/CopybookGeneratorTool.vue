<template>
  <div class="copybook-generator-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>电子字帖生成器</h1>
        <span class="nav-subtitle">Chinese Copybook Generator</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="layout-grid">
        <aside class="side-panel glass-card">
          <h3 class="panel-title">字帖设置</h3>
          <el-form label-position="top">
            <el-form-item label="练习内容">
              <el-input
                v-model="form.content"
                type="textarea"
                :rows="4"
                placeholder="输入想要练习的文字..."
                @input="draw"
              />
            </el-form-item>
            <el-form-item label="选择字体">
              <el-select
                v-model="form.fontFamily"
                placeholder="请选择字体"
                class="w-full mb-2"
                @change="draw"
              >
                <el-option
                  v-for="font in builtInFonts"
                  :key="font.value"
                  :label="font.label"
                  :value="font.value"
                />
                <el-option
                  v-if="customFontName"
                  :label="`自定义: ${customFontName}`"
                  :value="customFontName"
                />
              </el-select>
              <el-upload
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleFontUpload"
                accept=".ttf,.otf,.woff,.woff2"
              >
                <el-button size="small" type="info" plain class="w-full"
                  >导入自定义字体 (.ttf/.otf)</el-button
                >
              </el-upload>
            </el-form-item>
            <el-form-item label="格局类型">
              <el-radio-group
                v-for="type in gridTypes"
                :key="type.value"
                v-model="form.type"
                style="margin-right: 15px"
                @change="draw"
              >
                <el-radio-button :value="type.value">{{ type.label }}</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="文字颜色">
              <el-color-picker v-model="form.fontColor" @change="draw" />
            </el-form-item>
            <el-form-item label="格线颜色">
              <el-color-picker v-model="form.gridColor" @change="draw" />
            </el-form-item>
            <el-form-item label="字迹透明度 (临摹)">
              <el-slider v-model="form.opacity" :min="0" :max="100" @input="draw" />
            </el-form-item>
            <el-divider />
            <el-button type="primary" class="w-full" @click="downloadImage">下载字帖图片</el-button>
            <el-button type="success" class="w-full mt-2" @click="printPage">预览打印</el-button>
          </el-form>
        </aside>

        <section class="preview-area glass-card">
          <div id="copybook-canvas-wrap" class="canvas-container">
            <canvas ref="canvasRef"></canvas>
          </div>
        </section>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 电子字帖生成</footer>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted, nextTick, watch } from 'vue';
  import { Back } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';

  const canvasRef = ref(null);

  const gridTypes = [
    { label: '田字格', value: 'tian' },
    { label: '米字格', value: 'mi' },
    { label: '方格', value: 'square' }
  ];

  const builtInFonts = [
    { label: '楷体 (系统)', value: '"KaiTi", "STKaiti", serif' },
    { label: '仿宋 (系统)', value: '"FangSong", "STFangsong", serif' },
    { label: '行楷 (系统)', value: '"STXingkai", cursive' },
    { label: '标准宋体', value: '"SimSun", serif' },
    { label: '黑体', value: '"SimHei", sans-serif' }
  ];

  const customFontName = ref('');

  const form = reactive({
    content: '永和九年，岁在癸丑，暮春之初，会于会稽山阴之兰亭，修禊事也。',
    type: 'mi',
    fontFamily: '"KaiTi", "STKaiti", serif',
    fontColor: '#000000',
    gridColor: '#e1a1a1',
    opacity: 15,
    fontSize: 80,
    padding: 20
  });

  const handleFontUpload = async file => {
    const rawFile = file.raw;
    if (!rawFile) return;

    if (rawFile.size > 4.5 * 1024 * 1024) {
      ElMessage.warning(
        '字体文件过大（超过4.5MB），刷新后可能无法自动保存。建议使用较小的字体文件。'
      );
    }

    const reader = new FileReader();
    reader.onload = async e => {
      const fontData = e.target.result;
      const fontName = 'CustomFont_Persistent';

      try {
        const fontFace = new FontFace(fontName, `url(${fontData})`);
        const loadedFace = await fontFace.load();
        document.fonts.add(loadedFace);

        customFontName.value = '已导入字体';
        form.fontFamily = fontName;

        localStorage.setItem('copybook_custom_font_data', fontData);
        localStorage.setItem('copybook_custom_font_name', '已导入字体');

        ElMessage.success('自定义字体加载并保存成功');
        nextTick(draw);
      } catch (err) {
        console.error(err);
        ElMessage.error('字体文件加载失败');
      }
    };
    reader.readAsDataURL(rawFile);
  };

  const draw = () => {
    const canvas = canvasRef.value;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cw = 800;
    const margin = 20;
    const gridSize = 100;
    const cols = Math.floor((cw - margin * 2) / gridSize);
    const text = form.content.replace(/\s+/g, '');
    const rows = Math.ceil(text.length / cols) || 5;

    canvas.width = cw;
    canvas.height = rows * gridSize + margin * 2;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < text.length || i < cols * 5; i++) {
      const x = margin + (i % cols) * gridSize;
      const y = margin + Math.floor(i / cols) * gridSize;

      drawGrid(ctx, x, y, gridSize, form.type, form.gridColor);

      if (text[i]) {
        drawText(ctx, text[i], x, y, gridSize);
      }
    }
  };

  const drawGrid = (ctx, x, y, size, type, color) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.setLineDash([]);

    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, size, size);

    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    if (type === 'tian' || type === 'mi') {
      ctx.beginPath();
      ctx.moveTo(x + size / 2, y);
      ctx.lineTo(x + size / 2, y + size);
      ctx.moveTo(x, y + size / 2);
      ctx.lineTo(x + size, y + size / 2);
      ctx.stroke();
    }

    if (type === 'mi') {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + size, y + size);
      ctx.moveTo(x + size, y);
      ctx.lineTo(x, y + size);
      ctx.stroke();
    }

    ctx.restore();
  };

  const drawText = (ctx, char, x, y, size) => {
    ctx.save();
    ctx.fillStyle = form.fontColor;
    ctx.globalAlpha = form.opacity / 100;
    ctx.font = `${form.fontSize}px ${form.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, x + size / 2, y + size / 2 + 5);
    ctx.restore();
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.download = '字帖.png';
    link.href = canvasRef.value.toDataURL('image/png');
    link.click();
    ElMessage.success('字帖图片已导出');
  };

  const printPage = () => {
    window.print();
  };

  onMounted(() => {
    const savedFontData = localStorage.getItem('copybook_custom_font_data');
    const savedFontName = localStorage.getItem('copybook_custom_font_name');

    if (savedFontData) {
      const fontName = 'CustomFont_Persistent';
      const fontFace = new FontFace(fontName, `url(${savedFontData})`);
      fontFace
        .load()
        .then(loadedFace => {
          document.fonts.add(loadedFace);
          customFontName.value = savedFontName;

          const lastFont = localStorage.getItem('copybook_last_font_family');
          if (lastFont === fontName) {
            form.fontFamily = fontName;
          }
          draw();
        })
        .catch(err => console.error('恢复字体失败', err));
    }

    nextTick(draw);
  });

  watch(
    () => form.fontFamily,
    newVal => {
      localStorage.setItem('copybook_last_font_family', newVal);
    }
  );
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600&family=Noto+Sans+SC:wght@400;500;600&display=swap');

  .copybook-generator-tool {
    --bg: #fafafa;
    --card: #ffffff;
    --border: #e8e8e8;
    --text: #333333;
    --text-2: #666666;
    --primary: #c04848;

    font-family: 'Noto Sans SC', sans-serif;
    min-height: 100vh;
    background: var(--bg);
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: var(--card);
    border-bottom: 1px solid var(--border);
  }

  .nav-back,
  .nav-spacer {
    width: 80px;
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--text-2);
    cursor: pointer;
    font-size: 0.9rem;
  }

  .nav-center {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
  }

  .nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-2);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  .layout-grid {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 2rem;
  }

  .glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
  }

  .panel-title {
    font-size: 1rem;
    margin-bottom: 1.5rem;
    font-weight: 600;
  }

  .preview-area {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    background: #f0f0f0;
    min-height: 800px;
    background-image: radial-gradient(#d1d1d1 1px, transparent 1px);
    background-size: 40px 40px;
  }

  .canvas-container {
    padding: 40px;
    background: #fff;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  .w-full {
    width: 100% !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    display: block;
  }

  .mt-2 {
    margin-top: 0.75rem !important;
  }

  .mt-4 {
    margin-top: 1.5rem !important;
  }

  .mb-2 {
    margin-bottom: 0.75rem !important;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
    margin-top: 2rem;
  }

  @media print {
    .nav-bar,
    .side-panel,
    .footer {
      display: none;
    }

    .main-content {
      padding: 0;
    }

    .preview-area {
      background: none;
    }

    .canvas-container {
      box-shadow: none;
      padding: 0;
    }
  }

  @media (max-width: 800px) {
    .layout-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
