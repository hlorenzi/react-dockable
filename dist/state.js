import { Rect } from "./rect.js";
export var SplitMode;
(function (SplitMode) {
    SplitMode[SplitMode["LeftRight"] = 0] = "LeftRight";
    SplitMode[SplitMode["TopBottom"] = 1] = "TopBottom";
})(SplitMode || (SplitMode = {}));
export var DockMode;
(function (DockMode) {
    DockMode[DockMode["Full"] = 0] = "Full";
    DockMode[DockMode["Left"] = 1] = "Left";
    DockMode[DockMode["Right"] = 2] = "Right";
    DockMode[DockMode["Top"] = 3] = "Top";
    DockMode[DockMode["Bottom"] = 4] = "Bottom";
})(DockMode || (DockMode = {}));
export function makeState() {
    return {
        idNext: 2,
        rootPanel: {
            id: 1,
            floating: false,
            rect: new Rect(0, 0, 0, 0),
            contentList: [],
            currentTabIndex: 0,
            splitPanels: [],
            splitMode: SplitMode.LeftRight,
            splitSize: 0.5,
            preferredWidth: 300,
            preferredHeight: 250,
            ephemeral: false,
        },
        floatingPanels: [],
        activePanel: null,
        draggedPanel: null,
        showAnchors: false,
        previewAnchor: null,
    };
}
export function makePanel(state) {
    const id = state.idNext++;
    const panel = {
        id,
        floating: true,
        rect: new Rect(0, 0, 0, 0),
        contentList: [],
        currentTabIndex: 0,
        splitPanels: [],
        splitMode: SplitMode.LeftRight,
        splitSize: 0.5,
        preferredWidth: 300,
        preferredHeight: 250,
        ephemeral: false,
    };
    state.floatingPanels.push(panel);
    return panel;
}
export function createDockedPanel(state, dockIntoPanel, mode, content) {
    const panel = makePanel(state);
    addNewContent(state, panel, content);
    dock(state, panel, dockIntoPanel, mode);
    return panel;
}
export function detachPanel(state, panel) {
    if (!panel.floating) {
        panel.floating = true;
        state.activePanel = panel;
        state.floatingPanels.push(panel);
    }
}
export function addNewContent(state, toPanel, element) {
    const id = state.idNext++;
    toPanel.contentList.push({
        contentId: id,
        title: "",
        element,
    });
    toPanel.currentTabIndex = toPanel.contentList.length - 1;
    toPanel.ephemeral = false;
}
export function addContent(state, toPanel, content) {
    const id = state.idNext++;
    toPanel.contentList.push(content);
    toPanel.currentTabIndex = toPanel.contentList.length - 1;
    toPanel.ephemeral = false;
}
export function removeContent(state, fromPanel, contentId) {
    const index = fromPanel.contentList.findIndex(w => w.contentId === contentId);
    if (index < 0)
        return;
    fromPanel.contentList.splice(index, 1);
    fromPanel.currentTabIndex =
        Math.max(0, Math.min(fromPanel.contentList.length - 1, fromPanel.currentTabIndex));
}
export function removeEphemerals(state) {
    for (var i = 0; i < state.floatingPanels.length; i++)
        removeEphemeralsRecursive(state, state.floatingPanels[i]);
    coallesceEmptyPanels(state);
}
export function removeEphemeralsRecursive(state, fromPanel) {
    for (var i = 0; i < fromPanel.splitPanels.length; i++)
        coallesceEmptyPanelsRecursive(state, fromPanel.splitPanels[i]);
    if (fromPanel.ephemeral) {
        fromPanel.contentList = [];
        fromPanel.currentTabIndex = 0;
    }
}
export function coallesceEmptyPanels(state) {
    coallesceEmptyPanelsRecursive(state, state.rootPanel);
    for (var i = 0; i < state.floatingPanels.length; i++)
        coallesceEmptyPanelsRecursive(state, state.floatingPanels[i]);
    state.floatingPanels = state.floatingPanels.filter(p => p.contentList.length != 0 || p.splitPanels.length != 0);
}
export function coallesceEmptyPanelsRecursive(state, fromPanel) {
    for (var i = 0; i < fromPanel.splitPanels.length; i++)
        coallesceEmptyPanelsRecursive(state, fromPanel.splitPanels[i]);
    fromPanel.splitPanels = fromPanel.splitPanels.filter(p => p.contentList.length != 0 || p.splitPanels.length != 0);
    if (fromPanel.splitPanels.length == 1)
        Object.assign(fromPanel, fromPanel.splitPanels[0]);
}
export function dock(state, panel, dockIntoPanel, mode) {
    if (mode == DockMode.Full ||
        (dockIntoPanel.contentList.length == 0 && dockIntoPanel.splitPanels.length == 0)) {
        if (dockIntoPanel.splitPanels.length > 0)
            throw "invalid full docking into subdivided panel";
        for (const window of panel.contentList)
            addContent(state, dockIntoPanel, window);
        detachPanel(state, panel);
        panel.contentList = [];
        state.floatingPanels = state.floatingPanels.filter(p => p !== panel);
        state.activePanel = dockIntoPanel;
    }
    else if (mode == DockMode.Right ||
        mode == DockMode.Left ||
        mode == DockMode.Top ||
        mode == DockMode.Bottom) {
        const subdivMode = (mode == DockMode.Right || mode == DockMode.Left) ?
            SplitMode.LeftRight :
            SplitMode.TopBottom;
        const subdivOriginalFirst = (mode == DockMode.Bottom || mode == DockMode.Right);
        const newSubpanels = [panel];
        const newSubpanel = makePanel(state);
        newSubpanel.contentList = dockIntoPanel.contentList;
        newSubpanel.currentTabIndex = dockIntoPanel.currentTabIndex;
        newSubpanel.splitMode = dockIntoPanel.splitMode;
        newSubpanel.splitPanels = dockIntoPanel.splitPanels;
        newSubpanel.splitSize = dockIntoPanel.splitSize;
        dockIntoPanel.contentList = [];
        dockIntoPanel.splitPanels = newSubpanels;
        dockIntoPanel.splitMode = subdivMode;
        dockIntoPanel.splitSize = subdivOriginalFirst ? 0.75 : 0.25;
        if (subdivOriginalFirst)
            newSubpanels.unshift(newSubpanel);
        else
            newSubpanels.push(newSubpanel);
        panel.floating = false;
        dockIntoPanel.floating = false;
        newSubpanel.floating = false;
        state.activePanel = panel;
        state.floatingPanels = state.floatingPanels.filter(p => p !== panel && p !== newSubpanel);
    }
    else {
        throw "invalid docking";
    }
}
export function setPanelActiveAndBringToFront(state, panel) {
    if (panel.contentList.length != 0)
        state.activePanel = panel;
    if (!panel.floating)
        return;
    state.floatingPanels = state.floatingPanels.filter(p => p !== panel);
    state.floatingPanels.push(panel);
    if (!panel.ephemeral)
        removeEphemerals(state);
}
export function clampFloatingPanels(state, rect) {
    const margin = 10;
    for (const panel of state.floatingPanels) {
        panel.rect.x =
            Math.max(rect.x + margin - panel.rect.w / 2, Math.min(rect.x2 - margin - panel.rect.w / 2, panel.rect.x));
        panel.rect.y =
            Math.max(rect.y + margin, Math.min(rect.y2 - margin - panel.rect.h / 2, panel.rect.y));
    }
}
export function clampFloatingPanelStrictly(state, panel, rect) {
    const margin = 10;
    panel.rect.x =
        Math.max(rect.x + margin, Math.min(rect.x2 - margin - panel.rect.w, panel.rect.x));
    panel.rect.y =
        Math.max(rect.y + margin, Math.min(rect.y2 - margin - panel.rect.h, panel.rect.y));
}
export function traverseLayout(panel, rect, layout) {
    const xMid = (rect.x1 + rect.x2) / 2;
    const yMid = (rect.y1 + rect.y2) / 2;
    if (panel.splitPanels.length == 2) {
        if (panel.splitMode == SplitMode.LeftRight) {
            const xSplit = rect.x1 + Math.round((rect.x2 - rect.x1) * panel.splitSize);
            const rect1 = rect.withX2(xSplit);
            const rect2 = rect.withX1(xSplit);
            const rectDivider = rect.withX1(xSplit).withX2(xSplit);
            traverseLayout(panel.splitPanels[0], rect1, layout);
            traverseLayout(panel.splitPanels[1], rect2, layout);
            layout.dividers.push({
                panel,
                vertical: false,
                rect: rectDivider,
                resizeMin: rect.x1,
                resizeMax: rect.x2,
            });
        }
        else if (panel.splitMode == SplitMode.TopBottom) {
            const ySplit = rect.y1 + Math.round((rect.y2 - rect.y1) * panel.splitSize);
            const rect1 = rect.withY2(ySplit);
            const rect2 = rect.withY1(ySplit);
            const rectDivider = rect.withY1(ySplit).withY2(ySplit);
            traverseLayout(panel.splitPanels[0], rect1, layout);
            traverseLayout(panel.splitPanels[1], rect2, layout);
            layout.dividers.push({
                panel,
                vertical: true,
                rect: rectDivider,
                resizeMin: rect.y1,
                resizeMax: rect.y2,
            });
        }
    }
    else {
        const panelRect = {
            panel,
            rect,
            floating: false,
            zIndex: 0,
        };
        for (let w = 0; w < panel.contentList.length; w++) {
            layout.content.push({
                content: panel.contentList[w],
                tabIndex: w,
                panel,
                layoutPanel: panelRect,
            });
        }
        layout.panelRects.push(panelRect);
        layout.anchors.push({
            panel,
            x: xMid,
            y: yMid,
            mode: DockMode.Full,
            previewRect: rect,
        });
    }
    layout.anchors.push({
        panel,
        x: rect.x2 - 10,
        y: yMid,
        mode: DockMode.Right,
        previewRect: rect.withX1(rect.x1 + (rect.x2 - rect.x1) * 3 / 4),
    });
    layout.anchors.push({
        panel,
        x: rect.x1 + 10,
        y: yMid,
        mode: DockMode.Left,
        previewRect: rect.withX2(rect.x1 + (rect.x2 - rect.x1) / 4),
    });
    layout.anchors.push({
        panel,
        x: xMid,
        y: rect.y2 - 10,
        mode: DockMode.Bottom,
        previewRect: rect.withY1(rect.y1 + (rect.y2 - rect.y1) * 3 / 4),
    });
    layout.anchors.push({
        panel,
        x: xMid,
        y: rect.y1 + 10,
        mode: DockMode.Top,
        previewRect: rect.withY2(rect.y1 + (rect.y2 - rect.y1) / 4),
    });
}
export function getLayout(state, rect) {
    const layout = {
        panelRects: [],
        content: [],
        dividers: [],
        anchors: [],
    };
    traverseLayout(state.rootPanel, rect, layout);
    for (let fp = 0; fp < state.floatingPanels.length; fp++) {
        const floatingPanel = state.floatingPanels[fp];
        const panelRect = {
            panel: floatingPanel,
            rect: floatingPanel.rect,
            floating: true,
            zIndex: fp + 1,
        };
        for (let w = 0; w < floatingPanel.contentList.length; w++) {
            layout.content.push({
                content: floatingPanel.contentList[w],
                tabIndex: w,
                panel: floatingPanel,
                layoutPanel: panelRect,
            });
        }
        layout.panelRects.push(panelRect);
        layout.anchors.push({
            panel: floatingPanel,
            x: floatingPanel.rect.xCenter,
            y: floatingPanel.rect.yCenter,
            mode: DockMode.Full,
            previewRect: floatingPanel.rect,
        });
    }
    return layout;
}
export function getContentRect(state, rect, contentId) {
    const layout = getLayout(state, rect);
    return layout.panelRects.find(p => p.panel.contentList.some(c => c.contentId === contentId)).rect;
}
//# sourceMappingURL=state.js.map