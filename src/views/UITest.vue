<template>
  <div
    class="relative min-h-screen bg-[#F0F0F0] dark:bg-[#0A0A0A] font-sans selection:bg-[#FF7BE5] selection:text-white flex flex-col items-center"
  >
    <!-- 优化后的背景：减淡网格线，增加呼吸感 -->
    <div
      class="fixed inset-0 pointer-events-none ui-grid-bg opacity-[0.12] dark:opacity-[0.05] z-0"
    ></div>

    <div class="relative z-10 w-full max-w-[1400px] px-6 py-16 md:py-24 flex flex-col gap-28">
      <!-- 重新排版的头部 -->
      <header class="flex flex-col gap-10">
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-3">
            <span
              class="bg-black dark:bg-[#EEE] text-white dark:text-black font-black px-2 py-0.5 text-[10px] tracking-widest shadow-[3px_3px_0_0_#00E572]"
              >核心组件.V1</span
            >
            <span class="h-[2px] w-12 bg-black dark:bg-white opacity-20"></span>
            <span class="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400"
              >UI 实验室 / 2024</span
            >
          </div>
          <h1
            class="text-7xl md:text-9xl font-black uppercase text-black dark:text-[#EEE] leading-[0.85] tracking-tighter m-0 italic"
          >
            视觉<br /><span class="text-[#FF4B4B]">规范指南</span>
          </h1>
        </div>

        <div
          class="flex flex-col md:flex-row justify-between items-start md:items-end border-t-8 border-black dark:border-[#EEE] pt-10 gap-8"
        >
          <div class="max-w-xl">
            <p class="text-2xl font-bold text-gray-700 dark:text-gray-400 leading-snug italic">
              “意图即美学”。一套基于 Radix 原语构建的硬核 UI
              工具包，融合重型阴影与不妥协的排版风格。
            </p>
          </div>
          <Button
            variant="secondary"
            size="lg"
            class="!px-10 !py-5 !text-xl !shadow-[8px_8px_0_0_#000] dark:!shadow-[8px_8px_0_0_#EEE]"
            @click="$router.push('/')"
          >
            返回工作台
          </Button>
        </div>
      </header>

      <!-- 01 / Buttons - 清简布局 -->
      <section class="flex flex-col gap-12">
        <h2 class="text-5xl font-black tracking-tighter uppercase border-l-8 border-[#FF9900] pl-6">
          01 / 交互原件
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
          <!-- 变体 -->
          <div
            class="bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-[#EEE] p-10 shadow-[10px_10px_0_0_#000] dark:shadow-[10px_10px_0_0_#EEE]"
          >
            <h3
              class="text-xs font-black uppercase text-gray-400 mb-8 border-b-2 border-dashed border-gray-200 dark:border-gray-800 pb-4"
            >
              视觉变体
            </h3>
            <div class="flex flex-col gap-5">
              <Button variant="primary" class="w-full">主要操作</Button>
              <Button variant="secondary" class="w-full">次要操作</Button>
              <Button variant="danger" class="w-full">危险区域</Button>
              <Button variant="ghost" class="w-full">幽灵链接</Button>
            </div>
          </div>

          <!-- 尺寸 -->
          <div
            class="bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-[#EEE] p-10 shadow-[10px_10px_0_0_#00E572]"
          >
            <h3
              class="text-xs font-black uppercase text-gray-400 mb-8 border-b-2 border-dashed border-gray-200 dark:border-gray-800 pb-4"
            >
              尺寸缩放
            </h3>
            <div class="flex flex-col gap-6 items-start">
              <Button size="sm">小型单元</Button>
              <Button size="md" variant="secondary">中型基准</Button>
              <Button size="lg" variant="primary" class="w-full">大型系统</Button>
            </div>
          </div>

          <!-- 状态 -->
          <div
            class="bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-[#EEE] p-10 shadow-[10px_10px_0_0_#0EA5E9]"
          >
            <h3
              class="text-xs font-black uppercase text-gray-400 mb-8 border-b-2 border-dashed border-gray-200 dark:border-gray-800 pb-4"
            >
              交互状态
            </h3>
            <div class="flex flex-col gap-6">
              <Button variant="primary" disabled>锁定授权</Button>
              <div
                class="p-6 bg-gray-50 dark:bg-black border-4 border-dashed border-gray-200 dark:border-gray-800 flex flex-col gap-4 items-center"
              >
                <span class="text-[10px] font-black uppercase opacity-40">模拟激活</span>
                <Button
                  variant="secondary"
                  class="-translate-x-1 -translate-y-1 shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#EEE]"
                  >已按下</Button
                >
              </div>
            </div>
          </div>

          <!-- 风格自定义 -->
          <div
            class="bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-[#EEE] p-10 shadow-[10px_10px_0_0_#FF7BE5]"
          >
            <h3
              class="text-xs font-black uppercase text-gray-400 mb-8 border-b-2 border-dashed border-gray-200 dark:border-gray-800 pb-4"
            >
              样式覆盖
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <Button
                class="!rounded-full !bg-pink-400 !border-2 !shadow-[4px_4px_0_0_#000] !text-white"
                >药丸形</Button
              >
              <Button class="!bg-yellow-300 !text-black shadow-[4px_4px_0_0_#000]">复古风</Button>
              <Button
                class="col-span-2 !bg-black !text-[#00E572] !border-[#00E572] uppercase font-black italic"
                >黑客.协议</Button
              >
            </div>
          </div>
        </div>
      </section>

      <!-- 弹窗与提示 -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-16">
        <section class="flex flex-col gap-8">
          <h2
            class="text-4xl font-black tracking-tighter uppercase border-l-8 border-[#0EA5E9] pl-6"
          >
            02 / 覆盖层
          </h2>
          <div
            class="bg-[#FFED00] border-4 border-black p-16 flex items-center justify-center shadow-[15px_15px_0_0_#000] min-h-[400px]"
          >
            <Dialog
              title="访问授权成功"
              description="您已成功绕过标准验证协议。欢迎进入核心控制台。"
            >
              <template #trigger>
                <Button
                  size="lg"
                  variant="secondary"
                  class="!px-12 !py-6 !text-2xl shadow-[10px_10px_0_0_#000] !bg-white"
                  >部署弹窗</Button
                >
              </template>
              <div
                class="p-4 bg-gray-100 dark:bg-[#222] border-2 border-black dark:border-white/20 font-mono text-xs uppercase leading-loose"
              >
                > 启动序列: 正常 <br />
                > 安全等级: 0 <br />
                > 系统准备就绪
              </div>
            </Dialog>
          </div>
        </section>

        <section class="flex flex-col gap-8">
          <h2
            class="text-4xl font-black tracking-tighter uppercase border-l-8 border-[#FF7BE5] pl-6"
          >
            03 / 内容上下文
          </h2>
          <div
            class="bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-[#EEE] p-16 flex flex-wrap gap-12 items-center justify-center shadow-[15px_15px_0_0_#FF7BE5] min-h-[400px]"
          >
            <Tooltip content="气泡提示矩阵已激活">
              <Button variant="secondary" class="!px-8 !py-4 font-black italic">悬停提示</Button>
            </Tooltip>
            <Tooltip content="底部锚点信息面板" side="bottom">
              <div
                class="p-6 border-8 border-black dark:border-[#EEE] bg-[#00E572] text-black font-black uppercase text-xl cursor-help shadow-[8px_8px_0_0_#000]"
              >
                探索本质
              </div>
            </Tooltip>
          </div>
        </section>
      </div>

      <!-- 选择与表单 -->
      <section class="flex flex-col gap-12">
        <h2 class="text-5xl font-black tracking-tighter uppercase border-l-8 border-[#00E572] pl-6">
          04 / 数据录入
        </h2>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <!-- Form Col 1 -->
          <div
            class="lg:col-span-2 bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-[#EEE] p-12 shadow-[12px_12px_0_0_#0EA5E9]"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div class="flex flex-col gap-8">
                <Input v-model="inputText" label="节点标识符" placeholder="node_8829" />
                <Input
                  v-model="inputText2"
                  label="安全令牌"
                  type="password"
                  error="令牌签名不匹配"
                />
              </div>
              <div class="flex flex-col gap-8">
                <Select
                  v-model="selectedValue"
                  label="操作区域选择"
                  :options="[
                    { label: '7-G 区块', value: 's7g' },
                    { label: '三角网格', value: 'delta' }
                  ]"
                />
                <div
                  class="mt-auto p-6 bg-black text-[#00E572] border-4 border-[#00E572] font-mono text-xs shadow-[6px_6px_0_0_#00E572] uppercase"
                >
                  实时负载: {{ inputText || '等待输入' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Form Col 2 -->
          <div
            class="bg-[#E0E7FF] dark:bg-[#1E1B4B] border-4 border-black dark:border-[#EEE] p-12 shadow-[12px_12px_0_0_#000]"
          >
            <div class="flex flex-col gap-10">
              <h3
                class="text-xl font-black uppercase italic border-b-4 border-black pb-4 text-black dark:text-white"
              >
                安全标志
              </h3>
              <Checkbox v-model="check1" label="开启加密会话" />
              <Checkbox v-model="check2" label="硬件加速支持" />
              <Checkbox v-model="check3" label="管理权限覆盖" disabled />

              <div
                class="pt-8 mt-4 border-t-2 border-black/10 flex justify-between items-center text-[10px] font-black uppercase opacity-60 text-black dark:text-white"
              >
                <span>安全自检状态</span>
                <span class="text-[#FF4B4B]">待通过</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 布局与高级交互 -->
      <section class="flex flex-col gap-12">
        <h2 class="text-5xl font-black tracking-tighter uppercase border-l-8 border-[#FF7BE5] pl-6">
          05 / 布局与高级交互
        </h2>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Tabs 区域 -->
          <div class="bg-[#f0f0f0] dark:bg-[#0A0A0A] flex flex-col">
            <h3
              class="text-xl font-black uppercase italic border-b-4 border-black dark:border-[#EEE] pb-4 mb-8 text-black dark:text-white"
            >
              Tabs 标签页
            </h3>
            <Tabs
              default-value="visual"
              :tabs="[
                { value: 'visual', label: '视觉配置' },
                { value: 'system', label: '系统网络' }
              ]"
            >
              <TabsContent value="visual">
                <div class="flex flex-col gap-6">
                  <p class="font-bold text-gray-700 dark:text-gray-300">
                    调整主要终端视觉参数以适配当前环境。
                  </p>
                  <div class="flex flex-col gap-5 mt-4">
                    <Switch v-model="switch1" label="高对比文本" />
                    <Switch v-model="switch2" label="减少运动滤镜" />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="system">
                <div class="flex flex-col gap-6">
                  <p class="font-bold text-gray-700 dark:text-gray-300">
                    系统网络与代理链路设置区。
                  </p>
                  <Button variant="danger" class="w-full mt-4">重置所有设置</Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <!-- Accordion 区域 -->
          <div class="bg-[#f0f0f0] dark:bg-[#0A0A0A] flex flex-col">
            <h3
              class="text-xl font-black uppercase italic border-b-4 border-black dark:border-[#EEE] pb-4 mb-8 text-black dark:text-white"
            >
              Accordion 叠面板
            </h3>
            <Accordion type="single" :default-value="['item-1']" collapsible>
              <AccordionItem value="item-1" title="什么是新粗野主义？">
                <p class="font-bold text-gray-700 dark:text-gray-300 leading-relaxed">
                  新粗野主义(Neobrutalism)
                  是一种强调原始、粗犷、大胆色彩和巨大阴影的网页设计趋势，抛弃了极其圆滑的渐变，回归纯粹的力量感。
                </p>
              </AccordionItem>
              <AccordionItem value="item-2" title="系统安全等级">
                <p class="font-bold text-gray-700 dark:text-gray-300 leading-relaxed">
                  当前您的终端连接处于 [Level 4] 加密强度。请不要在非授信环境下操作。
                </p>
              </AccordionItem>
              <AccordionItem value="item-3" title="关于自动销毁机制">
                <div class="flex flex-col gap-4">
                  <p class="font-bold text-gray-700 dark:text-gray-300 leading-relaxed">
                    如果设备被入侵，您可以通过这里一键销毁所有本地数据缓存。
                  </p>
                  <Button variant="danger" size="sm" class="self-start">执行销毁</Button>
                </div>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      <!-- Footer decoration -->
      <footer
        class="mt-12 opacity-30 flex justify-between items-center font-black text-[10px] tracking-widest uppercase text-black dark:text-white"
      >
        <span>LRM 工具箱 / 系统 UI 实验室</span>
        <span>VER_2.5.0 / 核心构建_2024</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import Button from '@/components/ui/Button/Button.vue';
  import Dialog from '@/components/ui/Dialog/Dialog.vue';
  import Tooltip from '@/components/ui/Tooltip/Tooltip.vue';
  import Select from '@/components/ui/Select/Select.vue';
  import Input from '@/components/ui/Input/Input.vue';
  import Checkbox from '@/components/ui/Checkbox/Checkbox.vue';
  import Switch from '@/components/ui/Switch/Switch.vue';
  import Tabs from '@/components/ui/Tabs/Tabs.vue';
  import TabsContent from '@/components/ui/Tabs/TabsContent.vue';
  import Accordion from '@/components/ui/Accordion/Accordion.vue';
  import AccordionItem from '@/components/ui/Accordion/AccordionItem.vue';

  const selectedValue = ref('');
  const inputText = ref('');
  const inputText2 = ref('');
  const check1 = ref(true);
  const check2 = ref(false);
  const check3 = ref(false);
  const switch1 = ref(true);
  const switch2 = ref(false);
</script>

<style scoped>
  .ui-grid-bg {
    background-image:
      linear-gradient(#111 1.5px, transparent 1.5px),
      linear-gradient(90deg, #111 1.5px, transparent 1.5px);
    background-size: 60px 60px;
  }
  [data-theme='dark'] .ui-grid-bg {
    background-image:
      linear-gradient(#eee 1.5px, transparent 1.5px),
      linear-gradient(90deg, #eee 1.5px, transparent 1.5px);
  }
</style>
