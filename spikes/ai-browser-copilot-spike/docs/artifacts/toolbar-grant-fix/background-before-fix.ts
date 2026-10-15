import { defineBackground } from 'wxt/utils/define-background';
import { createCoordinator } from '../src/coordinator';

export default defineBackground(() => {
  const coordinator = createCoordinator(chrome);
  const setup = () => chrome.sidePanel.setPanelBehavior({openPanelOnActionClick:true}).catch(console.error);
  void setup();
  chrome.runtime.onStartup.addListener(setup);
  chrome.runtime.onInstalled.addListener(() => {
    void setup();
    chrome.contextMenus.create({id:'phase0-selection',title:'验证：发送选中文字到阅读侧栏',contexts:['selection','page']}, () => {void chrome.runtime.lastError;});
    void chrome.storage.local.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'});
  });
  chrome.tabs.onActivated.addListener(({tabId,windowId}) => coordinator.invalidate(tabId,windowId));
  chrome.tabs.onUpdated.addListener((tabId,change,tab) => {
    if (change.status === 'loading' || change.url) coordinator.invalidate(tabId,tab.windowId,!!tab.active);
  });
  chrome.tabs.onRemoved.addListener((tabId,info) => coordinator.invalidate(tabId,info.windowId,false));
  chrome.contextMenus.onClicked.addListener((info,tab) => {
    if (info.menuItemId === 'phase0-selection' && tab?.id) void coordinator.select(info,tab).catch(console.error);
  });
  chrome.runtime.onMessage.addListener((raw,sender,respond) => {
    void coordinator.handle(raw,sender).then(respond).catch(() => respond({ok:false,requestId:'',code:'UNKNOWN',message:'消息处理失败，请重试。'}));
    return true;
  });
});
