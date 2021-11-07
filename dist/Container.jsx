import * as React from "react";
import * as Dockable from "./index.js";
import styled from "styled-components";
const StyledContainer = styled.div `
    --dockable-voidBkg: #252525;
    --dockable-panelBkg: #1e1e1e;
    --dockable-panelInactiveBorder: #393939;
    --dockable-panelActiveBorder: #777777;
    --dockable-panelTabBkg: #2d2d2d;
    --dockable-panelTabTextColor: #ffffff;
    --dockable-overlayColor: #00aaff44;
    --dockable-anchorColor: #00aaff;
    --dockable-buttonHoverBkg: #323232;
    --dockable-scrollbarColor: #777777;

    width: 100%;
    height: 100%;
    background-color: var(--dockable-voidBkg);
`;
const StyledContentRoot = styled.div `
    display: ${props => props.isCurrentTab ? "grid" : "none"};
    grid-template: 100% / 100%;

    position: absolute;
    box-sizing: border-box;
    contain: strict;

    color: #fff;
    text-align: left;

    background-color: transparent;
    overflow: hidden;
`;
const StyledContentInner = styled.div `
    grid-row: 1;
    grid-column: 1;
    width: 100%;
    height: 100%;
`;
const StyledBottomRightResizeHandle = styled.div `
    width: ${props => props.size}px;
    height: ${props => props.size}px;

    grid-row: 1;
    grid-column: 1;
    align-self: end;
    justify-self: end;

    cursor: nwse-resize;
    z-index: 1;

    &:hover
    {
        background-color: var(--dockable-overlayColor);
    }
`;
const StyledDivider = styled.div `
    &:hover
    {
        background-color: var(--dockable-overlayColor);
    }
`;
export function Container(props) {
    const [rect, setRect] = React.useState(new Dockable.Rect(0, 0, 0, 0));
    const rootRef = React.useRef(null);
    const anchorSize = props.anchorSize ?? 5;
    const resizeHandleSize = props.anchorSize ?? 10;
    const dividerSize = props.anchorSize ?? 6;
    const tabHeight = props.anchorSize ?? 25;
    React.useLayoutEffect(() => {
        const onResize = () => {
            if (!rootRef.current)
                return;
            const elemRect = rootRef.current.getBoundingClientRect();
            setRect(new Dockable.Rect(elemRect.x, elemRect.y, elemRect.width, elemRect.height));
        };
        onResize();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);
    const rectRef = React.useRef(null);
    rectRef.current = rect;
    const layoutRef = React.useRef(null);
    layoutRef.current = React.useMemo(() => {
        return Dockable.getLayout(props.state.ref.current, new Dockable.Rect(rect.x, rect.y, rect.w - 1, rect.h - 1));
    }, [rect, props.state.updateToken]);
    const setTitle = (layoutContent, title) => {
        if (layoutContent.content.title != title) {
            window.requestAnimationFrame(() => {
                layoutContent.content.title = title;
                props.state.commit();
            });
        }
    };
    const setPreferredSize = (layoutContent, width, height) => {
        if (layoutContent.tabIndex == layoutContent.panel.currentTabIndex &&
            (width != layoutContent.panel.preferredWidth ||
                height != layoutContent.panel.preferredHeight)) {
            window.requestAnimationFrame(() => {
                layoutContent.panel.preferredWidth = width;
                layoutContent.panel.preferredHeight = height;
                layoutContent.panel.rect = new Dockable.Rect(layoutContent.panel.rect.x, layoutContent.panel.rect.y, width, height);
                props.state.commit();
            });
        }
    };
    return <StyledContainer ref={rootRef}>

        {layoutRef.current.panelRects.map(panelRect => <Dockable.ContainerPanel key={panelRect.panel.id} state={props.state} panelRect={panelRect} tabHeight={tabHeight} onClickPanel={() => handleClickedPanel(props.state, panelRect.panel, null)} onClickTab={(tabNumber) => handleClickedPanel(props.state, panelRect.panel, tabNumber)} onCloseTab={(ev, tabNumber) => handleClosedTab(ev, props.state, panelRect.panel, tabNumber)} onDragHeader={(ev, tabNumber) => handleDraggedHeader(ev, props.state, layoutRef, rectRef, panelRect.panel, tabNumber)}/>)}

        {layoutRef.current.content.map(layoutContent => <StyledContentRoot key={layoutContent.content.contentId} isCurrentTab={layoutContent.panel.currentTabIndex == layoutContent.tabIndex} onMouseDown={() => handleClickedPanel(props.state, layoutContent.panel, null)} style={{
                left: (layoutContent.layoutPanel.rect.x) + "px",
                top: (layoutContent.layoutPanel.rect.y + tabHeight) + "px",
                width: (layoutContent.layoutPanel.rect.w) + "px",
                height: (layoutContent.layoutPanel.rect.h - tabHeight) + "px",
                zIndex: layoutContent.layoutPanel.zIndex * 3 + 1,
            }}>
                <Dockable.ContentContext.Provider value={{
                layoutContent,
                setTitle: (title) => setTitle(layoutContent, title),
                setPreferredSize: (w, h) => setPreferredSize(layoutContent, w, h),
            }}>
                    <StyledContentInner>
                        {layoutContent.content.element}
                    </StyledContentInner>
                </Dockable.ContentContext.Provider>
                
                {layoutContent.panel.floating &&
                <StyledBottomRightResizeHandle size={resizeHandleSize} onMouseDown={ev => {
                        handleClickedPanel(props.state, layoutContent.panel, null);
                        handleDraggedEdge(ev, props.state, layoutRef, layoutContent.panel);
                    }}/>}
            </StyledContentRoot>)}

        {layoutRef.current.dividers.map((divider, i) => <StyledDivider key={i} onMouseDown={ev => handleDraggedDivider(ev, props.state, divider)} style={{
                width: (divider.rect.w || dividerSize) + "px",
                height: (divider.rect.h || dividerSize) + "px",
                position: "absolute",
                left: (divider.rect.x - (!divider.vertical ? dividerSize / 2 : 0)) + "px",
                top: (divider.rect.y - (divider.vertical ? dividerSize / 2 : 0)) + "px",
                cursor: !divider.vertical ?
                    "ew-resize" :
                    "ns-resize",
                zIndex: 1,
                userSelect: "none",
            }}/>)}

        {props.state.ref.current.previewAnchor &&
            <div style={{
                    position: "absolute",
                    left: (props.state.ref.current.previewAnchor.previewRect.x) + "px",
                    top: (props.state.ref.current.previewAnchor.previewRect.y) + "px",
                    width: (props.state.ref.current.previewAnchor.previewRect.w - 1) + "px",
                    height: (props.state.ref.current.previewAnchor.previewRect.h - 1) + "px",
                    backgroundColor: "var(--dockable-overlayColor)",
                    zIndex: 1000,
                }}/>}

        {props.state.ref.current.showAnchors &&
            layoutRef.current.anchors.map((anchor, i) => props.state.ref.current.draggedPanel !== anchor.panel &&
                <div key={i} style={{
                        position: "absolute",
                        left: (anchor.x - anchorSize) + "px",
                        top: (anchor.y - anchorSize) + "px",
                        width: "0px",
                        height: "0px",
                        borderTop: (anchorSize) + "px solid " + (anchor.mode == Dockable.DockMode.Bottom || anchor.mode == Dockable.DockMode.Full ? "var(--dockable-anchorColor)" : "transparent"),
                        borderBottom: (anchorSize) + "px solid " + (anchor.mode == Dockable.DockMode.Top || anchor.mode == Dockable.DockMode.Full ? "var(--dockable-anchorColor)" : "transparent"),
                        borderLeft: (anchorSize) + "px solid " + (anchor.mode == Dockable.DockMode.Right || anchor.mode == Dockable.DockMode.Full ? "var(--dockable-anchorColor)" : "transparent"),
                        borderRight: (anchorSize) + "px solid " + (anchor.mode == Dockable.DockMode.Left || anchor.mode == Dockable.DockMode.Full ? "var(--dockable-anchorColor)" : "transparent"),
                        zIndex: 1001,
                    }}/>)}

    </StyledContainer>;
}
function handleDraggedDivider(ev, state, divider) {
    ev.preventDefault();
    const onMouseMove = (ev) => {
        const mouseX = ev.pageX;
        const mouseY = ev.pageY;
        divider.panel.splitSize =
            Math.max(0.05, Math.min(0.95, ((divider.vertical ? mouseY : mouseX) - divider.resizeMin) /
                (divider.resizeMax - divider.resizeMin)));
        state.commit();
    };
    const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
}
function handleDraggedEdge(ev, state, layout, panel) {
    ev.preventDefault();
    ev.stopPropagation();
    const startMouseX = ev.pageX;
    const startMouseY = ev.pageY;
    const layoutPanel = layout.current.panelRects.find(p => p.panel === panel);
    const startPanelRect = layoutPanel.rect;
    const onMouseMove = (ev) => {
        const mouseX = ev.pageX;
        const mouseY = ev.pageY;
        panel.rect = new Dockable.Rect(startPanelRect.x, startPanelRect.y, Math.max(150, startPanelRect.w + mouseX - startMouseX), Math.max(50, startPanelRect.h + mouseY - startMouseY));
        state.commit();
    };
    const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
}
function handleDraggedHeader(ev, state, layout, containerRect, draggedPanel, draggedTabIndex) {
    ev.preventDefault();
    ev.stopPropagation();
    const startMouseX = ev.pageX;
    const startMouseY = ev.pageY;
    const layoutPanel = layout.current.panelRects.find(p => p.panel === draggedPanel);
    let startPanelRect = layoutPanel.rect;
    let dragLocked = true;
    const onMouseMove = (ev) => {
        const mouseX = ev.pageX;
        const mouseY = ev.pageY;
        // Start dragging only when mouse moves far enough, and
        // undock panel at this moment if originally docked
        if (Math.abs(mouseX - startMouseX) > 10 ||
            Math.abs(mouseY - startMouseY) > 10) {
            dragLocked = false;
            const floatingRect = new Dockable.Rect(mouseX - Math.min(draggedPanel.preferredWidth / 2, mouseX - startPanelRect.x), mouseY - (mouseY - startPanelRect.y), draggedPanel.preferredWidth, draggedPanel.preferredHeight);
            if (draggedTabIndex !== null && draggedPanel.contentList.length > 1) {
                // Remove single tab content from original panel and
                // transfer it to a new floating panel
                const content = draggedPanel.contentList[draggedTabIndex];
                Dockable.removeContent(state.ref.current, draggedPanel, content.contentId);
                draggedPanel = Dockable.makePanel(state.ref.current);
                Dockable.addContent(state.ref.current, draggedPanel, content);
                Dockable.coallesceEmptyPanels(state.ref.current);
                draggedPanel.rect = startPanelRect = floatingRect;
            }
            else if (!draggedPanel.floating) {
                // Remove original docked panel and
                // transfer all content to a new floating panel
                const contents = [...draggedPanel.contentList];
                const originalTabIndex = draggedPanel.currentTabIndex;
                for (const content of contents)
                    Dockable.removeContent(state.ref.current, draggedPanel, content.contentId);
                draggedPanel = Dockable.makePanel(state.ref.current);
                for (const content of contents)
                    Dockable.addContent(state.ref.current, draggedPanel, content);
                draggedPanel.currentTabIndex = originalTabIndex;
                Dockable.coallesceEmptyPanels(state.ref.current);
                draggedPanel.rect = startPanelRect = floatingRect;
            }
            state.ref.current.draggedPanel = draggedPanel;
            state.ref.current.showAnchors = true;
            state.commit();
        }
        // Handle actual dragging
        if (!dragLocked) {
            // Move panel rect
            draggedPanel.rect = startPanelRect.displace(mouseX - startMouseX, mouseY - startMouseY);
            // Find nearest anchor
            let nearestDistSqr = 50 * 50;
            state.ref.current.previewAnchor = null;
            for (const anchor of layout.current.anchors) {
                if (anchor.panel === draggedPanel)
                    continue;
                const xx = anchor.x - mouseX;
                const yy = anchor.y - mouseY;
                const distSqr = xx * xx + yy * yy;
                if (distSqr < nearestDistSqr) {
                    nearestDistSqr = distSqr;
                    state.ref.current.previewAnchor = anchor;
                }
            }
            state.commit();
        }
    };
    const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        // Dock dragged panel if near an anchor
        if (state.ref.current.previewAnchor) {
            Dockable.dock(state.ref.current, draggedPanel, state.ref.current.previewAnchor.panel, state.ref.current.previewAnchor.mode);
        }
        Dockable.clampFloatingPanels(state.ref.current, containerRect.current);
        state.ref.current.draggedPanel = null;
        state.ref.current.showAnchors = false;
        state.ref.current.previewAnchor = null;
        state.commit();
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
}
function handleClickedPanel(state, clickedPanel, tabNumber) {
    if (tabNumber !== null) {
        clickedPanel.currentTabIndex = tabNumber;
    }
    Dockable.setPanelActiveAndBringToFront(state.ref.current, clickedPanel);
    state.commit();
}
function handleClosedTab(ev, state, panel, tabNumber) {
    ev.preventDefault();
    const content = panel.contentList[tabNumber];
    Dockable.removeContent(state.ref.current, panel, content.contentId);
    Dockable.coallesceEmptyPanels(state.ref.current);
    state.commit();
}
//# sourceMappingURL=Container.jsx.map