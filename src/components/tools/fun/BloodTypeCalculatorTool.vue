<template>
    <div class="blood-type-tool">
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>血型遗传计算器</h1>
                <span class="nav-subtitle">Blood Type Inheritance</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="tool-card glass-card">
                
                <div class="input-section">
                    <div class="parent-select">
                        <div class="role-label">父亲血型</div>
                        <div class="blood-options">
                            <button
v-for="type in bloodTypes" :key="'f-' + type" :class="{ active: fatherType === type }"
                                @click="fatherType = type">{{ type }}</button>
                        </div>
                    </div>

                    <div class="divider-icon">
                        <el-icon>
                            <Plus />
                        </el-icon>
                    </div>

                    <div class="parent-select">
                        <div class="role-label">母亲血型</div>
                        <div class="blood-options">
                            <button
v-for="type in bloodTypes" :key="'m-' + type" :class="{ active: motherType === type }"
                                @click="motherType = type">{{ type }}</button>
                        </div>
                    </div>
                </div>

                
                <div v-if="result" class="result-section">
                    <div class="result-box possible">
                        <div class="box-header">
                            <el-icon>
                                <Check />
                            </el-icon> 子女可能血型
                        </div>
                        <div class="blood-list">
                            <span v-for="t in result.possible" :key="t" class="blood-badge possible">{{ t }}型</span>
                        </div>
                    </div>

                    <div class="result-box impossible">
                        <div class="box-header">
                            <el-icon>
                                <Close />
                            </el-icon> 子女不可能血型
                        </div>
                        <div class="blood-list">
                            <span v-for="t in result.impossible" :key="t" class="blood-badge impossible">{{ t }}型</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="tips-card">
                <el-icon>
                    <InfoFilled />
                </el-icon>
                <div class="tip-content">
                    <p>遗传规律说明：</p>
                    <p>血型遗传是由位于染色体上的基因控制的。人体细胞中的染色体是成对的，一个来自父亲，一个来自母亲。</p>
                    <p>注：此工具仅计算 ABO 血型系统，不包含 Rh 因子（阴性/阳性）。结果仅供科普参考，医学判定请以医院检测为准。</p>
                </div>
            </div>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 血型遗传计算器
        </footer>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Back, Plus, Check, Close, InfoFilled } from '@element-plus/icons-vue'

const bloodTypes = ['A', 'B', 'O', 'AB']
const fatherType = ref('A')
const motherType = ref('A')



const inheritanceMap = {
    'A+A': { possible: ['A', 'O'], impossible: ['B', 'AB'] },
    'A+AB': { possible: ['A', 'B', 'AB'], impossible: ['O'] },
    'A+B': { possible: ['A', 'B', 'AB', 'O'], impossible: [] },
    'A+O': { possible: ['A', 'O'], impossible: ['B', 'AB'] },
    'AB+AB': { possible: ['A', 'B', 'AB'], impossible: ['O'] },
    'AB+B': { possible: ['A', 'B', 'AB'], impossible: ['O'] },
    'AB+O': { possible: ['A', 'B'], impossible: ['O', 'AB'] },
    'B+B': { possible: ['B', 'O'], impossible: ['A', 'AB'] },
    'B+O': { possible: ['B', 'O'], impossible: ['A', 'AB'] },
    'O+O': { possible: ['O'], impossible: ['A', 'B', 'AB'] }
}

const result = computed(() => {
    if (!fatherType.value || !motherType.value) return null

    
    const key = [fatherType.value, motherType.value].sort().join('+')
    const data = inheritanceMap[key] || inheritanceMap['A+B'] 

    return data
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

.blood-type-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-2: #6b6b6b;
    --accent: #ef4444;
    
    --accent-light: #fee2e2;
    --success: #10b981;
    --danger: #991b1b;
    

    font-family: 'Noto Sans SC', sans-serif;
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
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
    padding: 0.5rem 0;
}

.nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.25rem;
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
    max-width: 600px;
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
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}


.input-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.parent-select {
    width: 100%;
    text-align: center;
}

.role-label {
    font-size: 0.9rem;
    color: var(--text-2);
    margin-bottom: 0.75rem;
}

.blood-options {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
}

.blood-options button {
    padding: 0.75rem 0;
    border: 1px solid var(--border);
    background: white;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text);
}

.blood-options button.active {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.divider-icon {
    color: var(--text-2);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: #f3f4f6;
    border-radius: 50%;
}


.result-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    animation: fadeIn 0.3s ease;
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

.result-box {
    border-radius: 12px;
    padding: 1.25rem;
    text-align: center;
}

.result-box.possible {
    background: #ecfdf5;
    
    border: 1px solid #d1fae5;
}

.result-box.impossible {
    background: #fef2f2;
    
    border: 1px solid #fee2e2;
}

.box-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.possible .box-header {
    color: #059669;
}

.impossible .box-header {
    color: #dc2626;
}

.blood-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;
}

.blood-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-weight: 700;
    font-size: 1.1rem;
}

.blood-badge.possible {
    background: white;
    color: #059669;
    border: 1px solid #a7f3d0;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.blood-badge.impossible {
    background: white;
    color: #dc2626;
    border: 1px solid #fecaca;
    opacity: 0.7;
    text-decoration: line-through;
}

.tips-card {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: rgba(239, 68, 68, 0.05);
    color: #b91c1c;
    border-radius: 8px;
    font-size: 0.85rem;
    line-height: 1.5;
}

.footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
    margin-top: 2rem;
}
</style>
