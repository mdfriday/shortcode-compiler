import { PageLexer, ShortcodeItem } from './pageLexer';

/**
 * PageLexer 单元测试
 * 
 * 这个测试文件专注于验证改进版 PageLexer 是否解决了原始实现中的问题：
 * 1. 嵌入在内容中的 shortcode 识别问题
 * 2. 参数解析问题（保留引号）
 * 3. 内联 shortcode 处理问题
 */
describe('PageLexer', () => {
  describe('Shortcode 识别和解析改进', () => {
    test('应该正确识别和提取嵌入在内容中的 shortcode', () => {
      const content = 'This is content with a {{< shortcode param="value" >}} embedded in it.';
      
      const result = PageLexer.parse(content);
      
      // 应该有 3 个项目：前面的内容、shortcode、后面的内容
      expect(result.items).toHaveLength(3);
      
      // 检查 shortcode 是否被正确提取
      expect(result.items[1].type).toBe('shortcode');
      const shortcodeItem = result.items[1] as ShortcodeItem;
      expect(shortcodeItem.name).toBe('shortcode');
      
      // 检查内容是否被正确分割
      expect(result.items[0].type).toBe('content');
      expect(result.items[0].val).toBe('This is content with a ');
      
      expect(result.items[2].type).toBe('content');
      expect(result.items[2].val).toBe(' embedded in it.');
    });
    
    test('应该保留参数中的引号', () => {
      const content = '{{< image src="test.jpg" alt="Test Image" >}}';
      
      const result = PageLexer.parse(content);
      
      expect(result.items).toHaveLength(1);
      const shortcodeItem = result.items[0] as ShortcodeItem;
      expect(shortcodeItem.type).toBe('shortcode');
      expect(shortcodeItem.name).toBe('image');
      
      // 参数应该保留引号
      expect(shortcodeItem.params).toContain('src="test.jpg"');
      expect(shortcodeItem.params).toContain('alt="Test Image"');
    });
    
    test('应该正确处理内联 shortcode', () => {
      const content = '{{< image src="test.jpg" />}}';
      
      const result = PageLexer.parse(content);
      
      expect(result.items).toHaveLength(1);
      const shortcodeItem = result.items[0] as ShortcodeItem;
      expect(shortcodeItem.type).toBe('shortcode');
      expect(shortcodeItem.name).toBe('image');
      
      // 应该正确标记为内联，且不将 "/" 作为参数
      expect(shortcodeItem.isInline).toBe(true);
      expect(shortcodeItem.params).toContain('src="test.jpg"');
      expect(shortcodeItem.params).not.toContain('/');
    });
  });
  
  describe('复杂内容解析', () => {
    test('应该正确解析包含 frontmatter、summary divider 和嵌入 shortcode 的内容', () => {
      const content = `---
title: Test Title
date: 2023-01-01
---
This is the summary with a {{< shortcode param="value" >}}.
<!-- more -->
This is the rest of the content with another {{< shortcode2 />}}.`;
      
      const result = PageLexer.parse(content);
      
      // 输出解析结果，帮助理解
      console.log('Improved parser items:', JSON.stringify(result.items, null, 2));
      
      expect(result.hasFrontmatter).toBe(true);
      expect(result.hasSummaryDivider).toBe(true);
      
      // 验证 shortcode 是否被正确提取，而不是包含在内容中
      const shortcodeItems = result.items.filter(item => item.type === 'shortcode');
      expect(shortcodeItems.length).toBe(2);
      
      // 验证第一个 shortcode 的参数是否保留引号
      const firstShortcode = shortcodeItems[0] as ShortcodeItem;
      expect(firstShortcode.name).toBe('shortcode');
      expect(firstShortcode.params).toContain('param="value"');
      
      // 验证第二个 shortcode 是否正确标记为内联
      const secondShortcode = shortcodeItems[1] as ShortcodeItem;
      expect(secondShortcode.name).toBe('shortcode2');
      expect(secondShortcode.isInline).toBe(true);
    });
  });
}); 