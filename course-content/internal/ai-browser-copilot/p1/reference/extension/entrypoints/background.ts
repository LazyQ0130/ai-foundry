import { defineBackground } from 'wxt/utils/define-background';

export default defineBackground(() => {
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
