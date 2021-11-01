import * as React from "react"
import * as Dockable from "./index"
import styled from "styled-components"


const StyledContainer = styled.div<{
}>`
    --dockable-voidBkg: #252525;
    --dockable-panelBkg: #1e1e1e;
    --dockable-panelInactiveBorder: #393939;
    --dockable-panelActiveBorder: #777777;
    --dockable-panelTabBkg: #2d2d2d;
    --dockable-panelTabTextColor: #ffffff;
    --dockable-overlayColor: #00aaff44;
    --dockable-anchorColor: #ffffff;
    --dockable-buttonHoverBkg: #323232;
    --dockable-scrollbarColor: #777777;

    width: 100%;
    height: 100%;
    background-color: var(--dockable-voidBkg);
`


const StyledContentRoot = styled.div<{
    isCurrentTab: boolean
}>`
    display: ${ props => props.isCurrentTab ? "grid" : "none" };
    grid-template: 100% / 100%;

    position: absolute;
    box-sizing: border-box;
    contain: strict;

    color: #fff;
    text-align: left;

    background-color: transparent;
    border-radius: 0.5em;
    overflow: hidden;
`


const StyledContentInner = styled.div`
    grid-row: 1;
    grid-column: 1;
    width: 100%;
    height: 100%;
`


const StyledBottomRightResizeHandle = styled.div<{
    size: number,
}>`
    width: ${ props => props.size }px;
    height: ${ props => props.size }px;

    grid-row: 1;
    grid-column: 1;
    align-self: end;
    justify-self: end;

    cursor: nwse-resize;
    z-index: 1;
`


const StyledDivider = styled.div`
    &:hover
    {
        background-color: var(--dockable-overlayColor);
    }
`


