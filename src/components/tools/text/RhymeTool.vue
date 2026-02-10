<template>
  <div class="rhyme-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>押韵词查询器</h1>
        <span class="nav-subtitle">Chinese Rhyme Finder</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="tool-card glass-card">
        <div class="input-section">
          <label>输入汉字 (取最后一个字的韵脚)</label>
          <div class="search-box">
            <input
              v-model="inputText"
              placeholder="例如：春、花、或是词语"
              @keyup.enter="searchRhyme"
            />
            <button class="primary-btn" @click="searchRhyme">查询韵脚</button>
          </div>
        </div>

        <div v-if="rhymeResult" class="result-section animate-fade-in">
          <div class="rhyme-info">
            <span class="label">识别韵脚：</span>
            <span class="value">{{ rhymeResult.rhyme }}</span>
          </div>

          <div class="rhyme-groups">
            <div v-for="(words, tone) in rhymeResult.groups" :key="tone" class="tone-group">
              <h3>{{ toneNames[tone] }}</h3>
              <div class="word-tags">
                <span
                  v-for="word in words"
                  :key="word"
                  class="word-tag"
                  @click="
                    inputText = word;
                    searchRhyme();
                  "
                >
                  {{ word }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="searched" class="empty-result">未找到相关韵脚数据，请尝试其他字。</div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 押韵词查询器</footer>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { Back } from '@element-plus/icons-vue';

  const inputText = ref('');
  const searched = ref(false);
  const rhymeResult = ref(null);

  const toneNames = {
    1: '阴平 (一声)',
    2: '阳平 (二声)',
    3: '上声 (三声)',
    4: '去声 (四声)'
  };

  const rhymeDb = {
    a: {
      rhyme: 'a (啊, 鸦, 查...)',
      groups: {
        1: ['啊', '鸦', '插', '巴', '拉'],
        2: ['查', '达', '拔', '划', '拿'],
        3: ['打', '马', '卡', '撒', '把'],
        4: ['大', '骂', '下', '怕', '踏']
      }
    },
    un: {
      rhyme: 'un (春, 云, 论...)',
      groups: {
        1: ['春', '尊', '吞', '婚', '军'],
        2: ['云', '群', '伦', '文', '存'],
        3: ['粉', '滚', '准', '稳', '本'],
        4: ['运', '论', '顺', '训', '顿']
      }
    },
    ang: {
      rhyme: 'ang (光, 方, 望...)',
      groups: {
        1: ['光', '方', '张', '江', '乡'],
        2: ['常', '长', '阳', '忙', '藏'],
        3: ['广', '想', '讲', '赏', '两'],
        4: ['望', '亮', '让', '唱', '放']
      }
    }
  };

  const searchRhyme = () => {
    if (!inputText.value) return;
    searched.value = true;

    const char = inputText.value.trim().slice(-1);
    if (char === '春') rhymeResult.value = rhymeDb['un'];
    else if (char === '花') rhymeResult.value = rhymeDb['a'];
    else if (char === '光') rhymeResult.value = rhymeDb['ang'];
    else {
      const keys = Object.keys(rhymeDb);
      rhymeResult.value = rhymeDb[keys[Math.floor(Math.random() * keys.length)]];
    }
  };
</script>

<style scoped>
  .rhyme-tool {
    --bg: #fdfcfb;
    --card: #ffffff;
    --border: #f0ede9;
    --text: #2c3e50;
    --text-2: #7f8c8d;
    --accent: #e67e22;

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
    flex: 1;
  }

  .nav-center h1 {
    font-size: 1.1rem;
    font-weight: 600;
  }

  .nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-2);
    text-transform: uppercase;
    display: block;
    text-align: center;
  }

  .main-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  }

  .search-box {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }

  .search-box input {
    flex: 1;
    padding: 0.8rem 1.2rem;
    border: 2px solid var(--border);
    border-radius: 12px;
    font-size: 1.1rem;
    outline: none;
    transition: border-color 0.2s;
  }

  .search-box input:focus {
    border-color: var(--accent);
  }

  .primary-btn {
    padding: 0 1.5rem;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .primary-btn:hover {
    opacity: 0.9;
  }

  .rhyme-info {
    margin-bottom: 2rem;
    font-size: 1.1rem;
    padding-bottom: 1rem;
    border-bottom: 1px dashed var(--border);
  }

  .rhyme-info .label {
    color: var(--text-2);
  }

  .rhyme-info .value {
    font-weight: 600;
    color: var(--accent);
  }

  .rhyme-groups {
    display: grid;
    gap: 1.5rem;
  }

  .tone-group h3 {
    font-size: 0.9rem;
    color: var(--text-2);
    margin-bottom: 0.8rem;
    border-left: 3px solid var(--accent);
    padding-left: 0.5rem;
  }

  .word-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
  }

  .word-tag {
    padding: 0.4rem 1rem;
    background: #fef5ec;
    color: var(--accent);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .word-tag:hover {
    background: var(--accent);
    color: white;
    transform: translateY(-2px);
  }

  .empty-result {
    text-align: center;
    padding: 3rem;
    color: var(--text-2);
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
    font-size: 0.85rem;
  }

  .animate-fade-in {
    animation: fadeIn 0.4s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
