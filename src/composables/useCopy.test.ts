import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCopy } from './useCopy';
import { ElMessage } from 'element-plus';

// Mock Element Plus Message
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('useCopy', () => {
  let clipboardWriteTextMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock navigator.clipboard.writeText
    clipboardWriteTextMock = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: clipboardWriteTextMock
      }
    });

    // Mock console.error to avoid test output noise
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should copy text successfully and show success message', async () => {
    clipboardWriteTextMock.mockResolvedValue(undefined);
    const { copyToClipboard } = useCopy();

    const result = await copyToClipboard('test text');

    expect(result).toBe(true);
    expect(clipboardWriteTextMock).toHaveBeenCalledWith('test text');
    expect(ElMessage.success).toHaveBeenCalledWith('复制成功');
  });

  it('should show custom success message', async () => {
    clipboardWriteTextMock.mockResolvedValue(undefined);
    const { copyToClipboard } = useCopy();

    await copyToClipboard('test text', { success: 'Great success!' });

    expect(ElMessage.success).toHaveBeenCalledWith('Great success!');
  });

  it('should handle empty text gracefully', async () => {
    const { copyToClipboard } = useCopy();

    const result = await copyToClipboard('');

    expect(result).toBe(false);
    expect(clipboardWriteTextMock).not.toHaveBeenCalled();
    expect(ElMessage.success).not.toHaveBeenCalled();
    expect(ElMessage.error).not.toHaveBeenCalled();
  });

  it('should handle failure and show error message', async () => {
    const error = new Error('Clipboard error');
    clipboardWriteTextMock.mockRejectedValue(error);
    const { copyToClipboard } = useCopy();

    const result = await copyToClipboard('test text');

    expect(result).toBe(false);
    expect(clipboardWriteTextMock).toHaveBeenCalledWith('test text');
    expect(ElMessage.error).toHaveBeenCalledWith('复制失败');
    expect(console.error).toHaveBeenCalledWith('Clipboard copy failed:', error);
  });

  it('should show custom error message on failure', async () => {
    clipboardWriteTextMock.mockRejectedValue(new Error('fail'));
    const { copyToClipboard } = useCopy();

    await copyToClipboard('test text', { error: 'Oh no!' });

    expect(ElMessage.error).toHaveBeenCalledWith('Oh no!');
  });
});