export function Container(props: {
    state: Dockable.RefState<Dockable.State>,   
})
{
    const [rect, setRect] = React.useState(new Dockable.Rect(0, 0, 0, 0))
    const rootRef = React.useRef<HTMLDivElement>(null)


    React.useLayoutEffect(() =>
    {
        const onResize = () =>
        {
            if (!rootRef.current)
                return
    
            const elemRect = rootRef.current!.getBoundingClientRect()

            setRect(new Dockable.Rect(
                elemRect.x,
                elemRect.y,
                elemRect.width,
                elemRect.height))
        }

        onResize()

        window.addEventListener("resize", onResize)
        return () => window.removeEventListener("resize", onResize)

    }, [])


    const layoutRef = React.useRef<Dockable.Layout>(null!)
    const rectRef = React.useRef<Dockable.Rect>(null!)
    rectRef.current = rect
    layoutRef.current = React.useMemo(() =>
    {
        return Dockable.getLayout(props.state.ref.current, new Dockable.Rect(rect.x, rect.y, rect.w - 1, rect.h - 1))

    }, [rect, props.state.update])


    React.useEffect(() =>
    {
        const onRefreshPreferredSize = () =>
        {
            for (const panel of props.state.ref.current.floatingPanels)
            {
                if (!panel.justOpened)
                    continue
                
                panel.justOpened = false
                panel.rect.w = panel.preferredFloatingSize.w
                panel.rect.h = panel.preferredFloatingSize.h

                switch (panel.justOpenedAnchorAlignX)
                {
                    case 0:
                        panel.rect.x = panel.justOpenedAnchorRect.xCenter - panel.rect.w / 2
                        break
                    case 1:
                        panel.rect.x = panel.justOpenedAnchorRect.x2
                        break
                    case -1:
                        panel.rect.x = panel.justOpenedAnchorRect.x1 - panel.rect.w
                        break
                }
                
                switch (panel.justOpenedAnchorAlignY)
                {
                    case 0:
                        panel.rect.y = panel.justOpenedAnchorRect.yCenter - panel.rect.h / 2
                        break
                    case 1:
                        panel.rect.y = panel.justOpenedAnchorRect.y2
                        break
                    case -1:
                        panel.rect.y = panel.justOpenedAnchorRect.y1 - panel.rect.h
                        break
                }

                Dockable.clampFloatingPanelStrictly(props.state.ref.current, panel, rectRef.current)
                props.state.commit()
            }
        }

        window.addEventListener("dockableRefreshPreferredSize", onRefreshPreferredSize)
        return () => window.removeEventListener("dockableRefreshPreferredSize", onRefreshPreferredSize)

    }, [])

    
    const mouseData = Dockable.useMouseHandler(props.state, layoutRef, rectRef)

    const anchorSize = 5
    const resizeHandleSize = 20
    const dividerSize = 6
    const tabHeight = 25

    return <StyledContainer
        ref={ rootRef }
    >

        { layoutRef.current.panelRects.map(panelRect =>
            <Dockable.ContainerPanel
                key={ panelRect.panel.id }
                state={ props.state }
                panelRect={ panelRect }
                tabHeight={ tabHeight }
                mouseHandler={ mouseData }
            />
        )}

        { layoutRef.current.content.map(w =>
        {
            const setTitle = (title: string) =>
            {
                if (w.content.title != title)
                {
                    window.requestAnimationFrame(() =>
                    {
                        w.content.title = title
                        props.state.commit()
                    })
                }
            }

            const setPreferredSize = (width: number, height: number) =>
            {
                if (w.tabIndex == w.panel.tabIndex &&
                    (width != w.panel.preferredFloatingSize.w ||
                    height != w.panel.preferredFloatingSize.h))
                {
                    window.requestAnimationFrame(() =>
                    {
                        w.panel.preferredFloatingSize = new Dockable.Rect(0, 0, width, height)
                        props.state.commit()

                        if (w.panel.justOpened)
                            window.dispatchEvent(new Event("dockableRefreshPreferredSize"))
                    })
                }
            }

            return <StyledContentRoot
                key={ w.content.contentId }
                onMouseDown={ ((ev: MouseEvent) => mouseData.onPanelActivate(ev, w.panel)) as any }
                isCurrentTab={ w.panel.tabIndex == w.tabIndex }
                style={{
                    left: w.panelRect.rect.x,
                    top: w.panelRect.rect.y + tabHeight,
                    width: w.panelRect.rect.w,
                    height: w.panelRect.rect.h - tabHeight,
                    zIndex: w.panelRect.zIndex * 3 + 1,
            }}>
                <Dockable.WindowContext.Provider
                    value={{
                        panel: w.panel,
                        contentId: w.content.contentId,

                        setTitle,
                        setPreferredSize,
                }}>
                    <StyledContentInner>
                        { w.content.element }
                    </StyledContentInner>
                </Dockable.WindowContext.Provider>
                
                { !w.panel.floating ? null : 
                    <StyledBottomRightResizeHandle
                        onMouseDown={ ((ev: MouseEvent) => mouseData.onPanelResize(ev, w.panel)) as any }
                        size={ resizeHandleSize }
                    />
                }
            </StyledContentRoot>
        })}

        { layoutRef.current.dividers.map(divider =>
            <StyledDivider
                onMouseDown={ ((ev: MouseEvent) => mouseData.onDividerResize(ev, divider)) as any }
                style={{
                    width: (divider.rect.w || dividerSize) + "px",
                    height: (divider.rect.h || dividerSize) + "px",

                    position: "absolute",
                    left: (divider.rect.x - (!divider.vertical ? dividerSize / 2 : 0)) + "px",
                    top: (divider.rect.y - (divider.vertical ? dividerSize / 2 : 0)) + "px",

                    cursor: !divider.vertical ?
                        "ew-resize" :
                        "ns-resize",

                    zIndex: 1,
            }}/>
        )}

        { !mouseData.showAnchors || !mouseData.draggingAnchor ? null :
            <div style={{
                position: "absolute",
                left: (mouseData.draggingAnchor.previewRect.x1) + "px",
                top: (mouseData.draggingAnchor.previewRect.y1) + "px",
                width: (mouseData.draggingAnchor.previewRect.x2 - mouseData.draggingAnchor.previewRect.x1 - 1) + "px",
                height: (mouseData.draggingAnchor.previewRect.y2 - mouseData.draggingAnchor.previewRect.y1 - 1) + "px",

                backgroundColor: "var(--dockable-overlayColor)",
                zIndex: 1000,
            }}/>
        }

        { !mouseData.showAnchors ? null : layoutRef.current.anchors.map((anchor, i) =>
            anchor.panel == mouseData.grabbedPanel ? null :
                <div key={ i } style={{
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
                }}/>
        )}

    </StyledContainer>
}