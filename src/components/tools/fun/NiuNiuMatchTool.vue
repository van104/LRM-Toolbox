<template>
  <div
    class="bg-gray-50 min-h-screen flex flex-col items-center justify-start font-sans select-none overflow-hidden touch-none sm:touch-auto relative"
  >
    <button
      class="absolute left-4 top-4 z-[99] p-2 bg-white/80 rounded-full shadow-md text-gray-700 hover:bg-white flex items-center gap-2"
      @click="$router.back()"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span class="font-bold text-sm pr-1">退出</span>
    </button>
    <div v-if="!grid.length"></div>
    <template v-else>
      <div v-if="isInMenu" class="w-full max-w-md px-4 py-8 flex flex-col items-center gap-6 z-10">
        <div class="flex items-center justify-between w-full">
          <div
            class="flex items-center gap-2 bg-yellow-100 rounded-full px-3 py-1 text-sm font-bold text-yellow-600 shadow-sm"
          >
            <span class="text-yellow-500 mr-1">🪙</span> {{ coins }}
          </div>
          <button
            class="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors active:scale-95"
            @click="openSettingsModal"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
              ></path>
            </svg>
          </button>
        </div>
        <div class="text-3xl font-black text-gray-800 tracking-wider">小牛谜局</div>
        <div class="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div class="text-sm font-semibold text-gray-600 mb-3">关卡选择</div>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="(_, index) in LEVELS"
              :key="`level-${index}`"
              :class="[
                'py-2 rounded-xl font-bold transition-all',
                selectedLevelIndex === index
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                  : 'bg-gray-100 text-gray-600'
              ]"
              @click="selectedLevelIndex = index"
            >
              {{ index + 1 }} 关
            </button>
          </div>
        </div>
        <button
          class="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-lg active:scale-95 transition-all shadow-md shadow-blue-500/30"
          @click="startGame"
        >
          开始游戏
        </button>
      </div>
      <template v-else>
        <div class="w-full max-w-md px-4 py-4 flex items-center justify-between z-10">
          <div class="flex items-center gap-2">
            <button
              class="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors active:scale-95"
              @click="openSettingsModal"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path
                  d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
                ></path>
              </svg>
            </button>
            <div
              class="flex items-center bg-yellow-100 rounded-full px-3 py-1 text-sm font-bold text-yellow-600 shadow-sm"
            >
              <span class="text-yellow-500 mr-1">🪙</span> {{ coins }}
            </div>
          </div>
          <h1 class="text-xl font-bold text-gray-700 tracking-wider">
            第 <span>{{ currentLevelIndex + 1 }}</span> 关
          </h1>
          <div class="w-10"></div>
        </div>
        <div
          class="bg-indigo-50 px-4 py-1.5 rounded-full flex gap-1 mb-4 shadow-sm border border-indigo-100"
        >
          <span
            v-for="i in [1, 2, 3]"
            :key="i"
            :class="[
              'text-lg transition-all duration-300',
              i <= health ? 'text-red-500 scale-100' : 'text-gray-300 scale-75 opacity-50'
            ]"
          >
            {{ i <= health ? '❤️' : '🤍' }}
          </span>
        </div>
        <div class="w-full max-w-md px-4 mb-4 z-10">
          <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div
              class="flex justify-between text-xs text-gray-600 font-medium text-center divide-x divide-gray-100 items-center"
            >
              <div class="flex-1 px-1">每行每列只允许<br />存在一头牛</div>
              <div class="flex-1 px-1">
                每种颜色 1 头牛<br /><span class="text-[10px] text-red-400">双击生成小牛</span>
              </div>
              <div class="flex-1 px-1">小牛不能相邻<br /></div>
            </div>
            <div class="mt-3 flex justify-center">
              <div
                class="bg-gray-50 px-4 py-1.5 rounded-full inline-flex items-center gap-2 shadow-inner border border-gray-100"
              >
                <span class="text-lg">🐮</span>
                <span class="text-sm font-semibold text-gray-600">
                  剩余小牛:
                  <span :class="remainingCount < 0 ? 'text-red-500' : 'text-blue-500'">{{
                    remainingCount
                  }}</span>
                  / <span>{{ size }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="w-full max-w-sm px-4 perspective-1000 z-10">
          <div
            class="bg-white p-2 rounded-2xl shadow-lg border border-gray-100 aspect-square w-full"
          >
            <div
              class="grid gap-1 w-full h-full"
              :style="{
                gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
                touchAction: 'none'
              }"
              @pointerdown="onPointerDown"
              @pointermove="onPointerMove"
            >
              <template v-for="(row, r) in grid" :key="`row-${r}`">
                <template v-for="(cell, c) in row" :key="`${r}-${c}`">
                  <div
                    :data-r="r"
                    :data-c="c"
                    :class="[
                      'relative rounded-xl shadow-sm cursor-pointer transition-all duration-200 ease-out flex items-center justify-center hover:brightness-95 active:scale-90',
                      regionColor(r, c),
                      isMistake(r, c) ? 'ring-4 ring-red-400 z-10 animate-error shadow-red-200' : ''
                    ]"
                  >
                    <div
                      v-if="cell === 1"
                      :class="[fontSize, 'filter drop-shadow-md animate-pop pointer-events-none']"
                    >
                      🐮
                    </div>
                    <div
                      v-else-if="cell === 2"
                      class="text-white/80 animate-pop pointer-events-none"
                    >
                      <svg viewBox="0 0 24 24" :class="svgSize">
                        <path
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                          d="M6 6l12 12m0-12L6 18"
                        />
                      </svg>
                    </div>
                  </div>
                </template>
              </template>
            </div>
          </div>
        </div>
        <div class="w-full max-w-md mt-auto mb-8 px-8 flex justify-between items-end z-10">
          <button
            class="flex flex-col items-center justify-center w-16 h-16 bg-gray-200 text-gray-500 rounded-2xl hover:bg-gray-300 active:scale-95 transition-all shadow-sm"
            @click="loadLevel(currentLevelIndex)"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            <span class="text-xs mt-1 font-medium">重新开始</span>
          </button>
          <div class="flex gap-4">
            <button
              :class="[
                'relative flex flex-col items-center justify-center w-20 h-24 rounded-3xl shadow-lg hover:-translate-y-1 active:scale-95 transition-all border group',
                cowToolCount > 0 ? 'bg-white border-gray-100' : 'bg-gray-100 border-gray-200'
              ]"
              @click="handleCowTool"
            >
              <div class="text-4xl mb-2 group-hover:scale-110 transition-transform">🐮</div>
              <div
                :class="[
                  'absolute bottom-0 w-full text-white text-xs font-bold py-1.5 rounded-b-3xl text-center',
                  cowToolCount > 0 ? 'bg-blue-500' : 'bg-gray-400'
                ]"
              >
                {{ cowToolCount > 0 ? cowToolCount : '+' }}
              </div>
            </button>
            <button
              class="relative flex flex-col items-center justify-center w-20 h-24 bg-white rounded-3xl shadow-lg hover:-translate-y-1 active:scale-95 transition-all border border-gray-100 group"
              @click="handleHint"
            >
              <div class="text-yellow-400 mb-2 group-hover:scale-110 transition-transform">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path
                    d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"
                  ></path>
                  <path d="M9 18h6"></path>
                  <path d="M10 22h4"></path>
                </svg>
              </div>
              <div
                :class="[
                  'absolute bottom-0 w-full text-white text-xs font-bold py-1.5 rounded-b-3xl text-center',
                  hintCount > 0 ? 'bg-blue-500' : 'bg-gray-400'
                ]"
              >
                {{ hintCount > 0 ? hintCount : '+' }}
              </div>
            </button>
          </div>
        </div>
      </template>
      <div
        v-if="isWon"
        class="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-pop"
      >
        <div
          class="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-xs w-full"
        >
          <div class="text-6xl mb-4 animate-bounce">🎉</div>
          <h2 class="text-2xl font-black text-gray-800 mb-2">太棒了！</h2>
          <p class="text-gray-500 mb-6 font-medium">
            {{
              currentLevelIndex === LEVELS.length - 1
                ? '太强了！你已通关所有难度！'
                : '你成功解开了这一关'
            }}
          </p>
          <button
            class="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-lg active:scale-95 transition-all shadow-md shadow-blue-500/30"
            @click="handleNextLevel"
          >
            {{ currentLevelIndex === LEVELS.length - 1 ? '重新挑战' : '下一关' }}
          </button>
        </div>
      </div>
      <div
        v-if="isGameOver"
        class="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-pop"
      >
        <div
          class="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-xs w-full"
        >
          <div class="text-6xl mb-4">💔</div>
          <h2 class="text-2xl font-black text-red-600 mb-2">挑战失败</h2>
          <p class="text-gray-500 mb-6 font-medium">血量耗尽，请重新尝试</p>
          <button
            class="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-lg active:scale-95 transition-all shadow-md shadow-red-500/30"
            @click="loadLevel(currentLevelIndex)"
          >
            重新开始
          </button>
        </div>
      </div>
      <div
        v-if="activeModal"
        class="absolute inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center animate-pop"
      >
        <div
          class="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-xs w-full"
        >
          <template v-if="activeModal.type === 'hint'">
            <div
              class="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center text-3xl mb-3"
            >
              💡
            </div>
            <div class="w-64 h-64 mb-6">
              <div
                class="grid gap-1 w-full h-full"
                :style="{
                  gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`
                }"
              >
                <template v-for="(row, r) in grid" :key="`hint-row-${r}`">
                  <template v-for="(cell, c) in row" :key="`hint-${r}-${c}`">
                    <div
                      :class="[
                        'relative rounded-md flex items-center justify-center',
                        regionColor(r, c),
                        r === activeModal.r || c === activeModal.c
                          ? r === activeModal.r && c === activeModal.c
                            ? 'ring-2 ring-red-500'
                            : 'ring-1 ring-red-300'
                          : ''
                      ]"
                    >
                      <div
                        v-if="r === activeModal.r || c === activeModal.c"
                        :class="[
                          'absolute inset-0 rounded-md pointer-events-none',
                          r === activeModal.r && c === activeModal.c
                            ? 'bg-red-200/35'
                            : 'bg-red-100/25'
                        ]"
                      ></div>
                      <svg
                        v-if="
                          r !== activeModal.r && c !== activeModal.c && cell !== 1 && cell !== 2
                        "
                        viewBox="0 0 24 24"
                        class="w-4 h-4 text-red-500/70"
                      >
                        <path
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                          d="M6 6l12 12m0-12L6 18"
                        />
                      </svg>
                      <div
                        v-if="r === activeModal.r && c === activeModal.c && cell !== 1"
                        class="text-base text-red-500/90"
                      >
                        🐮
                      </div>
                      <div v-if="cell === 1" class="text-base">🐮</div>
                      <svg v-if="cell === 2" viewBox="0 0 24 24" class="w-4 h-4 text-white/80">
                        <path
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                          d="M6 6l12 12m0-12L6 18"
                        />
                      </svg>
                    </div>
                  </template>
                </template>
              </div>
            </div>
            <button
              class="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center active:scale-95 transition-all shadow-md shadow-blue-500/30"
              @click="activeModal = null"
            >
              <svg viewBox="0 0 24 24" class="w-6 h-6">
                <path
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 6L9 17l-5-5"
                />
              </svg>
            </button>
          </template>
          <template v-else-if="activeModal.type === 'purchase'">
            <div
              class="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl mb-3"
            >
              {{ activeModal.tool === 'cow' ? '🐮' : '💡' }}
            </div>
            <h2 class="text-2xl font-black text-gray-800 mb-2">
              {{ activeModal.tool === 'cow' ? '小牛显示器' : '提示器' }}
            </h2>
            <div class="text-sm text-gray-500 mb-2">100金币一次，或看广告使用</div>
            <div class="text-xs text-gray-400 mb-6">当前金币：{{ coins }}</div>
            <div class="flex gap-3 w-full">
              <button
                class="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold active:scale-95 transition-all shadow-md shadow-yellow-500/30"
                @click="purchaseWithCoins"
              >
                金币购买
              </button>
              <button
                class="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold active:scale-95 transition-all shadow-md shadow-blue-500/30"
                @click="startAd(activeModal.tool)"
              >
                看广告
              </button>
            </div>
          </template>
          <template v-else-if="activeModal.type === 'insufficient'">
            <div
              class="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-3xl mb-3"
            >
              ⚠️
            </div>
            <h2 class="text-2xl font-black text-gray-800 mb-2">金币不足</h2>
            <div class="text-sm text-gray-500 mb-6">需要100金币，当前仅有 {{ coins }}</div>
            <div class="flex gap-3 w-full">
              <button
                class="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold active:scale-95 transition-all shadow-md shadow-blue-500/30"
                @click="startAd(activeModal.tool)"
              >
                看广告
              </button>
              <button
                class="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold active:scale-95 transition-all"
                @click="activeModal = null"
              >
                知道了
              </button>
            </div>
          </template>
          <template v-else-if="activeModal.type === 'ad'">
            <div
              class="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl mb-3 animate-pulse"
            >
              📺
            </div>
            <h2 class="text-2xl font-black text-gray-800 mb-2">广告播放中</h2>
            <div class="text-sm text-gray-500 mb-6">模拟广告中，完成后直接获得一次</div>
            <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-blue-500 animate-pulse" :style="{ width: '70%' }"></div>
            </div>
          </template>
          <template v-else-if="activeModal.type === 'settings'">
            <div
              class="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl mb-3"
            >
              ⚙️
            </div>
            <h2 class="text-2xl font-black text-gray-800 mb-6">设置</h2>
            <div class="w-full space-y-4 mb-6">
              <div class="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <span class="text-gray-600 font-semibold">游戏音效</span>
                <button
                  :class="[
                    'w-12 h-7 rounded-full transition-all',
                    sfxOn ? 'bg-blue-500' : 'bg-gray-300'
                  ]"
                  @click="sfxOn = !sfxOn"
                >
                  <div
                    :class="[
                      'w-5 h-5 bg-white rounded-full shadow-sm transition-all',
                      sfxOn ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  ></div>
                </button>
              </div>
              <div class="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <span class="text-gray-600 font-semibold">游戏音乐</span>
                <button
                  :class="[
                    'w-12 h-7 rounded-full transition-all',
                    musicOn ? 'bg-blue-500' : 'bg-gray-300'
                  ]"
                  @click="musicOn = !musicOn"
                >
                  <div
                    :class="[
                      'w-5 h-5 bg-white rounded-full shadow-sm transition-all',
                      musicOn ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  ></div>
                </button>
              </div>
            </div>
            <button
              class="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold active:scale-95 transition-all shadow-md shadow-blue-500/30"
              @click="activeModal = null"
            >
              确定
            </button>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import musicStart from '@/assets/audio/niuniu/Pixel_Bloom.mp3';
  import musicLoop from '@/assets/audio/niuniu/Pixel_Bloom_Loop.mp3';
  import musicLullaby from '@/assets/audio/niuniu/Pixel_Bloom_Lullaby.mp3';

  const regionColors = [
    'bg-[#a8e6cf]',
    'bg-[#dcedc1]',
    'bg-[#ffd3b6]',
    'bg-[#80bdf6]',
    'bg-[#ffaaa5]',
    'bg-[#ff8b94]',
    'bg-[#e0bbe4]',
    'bg-[#fec8d8]'
  ];

  const LEVELS = [
    {
      size: 4,
      map: [
        [0, 0, 0, 1],
        [0, 2, 1, 1],
        [2, 2, 3, 1],
        [2, 3, 3, 3]
      ],
      solution: [
        { r: 0, c: 1 },
        { r: 1, c: 3 },
        { r: 2, c: 0 },
        { r: 3, c: 2 }
      ]
    },
    {
      size: 5,
      map: [
        [0, 0, 0, 0, 1],
        [0, 0, 0, 1, 1],
        [2, 2, 2, 2, 3],
        [2, 2, 2, 2, 3],
        [4, 4, 4, 4, 4]
      ],
      solution: [
        { r: 0, c: 0 },
        { r: 1, c: 3 },
        { r: 2, c: 1 },
        { r: 3, c: 4 },
        { r: 4, c: 2 }
      ]
    },
    {
      size: 6,
      map: [
        [1, 1, 0, 0, 0, 0],
        [1, 1, 1, 0, 0, 0],
        [1, 3, 3, 2, 2, 2],
        [3, 3, 3, 5, 2, 4],
        [3, 3, 5, 5, 4, 4],
        [3, 5, 5, 5, 4, 4]
      ],
      solution: [
        { r: 0, c: 2 },
        { r: 1, c: 0 },
        { r: 2, c: 4 },
        { r: 3, c: 1 },
        { r: 4, c: 5 },
        { r: 5, c: 3 }
      ]
    },
    {
      size: 7,
      map: [
        [0, 0, 0, 1, 1, 1, 1],
        [3, 4, 4, 1, 1, 1, 2],
        [3, 4, 4, 4, 4, 2, 2],
        [3, 4, 4, 4, 4, 2, 2],
        [3, 4, 4, 4, 4, 5, 5],
        [3, 6, 6, 6, 6, 5, 5],
        [6, 6, 6, 6, 6, 5, 5]
      ],
      solution: [
        { r: 0, c: 1 },
        { r: 1, c: 4 },
        { r: 2, c: 6 },
        { r: 3, c: 0 },
        { r: 4, c: 3 },
        { r: 5, c: 5 },
        { r: 6, c: 2 }
      ]
    },
    {
      size: 8,
      map: [
        [0, 0, 1, 1, 1, 2, 2, 2],
        [0, 0, 1, 1, 1, 2, 2, 2],
        [3, 3, 4, 4, 4, 2, 2, 2],
        [3, 3, 4, 4, 4, 5, 5, 5],
        [3, 3, 4, 4, 4, 5, 5, 5],
        [6, 6, 6, 7, 7, 5, 5, 5],
        [6, 6, 6, 7, 7, 7, 7, 7],
        [6, 6, 6, 6, 7, 7, 7, 7]
      ],
      solution: [
        { r: 0, c: 0 },
        { r: 1, c: 3 },
        { r: 2, c: 6 },
        { r: 3, c: 1 },
        { r: 4, c: 4 },
        { r: 5, c: 7 },
        { r: 6, c: 2 },
        { r: 7, c: 5 }
      ]
    }
  ];

  const currentLevelIndex = ref(0);
  const grid = ref([]);
  const mistakes = ref(new Set());
  const isWon = ref(false);
  const isGameOver = ref(false);
  const cowCount = ref(0);
  const health = ref(3);
  const hintCount = ref(3);
  const cowToolCount = ref(3);
  const coins = ref(100);
  const activeModal = ref(null);
  const isInMenu = ref(true);
  const selectedLevelIndex = ref(0);
  const musicOn = ref(true);
  const sfxOn = ref(true);

  const isDragging = ref(false);
  const dragAction = ref(null);
  const lastClick = ref({ time: 0, r: null, c: null });
  const levelRef = ref(0);
  const musicTracksRef = ref([]);
  const musicIndexRef = ref(0);
  const fadeTimerRef = ref(null);
  const musicSources = [musicStart, musicLoop, musicLullaby];

  watch(currentLevelIndex, value => {
    levelRef.value = value;
  });

  const clearFadeTimer = () => {
    if (fadeTimerRef.value) {
      clearInterval(fadeTimerRef.value);
      fadeTimerRef.value = null;
    }
  };

  const fadeAudioTo = (audio, target, duration = 800) => {
    if (!audio) return;
    clearFadeTimer();
    const start = audio.volume ?? 0;
    const diff = target - start;
    const steps = Math.max(1, Math.floor(duration / 50));
    let step = 0;
    fadeTimerRef.value = setInterval(() => {
      step += 1;
      const next = start + diff * (step / steps);
      audio.volume = Math.min(1, Math.max(0, next));
      if (step >= steps) {
        clearFadeTimer();
        if (target === 0) {
          audio.pause();
        }
      }
    }, 50);
  };

  const playCurrentTrack = () => {
    const tracks = musicTracksRef.value;
    const current = tracks[musicIndexRef.value];
    if (!current) return;
    tracks.forEach((track, index) => {
      if (index !== musicIndexRef.value) {
        track.pause();
        track.currentTime = 0;
        track.volume = 0;
      }
    });
    current.currentTime = current.currentTime || 0;
    current.volume = 0;
    const playPromise = current.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(() => {});
    }
    fadeAudioTo(current, 1, 900);
  };

  onMounted(() => {
    musicTracksRef.value = musicSources.map(src => {
      const audio = new Audio(src);
      audio.preload = 'auto';
      audio.volume = 0;
      return audio;
    });
    musicTracksRef.value.forEach(audio => {
      audio.onended = () => {
        musicIndexRef.value = (musicIndexRef.value + 1) % musicTracksRef.value.length;
        if (musicOn.value) playCurrentTrack();
      };
    });
    if (musicOn.value) playCurrentTrack();
  });

  onUnmounted(() => {
    clearFadeTimer();
    musicTracksRef.value.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
      audio.onended = null;
    });
  });

  watch(musicOn, value => {
    const tracks = musicTracksRef.value;
    if (!tracks.length) return;
    const current = tracks[musicIndexRef.value];
    if (value) {
      const playPromise = current?.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(() => {});
      }
      fadeAudioTo(current, 1, 900);
    } else {
      fadeAudioTo(current, 0, 600);
    }
  });

  const validateGridState = (gridToCheck, level) => {
    const newMistakes = new Set();
    let cowsPlaced = 0;
    const size = level.size;
    const rowCounts = Array(size).fill(0);
    const colCounts = Array(size).fill(0);
    const regionCounts = Array(size).fill(0);
    const cowPositions = [];

    for (let r = 0; r < size; r += 1) {
      for (let c = 0; c < size; c += 1) {
        if (gridToCheck[r][c] === 1) {
          cowsPlaced += 1;
          rowCounts[r] += 1;
          colCounts[c] += 1;
          regionCounts[level.map[r][c]] += 1;
          cowPositions.push({ r, c });
        }
      }
    }

    for (let r = 0; r < size; r += 1) {
      for (let c = 0; c < size; c += 1) {
        if (gridToCheck[r][c] === 1) {
          if (rowCounts[r] > 1) newMistakes.add(`${r},${c}`);
          if (colCounts[c] > 1) newMistakes.add(`${r},${c}`);
          if (regionCounts[level.map[r][c]] > 1) newMistakes.add(`${r},${c}`);
        }
      }
    }

    for (let i = 0; i < cowPositions.length; i += 1) {
      for (let j = i + 1; j < cowPositions.length; j += 1) {
        const cow1 = cowPositions[i];
        const cow2 = cowPositions[j];
        if (Math.abs(cow1.r - cow2.r) <= 1 && Math.abs(cow1.c - cow2.c) <= 1) {
          newMistakes.add(`${cow1.r},${cow1.c}`);
          newMistakes.add(`${cow2.r},${cow2.c}`);
        }
      }
    }

    for (let r = 0; r < size; r += 1) {
      for (let c = 0; c < size; c += 1) {
        if (gridToCheck[r][c] === 1) {
          const isCorrect = level.solution.some(pos => pos.r === r && pos.c === c);
          if (!isCorrect) newMistakes.add(`${r},${c}`);
        }
      }
    }

    return {
      newMistakes,
      cowsPlaced,
      isWonStatus: cowsPlaced === size && newMistakes.size === 0
    };
  };

  const updateGridState = updater => {
    const next = updater(grid.value);
    if (next === grid.value) return;
    grid.value = next;
    const { newMistakes, cowsPlaced, isWonStatus } = validateGridState(
      next,
      LEVELS[levelRef.value]
    );
    mistakes.value = newMistakes;
    cowCount.value = cowsPlaced;
    isWon.value = isWonStatus;
  };

  const loadLevel = index => {
    const level = LEVELS[index];
    const size = level.size;
    const initialGrid = Array(size)
      .fill(null)
      .map(() => Array(size).fill(0));
    const firstCow = level.solution[0];
    initialGrid[firstCow.r][firstCow.c] = 1;

    grid.value = initialGrid;
    currentLevelIndex.value = index;
    isGameOver.value = false;
    health.value = 3;
    hintCount.value = 3;
    cowToolCount.value = 3;
    activeModal.value = null;
    selectedLevelIndex.value = index;
    isDragging.value = false;
    lastClick.value = { time: 0, r: null, c: null };

    const { newMistakes, cowsPlaced, isWonStatus } = validateGridState(initialGrid, level);
    mistakes.value = newMistakes;
    cowCount.value = cowsPlaced;
    isWon.value = isWonStatus;
  };

  onMounted(() => {
    loadLevel(0);
  });

  const handleUp = () => {
    isDragging.value = false;
  };

  onMounted(() => {
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
  });

  onUnmounted(() => {
    window.removeEventListener('pointerup', handleUp);
    window.removeEventListener('pointercancel', handleUp);
  });

  const getCellCoords = e => {
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (!target) return null;
    const r = target.getAttribute('data-r');
    const c = target.getAttribute('data-c');
    if (r !== null && c !== null) return { r: parseInt(r, 10), c: parseInt(c, 10) };
    return null;
  };

  const handleDoubleClick = (r, c) => {
    const level = LEVELS[levelRef.value];
    let wasError = false;

    updateGridState(prev => {
      const isCurrentlyCow = prev[r][c] === 1;
      if (!isCurrentlyCow) {
        const isCorrect = level.solution.some(pos => pos.r === r && pos.c === c);
        if (!isCorrect) {
          wasError = true;
          const nextHealth = health.value - 1;
          health.value = nextHealth;
          if (nextHealth <= 0) isGameOver.value = true;
        }
      }
      const next = prev.map(row => [...row]);
      next[r][c] = isCurrentlyCow ? 0 : 1;
      return next;
    });

    if (wasError) {
      setTimeout(() => {
        updateGridState(prev => {
          if (prev[r] && prev[r][c] === 1) {
            const isCorrect = LEVELS[levelRef.value].solution.some(
              pos => pos.r === r && pos.c === c
            );
            if (!isCorrect) {
              const next = prev.map(row => [...row]);
              next[r][c] = 0;
              return next;
            }
          }
          return prev;
        });
      }, 600);
    }
  };

  const onPointerDown = e => {
    if (isWon.value || isGameOver.value) return;
    const coords = getCellCoords(e);
    if (!coords) return;
    const { r, c } = coords;

    const now = Date.now();
    const lc = lastClick.value;

    if (lc.r === r && lc.c === c && now - lc.time < 300) {
      lastClick.value = { time: 0, r: null, c: null };
      isDragging.value = false;
      handleDoubleClick(r, c);
    } else {
      lastClick.value = { time: now, r, c };
      if (grid.value[r] && grid.value[r][c] !== 1) {
        isDragging.value = true;
        dragAction.value = grid.value[r][c] === 0 ? 2 : 0;
        applyDragAction(r, c);
      }
    }
  };

  const onPointerMove = e => {
    if (!isDragging.value || isWon.value || isGameOver.value) return;
    const coords = getCellCoords(e);
    if (!coords) return;
    applyDragAction(coords.r, coords.c);
  };

  const applyDragAction = (r, c) => {
    updateGridState(prev => {
      if (prev[r][c] === 1) return prev;
      if (prev[r][c] === dragAction.value) return prev;
      const next = prev.map(row => [...row]);
      next[r][c] = dragAction.value;
      return next;
    });
  };

  const openPurchaseModal = type => {
    activeModal.value = { type: 'purchase', tool: type };
  };

  const openInsufficientModal = type => {
    activeModal.value = { type: 'insufficient', tool: type };
  };

  const openHintModal = (r, c) => {
    activeModal.value = { type: 'hint', r, c };
  };

  const startAd = tool => {
    activeModal.value = { type: 'ad', tool };
  };

  const openSettingsModal = () => {
    activeModal.value = { type: 'settings' };
  };

  const getNextSolutionCell = () => {
    const level = LEVELS[currentLevelIndex.value];
    for (const pos of level.solution) {
      if (grid.value[pos.r] && grid.value[pos.r][pos.c] !== 1) {
        return pos;
      }
    }
    return null;
  };

  const handleCowTool = () => {
    if (isWon.value || isGameOver.value) return;
    if (cowToolCount.value <= 0) {
      openPurchaseModal('cow');
      return;
    }
    const nextPos = getNextSolutionCell();
    if (!nextPos) return;
    cowToolCount.value = Math.max(0, cowToolCount.value - 1);
    updateGridState(prev => {
      const next = prev.map(row => [...row]);
      next[nextPos.r][nextPos.c] = 1;
      return next;
    });
  };

  const handleHint = () => {
    if (isWon.value || isGameOver.value) return;
    if (hintCount.value <= 0) {
      openPurchaseModal('hint');
      return;
    }
    const level = LEVELS[currentLevelIndex.value];
    let rToPlace = -1;
    let cToPlace = -1;

    for (const pos of level.solution) {
      if (grid.value[pos.r] && grid.value[pos.r][pos.c] !== 1) {
        rToPlace = pos.r;
        cToPlace = pos.c;
        break;
      }
    }

    if (rToPlace !== -1) {
      hintCount.value = Math.max(0, hintCount.value - 1);
      openHintModal(rToPlace, cToPlace);
    }
  };

  watch(activeModal, (value, _, onCleanup) => {
    if (!value || value.type !== 'ad') return;
    const timer = setTimeout(() => {
      if (value.tool === 'cow') {
        cowToolCount.value += 1;
      }
      if (value.tool === 'hint') {
        hintCount.value += 1;
      }
      activeModal.value = null;
    }, 1200);
    onCleanup(() => clearTimeout(timer));
  });

  const handleNextLevel = () => {
    const nextIndex = (currentLevelIndex.value + 1) % LEVELS.length;
    loadLevel(nextIndex);
  };

  const startGame = () => {
    loadLevel(selectedLevelIndex.value);
    isInMenu.value = false;
  };

  const purchaseWithCoins = () => {
    if (coins.value < 100) {
      openInsufficientModal(activeModal.value?.tool);
      return;
    }
    coins.value -= 100;
    if (activeModal.value?.tool === 'cow') cowToolCount.value += 1;
    if (activeModal.value?.tool === 'hint') hintCount.value += 1;
    activeModal.value = null;
  };

  const currentLevel = computed(() => LEVELS[currentLevelIndex.value]);
  const size = computed(() => currentLevel.value.size);
  const fontSize = computed(() =>
    size.value >= 7 ? 'text-[1.5rem] sm:text-[1.8rem]' : 'text-3xl sm:text-4xl'
  );
  const svgSize = computed(() =>
    size.value >= 7 ? 'w-6 h-6 sm:w-8 sm:h-8' : 'w-8 h-8 sm:w-10 sm:h-10'
  );
  const remainingCount = computed(() => size.value - cowCount.value);

  const regionColor = (r, c) => regionColors[currentLevel.value.map[r][c]];
  const isMistake = (r, c) => mistakes.value.has(`${r},${c}`);
</script>

<style>
  @keyframes popIn {
    0% {
      transform: scale(0.3);
      opacity: 0;
    }
    70% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  .animate-pop {
    animation: popIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }
  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-2px) rotate(-2deg);
    }
    75% {
      transform: translateX(2px) rotate(2deg);
    }
  }
  .animate-error {
    animation: shake 0.3s ease-in-out infinite;
  }
</style>
