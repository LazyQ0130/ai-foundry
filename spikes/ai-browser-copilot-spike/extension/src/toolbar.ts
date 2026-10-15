type ToolbarPlatform = Pick<typeof chrome, 'action' | 'sidePanel'>;

// The normal action route grants activeTab; automatic side-panel toggling skips that grant.
export function registerToolbarAction(api: ToolbarPlatform) {
  api.action.onClicked.addListener(tab => {
    if (!Number.isInteger(tab.windowId) || tab.windowId < 0) return;
    // Keep open() in the native event call stack; do not await other work first.
    void api.sidePanel.open({windowId:tab.windowId}).catch(console.error);
  });
  // Explicitly reset the persisted old setting on upgrade/reload as well as fresh install.
  return () => api.sidePanel.setPanelBehavior({openPanelOnActionClick:false}).catch(console.error);
}
