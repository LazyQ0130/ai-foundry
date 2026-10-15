import { describe, expect, it, vi } from 'vitest';
import { registerToolbarAction } from '../extension/src/toolbar';

describe('toolbar event wiring only: does NOT prove a native activeTab grant', () => {
  function platform() {
    return {action:{onClicked:{addListener:vi.fn((_listener:(tab:{windowId:number})=>void)=>{})}},sidePanel:{open:vi.fn(async(_options:{windowId:number})=>{}),setPanelBehavior:vi.fn(async(_options:{openPanelOnActionClick:boolean})=>{})}};
  }
  it('resets automatic toggling to false on initialization/repeated lifecycle setup without duplicate handlers',async()=>{
    const api=platform();const setup=registerToolbarAction(api as unknown as Parameters<typeof registerToolbarAction>[0]);
    await setup();await setup();
    expect(api.sidePanel.setPanelBehavior.mock.calls).toEqual([[{openPanelOnActionClick:false}],[{openPanelOnActionClick:false}]]);
    expect(api.action.onClicked.addListener).toHaveBeenCalledOnce();
    expect(api.sidePanel.open).not.toHaveBeenCalled();
  });
  it('opens in the callback task using the clicked tab window and ignores invalid window IDs',()=>{
    const api=platform();registerToolbarAction(api as unknown as Parameters<typeof registerToolbarAction>[0]);
    const listener=api.action.onClicked.addListener.mock.calls[0][0] as (tab:{windowId:number})=>void;
    listener({windowId:10});expect(api.sidePanel.open).toHaveBeenCalledWith({windowId:10});
    listener({windowId:-1});expect(api.sidePanel.open).toHaveBeenCalledTimes(1);
  });
});
