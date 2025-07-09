import { act, renderHook } from '@testing-library/react';
import { useSettingsStore, useAISettings, useEmailSettings, useOrganizationSettings } from '@/lib/store/use-settings';

describe('useSettingsStore', () => {
  it('updates AI settings', () => {
    const { result } = renderHook(() => useAISettings());
    act(() => {
      result.current.setModel('gpt-3.5-turbo');
      result.current.setTemperature(0.5);
      result.current.setMaxTokens(1000);
      result.current.toggleBrandVoice();
      result.current.toggleCustomPrompts();
    });
    expect(result.current.aiSettings.defaultModel).toBe('gpt-3.5-turbo');
    expect(result.current.aiSettings.temperature).toBe(0.5);
    expect(result.current.aiSettings.maxTokens).toBe(1000);
    expect(typeof result.current.aiSettings.enableBrandVoice).toBe('boolean');
    expect(typeof result.current.aiSettings.enableCustomPrompts).toBe('boolean');
  });

  it('updates email settings', () => {
    const { result } = renderHook(() => useEmailSettings());
    act(() => {
      result.current.toggleNotifications();
      result.current.togglePublishNotifications();
      result.current.toggleCommentNotifications();
      result.current.toggleMentionNotifications();
      result.current.setDigestFrequency('daily');
    });
    expect(typeof result.current.emailSettings.enableNotifications).toBe('boolean');
    expect(typeof result.current.emailSettings.notifyOnPublish).toBe('boolean');
    expect(typeof result.current.emailSettings.notifyOnComment).toBe('boolean');
    expect(typeof result.current.emailSettings.notifyOnMention).toBe('boolean');
    expect(result.current.emailSettings.digestFrequency).toBe('daily');
  });

  it('updates organization settings', () => {
    const { result } = renderHook(() => useOrganizationSettings());
    act(() => {
      result.current.setName('Test Org');
      result.current.setSlug('test-org');
      result.current.setDescription('A test org');
      result.current.togglePublicReleaseNotes();
      result.current.toggleRequireApproval();
      result.current.toggleAllowComments();
    });
    expect(result.current.organizationSettings.name).toBe('Test Org');
    expect(result.current.organizationSettings.slug).toBe('test-org');
    expect(result.current.organizationSettings.description).toBe('A test org');
    expect(typeof result.current.organizationSettings.publicReleaseNotes).toBe('boolean');
    expect(typeof result.current.organizationSettings.requireApproval).toBe('boolean');
    expect(typeof result.current.organizationSettings.allowComments).toBe('boolean');
  });
});
