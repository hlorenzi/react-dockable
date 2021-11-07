import * as React from "react";
import * as Dockable from "./index.js";
export function useDockable(init) {
    return Dockable.useRefState(() => {
        const state = Dockable.makeState();
        if (init)
            init(state);
        return state;
    });
}
export const mousePos = {
    x: 0,
    y: 0,
};
window.addEventListener("mousemove", (ev) => {
    mousePos.x = ev.pageX;
    mousePos.y = ev.pageY;
});
export function spawnFloating(state, elem) {
    const panel = Dockable.makePanel(state.ref.current);
    Dockable.addNewContent(state.ref.current, panel, elem);
    panel.rect = new Dockable.Rect(mousePos.x, mousePos.y, 500, 300);
    state.ref.current.activePanel = panel;
    state.commit();
    return panel;
}
export function spawnFloatingEphemeral(state, elem) {
    const panel = spawnFloating(state, elem);
    Dockable.removeEphemerals(state.ref.current);
    panel.ephemeral = true;
    state.commit();
    return panel;
}
export const ContentContext = React.createContext(null);
export function useContentContext() {
    return React.useContext(ContentContext);
}
//# sourceMappingURL=global.js.map