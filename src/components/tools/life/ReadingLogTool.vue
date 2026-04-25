<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">阅读<span>.记录本()</span></h1>
        <div style="width: 120px"></div>
      </header>

      <div class="brutal-grid main-layout">
        <!-- 左侧：书籍列表 -->
        <div class="brutal-pane main-pane">
          <div class="pane-header bg-yellow">
            <span>📚 我的书架</span>
            <div class="pane-actions">
              <button :class="{ active: filter === 'all' }" @click="filter = 'all'">全部</button>
              <button :class="{ active: filter === 'reading' }" @click="filter = 'reading'">
                在读
              </button>
              <button :class="{ active: filter === 'finished' }" @click="filter = 'finished'">
                已读
              </button>
              <button :class="{ active: filter === 'wishlist' }" @click="filter = 'wishlist'">
                想读
              </button>
            </div>
          </div>

          <!-- 添加书籍 -->
          <div class="add-form">
            <div class="form-row">
              <input v-model="form.title" class="brutal-input" placeholder="书名" />
              <input v-model="form.author" class="brutal-input" placeholder="作者" />
            </div>
            <div class="form-row">
              <input
                v-model.number="form.totalPages"
                type="number"
                class="brutal-input"
                placeholder="总页数"
                min="1"
              />
              <select v-model="form.status" class="brutal-select">
                <option value="wishlist">想读</option>
                <option value="reading">在读</option>
                <option value="finished">已读</option>
              </select>
              <button class="brutal-action-btn primary" @click="addBook">+ 添加</button>
            </div>
          </div>

          <!-- 统计 -->
          <div class="summary-cards">
            <div class="summary-card">
              <div class="label">总藏书</div>
              <div class="amount">{{ books.length }}</div>
            </div>
            <div class="summary-card reading">
              <div class="label">在读</div>
              <div class="amount">{{ readingCount }}</div>
            </div>
            <div class="summary-card finished">
              <div class="label">已读完</div>
              <div class="amount">{{ finishedCount }}</div>
            </div>
          </div>

          <!-- 书籍列表 -->
          <div class="books-list">
            <div v-for="book in filteredBooks" :key="book.id" class="book-card">
              <div class="book-cover" :style="{ background: getRandomColor(book.id) }">
                {{ book.title.charAt(0) }}
              </div>
              <div class="book-info">
                <div class="book-title">{{ book.title }}</div>
                <div class="book-author">{{ book.author || '未知作者' }}</div>
                <div v-if="book.status !== 'wishlist'" class="book-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: getProgress(book) + '%' }"></div>
                  </div>
                  <span class="progress-text"
                    >{{ book.currentPage || 0 }}/{{ book.totalPages || '?' }}页 ({{
                      getProgress(book)
                    }}%)</span
                  >
                </div>
                <div v-if="book.rating" class="book-rating">
                  <span v-for="i in 5" :key="i" :class="{ filled: i <= book.rating }">★</span>
                </div>
              </div>
              <div class="book-status" :class="book.status">
                {{ getStatusText(book.status) }}
              </div>
              <div class="book-actions">
                <button
                  v-if="book.status === 'reading'"
                  class="update-btn"
                  @click="updateProgress(book)"
                >
                  更新进度
                </button>
                <button
                  v-if="book.status === 'reading'"
                  class="finish-btn"
                  @click="markFinished(book)"
                >
                  读完
                </button>
                <button class="note-btn" @click="openNotes(book)">📝</button>
                <button class="del-btn" @click="deleteBook(book.id)">✕</button>
              </div>
            </div>
            <div v-if="filteredBooks.length === 0" class="empty-item">暂无书籍记录</div>
          </div>
        </div>

        <!-- 右侧：笔记和统计 -->
        <div class="brutal-pane side-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">📖 读书笔记</span>
          </div>
          <div v-if="selectedBook" class="notes-section">
            <div class="selected-book-title">{{ selectedBook.title }}</div>
            <textarea
              v-model="selectedBook.notes"
              class="notes-textarea"
              placeholder="记录读书心得、摘抄..."
              @input="saveNotes"
            ></textarea>
            <div class="rating-row">
              <span>评分：</span>
              <span
                v-for="i in 5"
                :key="i"
                class="star"
                :class="{ filled: i <= (selectedBook.rating || 0) }"
                @click="setRating(i)"
                >★</span
              >
            </div>
          </div>
          <div v-else class="notes-section empty">
            <div class="empty-notes">选择一本书查看/编辑笔记</div>
          </div>

          <div class="pane-header bg-dark" style="margin-top: 1rem">
            <span class="text-white">📊 阅读统计</span>
          </div>
          <div class="stats-section">
            <div class="stat-item">
              <span class="stat-value">{{ totalPagesRead }}</span>
              <span class="stat-label">总页数</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ avgRating }}</span>
              <span class="stat-label">平均评分</span>
            </div>
          </div>

          <div class="pane-header bg-green" style="margin-top: 1rem">
            <span>🏆 阅读目标</span>
          </div>
          <div class="goal-section">
            <div class="goal-input">
              <span>今年目标：</span>
              <input
                v-model.number="yearlyGoal"
                type="number"
                class="goal-num"
                min="1"
                @change="saveGoal"
              />
              <span>本</span>
            </div>
            <div class="goal-progress">
              <div class="goal-bar">
                <div class="goal-fill" :style="{ width: Math.min(goalProgress, 100) + '%' }"></div>
              </div>
              <span class="goal-text"
                >{{ finishedThisYear }}/{{ yearlyGoal }}本 ({{ goalProgress.toFixed(0) }}%)</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="brutal-status info">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i"
              >© 2026 LRM工具箱 - 阅读记录本 // 数据本地存储 // &nbsp;</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 进度更新弹窗 -->
    <div v-if="updatingBook" class="modal-overlay" @click.self="updatingBook = null">
      <div class="modal-content">
        <div class="modal-header">
          <span>更新阅读进度</span>
          <button @click="updatingBook = null">✕</button>
        </div>
        <div class="modal-body">
          <div class="book-title-lg">{{ updatingBook.title }}</div>
          <div class="progress-update">
            <span>当前页码：</span>
            <input
              v-model.number="progressPage"
              type="number"
              class="brutal-input"
              min="0"
              :max="updatingBook.totalPages"
            />
            <span>/ {{ updatingBook.totalPages || '?' }}页</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="brutal-action-btn" @click="updatingBook = null">取消</button>
          <button class="brutal-action-btn primary" @click="saveProgress">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { ElMessage } from 'element-plus';

  const STORAGE_KEY = 'lrm_reading_books';
  const GOAL_KEY = 'lrm_reading_goal';

  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#F7D794',
    '#778BEB',
    '#786FA6'
  ];

  const form = ref({ title: '', author: '', totalPages: null, status: 'wishlist' });
  const books = ref([]);
  const filter = ref('all');
  const selectedBook = ref(null);
  const updatingBook = ref(null);
  const progressPage = ref(0);
  const yearlyGoal = ref(12);

  const loadBooks = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) books.value = JSON.parse(data);
    const goal = localStorage.getItem(GOAL_KEY);
    if (goal) yearlyGoal.value = Number(goal);
  };

  const saveBooks = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(books.value));
  const saveGoal = () => localStorage.setItem(GOAL_KEY, yearlyGoal.value.toString());

  const addBook = () => {
    if (!form.value.title.trim()) {
      ElMessage.warning('请输入书名');
      return;
    }

    books.value.unshift({
      id: Date.now(),
      title: form.value.title.trim(),
      author: form.value.author.trim(),
      totalPages: form.value.totalPages || null,
      currentPage: 0,
      status: form.value.status,
      rating: null,
      notes: '',
      finishedDate: null,
      createdAt: new Date().toISOString()
    });

    saveBooks();
    ElMessage.success('添加成功');
    form.value = { title: '', author: '', totalPages: null, status: 'wishlist' };
  };

  const deleteBook = id => {
    books.value = books.value.filter(b => b.id !== id);
    if (selectedBook.value?.id === id) selectedBook.value = null;
    saveBooks();
    ElMessage.success('已删除');
  };

  const updateProgress = book => {
    updatingBook.value = book;
    progressPage.value = book.currentPage || 0;
  };

  const saveProgress = () => {
    if (updatingBook.value) {
      updatingBook.value.currentPage = Math.min(
        progressPage.value,
        updatingBook.value.totalPages || progressPage.value
      );
      if (updatingBook.value.totalPages && progressPage.value >= updatingBook.value.totalPages) {
        updatingBook.value.status = 'finished';
        updatingBook.value.finishedDate = new Date().toISOString();
        ElMessage.success('恭喜读完这本书！');
      }
      saveBooks();
    }
    updatingBook.value = null;
  };

  const markFinished = book => {
    book.status = 'finished';
    book.currentPage = book.totalPages;
    book.finishedDate = new Date().toISOString();
    saveBooks();
    ElMessage.success('恭喜读完！');
  };

  const openNotes = book => {
    selectedBook.value = book;
  };

  const saveNotes = () => {
    saveBooks();
  };

  const setRating = rating => {
    if (selectedBook.value) {
      selectedBook.value.rating = rating;
      saveBooks();
    }
  };

  const getProgress = book => {
    if (!book.totalPages) return 0;
    return Math.round(((book.currentPage || 0) / book.totalPages) * 100);
  };

  const getStatusText = status => {
    const map = { wishlist: '想读', reading: '在读', finished: '已读' };
    return map[status] || status;
  };

  const getRandomColor = id => colors[id % colors.length];

  const readingCount = computed(() => books.value.filter(b => b.status === 'reading').length);
  const finishedCount = computed(() => books.value.filter(b => b.status === 'finished').length);
  const totalPagesRead = computed(() =>
    books.value.reduce((sum, b) => sum + (b.currentPage || 0), 0)
  );
  const avgRating = computed(() => {
    const rated = books.value.filter(b => b.rating);
    if (rated.length === 0) return '-';
    return (rated.reduce((sum, b) => sum + b.rating, 0) / rated.length).toFixed(1);
  });

  const finishedThisYear = computed(() => {
    const year = new Date().getFullYear();
    return books.value.filter(b => {
      if (b.status !== 'finished' || !b.finishedDate) return false;
      return new Date(b.finishedDate).getFullYear() === year;
    }).length;
  });

  const goalProgress = computed(() =>
    yearlyGoal.value > 0 ? (finishedThisYear.value / yearlyGoal.value) * 100 : 0
  );

  const filteredBooks = computed(() => {
    if (filter.value === 'all') return books.value;
    return books.value.filter(b => b.status === filter.value);
  });

  watch(selectedBook, () => {}, { deep: true });

  onMounted(loadBooks);
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
    padding: 2rem;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
  }

  .brutal-container {
    max-width: 1200px;
    margin: 0 auto;
  }
  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #ffd900;
  }
  .brutal-title span {
    color: #ffd900;
    text-shadow: 4px 4px 0px #111;
  }

  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }

  .main-layout {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 2.5rem;
    margin-bottom: 2.5rem;
  }

  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    transition: transform 0.2s;
    display: flex;
    flex-direction: column;
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
    font-size: 1.15rem;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #4b7bff;
  }
  .bg-dark {
    background: #111;
  }
  .bg-green {
    background: #00e572;
  }
  .text-white {
    color: #fff;
  }

  .pane-actions {
    display: flex;
    gap: 0.5rem;
  }
  .pane-actions button {
    background: #fff;
    border: 3px solid #111;
    padding: 0.35rem 0.75rem;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }
  .pane-actions button.active {
    background: #00e572;
    box-shadow: 0 0 0 #111;
    transform: translate(2px, 2px);
  }

  .add-form {
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
  }
  .form-row {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    align-items: center;
  }

  .brutal-input {
    flex: 1;
    border: 3px solid #111;
    padding: 0.6rem 0.8rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 0.95rem;
    background: #fff;
    box-shadow: 3px 3px 0px #111;
    outline: none;
  }

  .brutal-select {
    flex: 1;
    border: 3px solid #111;
    padding: 0.6rem 0.8rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    background: #fff;
    box-shadow: 3px 3px 0px #111;
    cursor: pointer;
  }

  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem 1.2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }
  .brutal-action-btn.primary {
    background: #00e572;
  }
  .brutal-action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .summary-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
  }
  .summary-card {
    text-align: center;
    padding: 1rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    background: #fff;
  }
  .summary-card.reading {
    background: #d4f8ff;
  }
  .summary-card.finished {
    background: #d4f8d4;
  }
  .summary-card .label {
    font-size: 0.85rem;
    font-weight: 600;
  }
  .summary-card .amount {
    font-size: 1.5rem;
    font-weight: 800;
    font-family: 'Syne', sans-serif;
  }

  .books-list {
    padding: 1rem 1.5rem;
    flex: 1;
    overflow-y: auto;
    max-height: 380px;
  }

  .book-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    margin-bottom: 0.75rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }
  .book-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .book-cover {
    width: 48px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 800;
    color: #fff;
    border: 3px solid #111;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  }

  .book-info {
    flex: 1;
  }
  .book-title {
    font-weight: 800;
    font-size: 1rem;
    font-family: 'Syne', sans-serif;
  }
  .book-author {
    font-size: 0.85rem;
    color: #666;
  }
  .book-progress {
    margin-top: 0.5rem;
  }
  .progress-bar {
    height: 8px;
    background: #eee;
    border: 2px solid #111;
    margin-bottom: 0.25rem;
  }
  .progress-fill {
    height: 100%;
    background: #00e572;
    transition: width 0.3s;
  }
  .progress-text {
    font-size: 0.75rem;
    color: #666;
  }
  .book-rating {
    margin-top: 0.25rem;
  }
  .book-rating span {
    color: #ddd;
    font-size: 0.9rem;
  }
  .book-rating span.filled {
    color: #ffd900;
  }

  .book-status {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 800;
    border: 2px solid #111;
  }
  .book-status.wishlist {
    background: #fff4d4;
  }
  .book-status.reading {
    background: #d4f8ff;
  }
  .book-status.finished {
    background: #d4f8d4;
  }

  .book-actions {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .update-btn,
  .finish-btn,
  .note-btn,
  .del-btn {
    background: #fff;
    border: 2px solid #111;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
  }
  .update-btn {
    background: #89b4f8;
  }
  .finish-btn {
    background: #00e572;
  }
  .note-btn {
    background: #ffd900;
  }
  .del-btn {
    background: #ff4b4b;
    color: #fff;
  }
  .update-btn:hover,
  .finish-btn:hover,
  .note-btn:hover,
  .del-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }

  .empty-item {
    text-align: center;
    padding: 2rem;
    color: #999;
    font-weight: 600;
  }

  .notes-section {
    padding: 1rem;
  }
  .notes-section.empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 150px;
  }
  .empty-notes {
    color: #999;
    text-align: center;
  }
  .selected-book-title {
    font-weight: 800;
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
    font-family: 'Syne', sans-serif;
  }
  .notes-textarea {
    width: 100%;
    height: 120px;
    border: 3px solid #111;
    padding: 0.75rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.9rem;
    background: #fff;
    box-shadow: 3px 3px 0px #111;
    resize: vertical;
    outline: none;
  }
  .rating-row {
    margin-top: 0.75rem;
  }
  .rating-row span {
    font-size: 1.2rem;
  }
  .star {
    cursor: pointer;
    color: #ddd;
    transition: color 0.1s;
  }
  .star.filled {
    color: #ffd900;
  }
  .star:hover {
    color: #ffdb4d;
  }

  .stats-section {
    display: flex;
    padding: 1rem;
    gap: 1rem;
  }
  .stat-item {
    flex: 1;
    text-align: center;
    padding: 1rem;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
  }
  .stat-value {
    font-size: 1.5rem;
    font-weight: 800;
    font-family: 'Syne', sans-serif;
  }
  .stat-label {
    font-size: 0.85rem;
    color: #666;
  }

  .goal-section {
    padding: 1rem;
  }
  .goal-input {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
  .goal-num {
    width: 60px;
    border: 3px solid #111;
    padding: 0.4rem;
    font-weight: 700;
    text-align: center;
    box-shadow: 2px 2px 0px #111;
  }
  .goal-progress {
  }
  .goal-bar {
    height: 16px;
    background: #eee;
    border: 3px solid #111;
    margin-bottom: 0.5rem;
  }
  .goal-fill {
    height: 100%;
    background: #00e572;
    transition: width 0.3s;
  }
  .goal-text {
    font-size: 0.85rem;
    font-weight: 600;
  }

  .brutal-status {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    padding: 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
    overflow: hidden;
    text-transform: uppercase;
  }
  .marquee-wrapper {
    width: 100%;
    overflow: hidden;
  }
  .marquee-content {
    display: inline-block;
    white-space: nowrap;
    animation: marquee 20s linear infinite;
  }
  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  .modal-content {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    width: 400px;
    max-width: 90vw;
  }
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #ffd900;
    border-bottom: 4px solid #111;
    font-weight: 800;
  }
  .modal-header button {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
  }
  .modal-body {
    padding: 1.5rem;
  }
  .book-title-lg {
    font-size: 1.2rem;
    font-weight: 800;
    margin-bottom: 1rem;
    font-family: 'Syne', sans-serif;
  }
  .progress-update {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .progress-update .brutal-input {
    width: 80px;
  }
  .modal-footer {
    display: flex;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-top: 4px solid #111;
  }
  .modal-footer .brutal-action-btn {
    flex: 1;
    text-align: center;
  }

  @media (max-width: 1024px) {
    .main-layout {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2rem;
    }
    .brutal-header {
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
  }

  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-select,
  [data-theme='dark'] .modal-content,
  [data-theme='dark'] .notes-textarea {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .pane-actions button {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .summary-card {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
    background: #222;
  }
  [data-theme='dark'] .book-card {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .book-cover {
    border-color: #eee;
  }
  [data-theme='dark'] .progress-bar {
    border-color: #eee;
  }
  [data-theme='dark'] .book-status {
    border-color: #eee;
  }
  [data-theme='dark'] .stat-item {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .goal-num {
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
    background: #222;
    color: #eee;
  }
  [data-theme='dark'] .goal-bar {
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-status {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-green {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .modal-header {
    background: #b28f00;
    border-bottom-color: #eee;
    color: #fff;
  }
  [data-theme='dark'] .modal-footer {
    border-top-color: #eee;
  }
</style>
