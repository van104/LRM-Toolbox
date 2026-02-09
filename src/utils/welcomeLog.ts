
export function printWelcomeLog(): void {
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    const titleText = ' LRM 工具箱 ToolBox';
    const bodyText =`
  🚀 欢迎使用 LRM 开发者工具箱！                        
  👉 本项目旨在提供高效的开发体验，完全免费开源。         
  📝 Github: https://github.com/van104/LRM-Toolbox.git
  ⚠️ 请勿将本工具用于任何非法用途。                      `;

    const titleStyle = `
    display: inline-block;
    font-size: 16px;
    font-weight: 700;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    color: #fff;
    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    padding: 8px 12px;
    border-radius: 6px 6px 0 0;
    text-shadow: 0 1px 3px rgba(0,0,0,0.1);
    line-height: 1.2;
    margin-top: 10px;
    width: 100%;
    box-sizing: border-box;
  `;

    const bodyStyle = `
    display: inline-block;
    font-size: 12px;
    font-family: "Menlo", "Monaco", "Consolas", monospace;
    color: ${isDark ? '#e2e8f0' : '#334155'};
    background-color: ${isDark ? '#1e293b' : '#f8fafc'};
    border: 1px solid ${isDark ? '#334155' : '#e2e8f0'};
    border-top: none;
    padding: 12px;
    border-radius: 0 0 6px 6px;
    line-height: 1.6;
    width: 100%;
    box-sizing: border-box;
  `;

    // 
    // 
    // 
    //

    console.log(`%c${titleText}%c${bodyText}`, titleStyle, bodyStyle);

    // 
    console.log(
        '%c 💡 Tip: %c 按 Ctrl+K 可快速唤起全局搜索',
        'background: #fbbf24; color: #fff; padding: 2px 6px; border-radius: 4px; font-weight: bold;',
        'color: #64748b; margin-left: 5px;'
    );
}
