import { defineBackground } from 'wxt/utils/define-background';
import { createSessionTokens } from '../src/context-tokens';
import { createCoordinator } from '../src/coordinator';

export default defineBackground(() => {
  const tokens = createSessionTokens(chrome.storage.session);
  const handle = createCoordinator(chrome, tokens);
  const invalidate = (tabId: number) => { void tokens.invalidate(tabId).catch(error => console.error('页面代次更新失败', error)); };
  chrome.runtime.onMessage.addListener((raw: unknown, sender, sendResponse) => {
    void handle(raw, sender).then(sendResponse).catch(() => sendResponse({ v: 1, ok: false, requestId: '', error: { code: 'CONTEXT_UNAVAILABLE', message: '后台暂不可用。' } }));
    return true;
  });
  chrome.tabs.onActivated.addListener(({ tabId }) => invalidate(tabId));
  chrome.tabs.onUpdated.addListener((tabId, change) => { if (change.status === 'loading' || change.url !== undefined) invalidate(tabId); });
  chrome.tabs.onRemoved.addListener(tabId => { void tokens.release(tabId).catch(console.error); });
  chrome.tabs.onDetached.addListener(invalidate);
  chrome.tabs.onAttached.addListener(invalidate);
  chrome.tabs.onReplaced.addListener((added, removed) => { invalidate(added); void tokens.release(removed).catch(console.error); });
  // Register listeners synchronously whenever the MV3 worker starts.
  chrome.action.onClicked.addListener((tab) => {
    if (!Number.isInteger(tab.windowId) || tab.windowId < 0) return;
    // Preserve the native gesture: do not await setup/storage/network first.
    void chrome.sidePanel.open({ windowId: tab.windowId }).catch((error) => {
      console.error('P1 侧栏打开失败：', error);
    });
  });

  const restoreActionMode = () => {
    void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch((error) => {
      console.error('P1 工具栏配置失败：', error);
    });
  };
  restoreActionMode();
  chrome.runtime.onInstalled.addListener(restoreActionMode);
  chrome.runtime.onStartup.addListener(restoreActionMode);
});
