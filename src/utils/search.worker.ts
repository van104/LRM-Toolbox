import PinyinMatch from 'pinyin-match';

self.onmessage = (e: MessageEvent) => {
  const { id, tools, keyword } = e.data;
  if (!keyword) {
    self.postMessage({ id, results: [] });
    return;
  }

  const lowerKeyword = keyword.toLowerCase();
  const results = tools.filter((tool: { name: string; summary: string; tags: string[] }) => {
    // 1. 拼音/首字母匹配
    const nameMatch = PinyinMatch.match(tool.name, keyword);

    // 2. 摘要常规包含匹配
    const summaryMatch = tool.summary.toLowerCase().includes(lowerKeyword);

    // 3. 标签匹配
    const tagMatch = tool.tags.some(
      (tag: string) => tag.toLowerCase().includes(lowerKeyword) || PinyinMatch.match(tag, keyword)
    );

    return nameMatch || summaryMatch || tagMatch;
  });

  self.postMessage({ id, results });
};
