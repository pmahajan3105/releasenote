import { renderHook, act } from '@testing-library/react';
import { useSettingsStore, useAISettings } from '@/lib/store/use-settings';

describe('AI Context Customization', () => {
  it('should update and reset AI context fields', () => {
    const { result } = renderHook(() => useAISettings());
    act(() => {
      result.current.updateAISettings({
        defaultModel: 'claude-3-haiku',
        temperature: 0.3,
        maxTokens: 800,
        enableBrandVoice: false,
        enableCustomPrompts: false,
      });
    });
    expect(result.current.aiSettings.defaultModel).toBe('claude-3-haiku');
    expect(result.current.aiSettings.temperature).toBe(0.3);
    expect(result.current.aiSettings.maxTokens).toBe(800);
    expect(result.current.aiSettings.enableBrandVoice).toBe(false);
    expect(result.current.aiSettings.enableCustomPrompts).toBe(false);
    act(() => {
      result.current.resetAISettings();
    });
    expect(result.current.aiSettings.defaultModel).toBe('gpt-4');
  });
});
