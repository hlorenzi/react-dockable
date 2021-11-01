import * as React from "react"
import * as Dockable from "./index"


interface MouseHandlerState
{
    mouseDown: boolean
    mouseDownPos: MousePos
    mouseAction: MouseAction
    mousePos: MousePos
    mouseDragLocked: boolean

    grabbedPanel: Dockable.Panel | null
    grabbedTab: number | null
    grabbedDivider: Dockable.Divider | null
    nearestAnchor: Dockable.Anchor | null
}


enum MouseAction
{
    None,
    MoveHeader,
    ResizePanel,
    ResizeDivider,
}


interface MousePos
{
    x: number
    y: number
}


export interface MouseHandlerData
{
    grabbedPanel: Dockable.Panel | null
    showAnchors: boolean
    draggingAnchor: Dockable.Anchor | null
    onPanelActivate: (ev: MouseEvent, panel: Dockable.Panel) => void
    onPanelHeaderMouseDown: (ev: MouseEvent, panel: Dockable.Panel) => void
    onPanelTabMouseDown: (ev: MouseEvent, panel: Dockable.Panel, tab: number) => void
    onPanelResize: (ev: MouseEvent, panel: Dockable.Panel) => void
    onDividerResize: (ev: MouseEvent, divider: Dockable.Divider) => void
    onPanelTabClose: (ev: MouseEvent, panel: Dockable.Panel, tab: number) => void
}


export function useMouseHandler(
    refState: Dockable.RefState<Dockable.State>,
    layoutRef: React.MutableRefObject<Dockable.Layout>,
    rectRef: React.MutableRefObject<Dockable.Rect>)
    : MouseHandlerData
{
    const stateRef = Dockable.useRefState<MouseHandlerState>(() =>
    {
        return {
            mouseDown: false,
            mouseDownPos: { x: 0, y: 0 },
            mouseAction: MouseAction.None,
            mousePos: { x: 0, y: 0 },
            mouseDragLocked: true,

            grabbedPanel: null,
            grabbedTab: null,
            grabbedDivider: null,
            nearestAnchor: null,
        }
    })

    const transformMouse = (ev: MouseEvent): MousePos =>
    {
        return {
            x: ev.pageX,
            y: ev.pageY,
        }
    }

    const bringToFront = (ev: any, panel: Dockable.Panel) =>
    {
        const dockable = refState.ref.current
        if (panel.contentList.length != 0)
            dockable.activePanel = panel

        if (!panel.floating)
        {
            refState.commit()
            return
        }

        if (dockable.floatingPanels.some(p => p.bugfixAppearOnTop))
        {
            dockable.floatingPanels.forEach(p => p.bugfixAppearOnTop = false)
            return
        }

        dockable.floatingPanels = dockable.floatingPanels.filter(p => p !== panel)
        dockable.floatingPanels.push(panel)
        
        console.log("bringToFront", panel, ev.clickedEphemeral)
        if (!panel.ephemeral && !ev.clickedEphemeral)
            Dockable.removeEphemerals(dockable)
     
        refState.commit()
    }
    
    React.useEffect(() =>
    {
        const onMouseMove = (ev: MouseEvent) =>
        {
            const dockable = refState.ref.current
            const state = stateRef.ref.current
            const mousePosPrev = state.mousePos
            state.mousePos = transformMouse(ev)

            if (state.mouseDown)
            {
                ev.preventDefault()

                if (state.mouseAction == MouseAction.ResizePanel)
                {
                    state.grabbedPanel!.rect.w += state.mousePos.x - mousePosPrev.x
                    state.grabbedPanel!.rect.h += state.mousePos.y - mousePosPrev.y
                }
                else if (state.mouseAction == MouseAction.ResizeDivider)
                {
                    const divider = state.grabbedDivider!
                    divider.panel.splitSize = Math.max(0.05, Math.min(0.95,
                        ((divider.vertical ? state.mousePos.y : state.mousePos.x) - divider.resizeMin) /
                        (divider.resizeMax - divider.resizeMin)
                    ))
                }
                else if (state.mouseDragLocked)
                {
                    if (Math.abs(state.mousePos.x - state.mouseDownPos.x) > 10 ||
                        Math.abs(state.mousePos.y - state.mouseDownPos.y) > 10)
                    {
                        state.mouseDragLocked = false

                        if (state.mouseAction == MouseAction.MoveHeader)
                        {
                            if (state.grabbedTab === null || state.grabbedPanel!.contentList.length == 1)
                            {
                                if (!state.grabbedPanel!.floating)
                                {
                                    const windows = [...state.grabbedPanel!.contentList]
                                    for (const window of windows)
                                        Dockable.removeContent(dockable, state.grabbedPanel!, window.contentId)
                                    
                                    state.grabbedPanel = Dockable.makePanel(dockable)
                                    for (const window of windows)
                                        Dockable.addContent(dockable, state.grabbedPanel, window)

                                    Dockable.coallesceEmptyPanels(dockable)
                                        
                                    state.grabbedPanel!.rect = new Dockable.Rect(state.mousePos.x, state.mousePos.y, 250, 150)
                                    state.grabbedPanel!.justOpenedAnchorRect = new Dockable.Rect(state.mousePos.x, state.mousePos.y, 250, 150)
                                    state.grabbedPanel!.justOpenedAnchorAlignX = 0
                                    state.grabbedPanel!.justOpenedAnchorAlignY = 1
                                }
                            }
                            else
                            {
                                const window = state.grabbedPanel!.contentList[state.grabbedTab]
                                Dockable.removeContent(dockable, state.grabbedPanel!, window.contentId)
                                state.grabbedPanel = Dockable.makePanel(dockable)
                                Dockable.addContent(dockable, state.grabbedPanel, window)
                                Dockable.coallesceEmptyPanels(dockable)

                                state.grabbedPanel!.rect = new Dockable.Rect(state.mousePos.x, state.mousePos.y, 250, 150)
                                state.grabbedPanel!.justOpenedAnchorRect = new Dockable.Rect(state.mousePos.x, state.mousePos.y, 250, 150)
                                state.grabbedPanel!.justOpenedAnchorAlignX = 0
                                state.grabbedPanel!.justOpenedAnchorAlignY = 1
                            }

                            bringToFront(ev, state.grabbedPanel!)
                        }
                    }
                }
                else
                {
                    if (state.mouseAction == MouseAction.MoveHeader)
                    {
                        let nearestDistSqr = 50 * 50
                        state.nearestAnchor = null
        
                        for (const anchor of layoutRef.current!.anchors)
                        {
                            if (anchor.panel === state.grabbedPanel)
                                continue

                            const xx = anchor.x - state.mousePos.x
                            const yy = anchor.y - state.mousePos.y
                            const distSqr = xx * xx + yy * yy
                            if (distSqr < nearestDistSqr)
                            {
                                nearestDistSqr = distSqr
                                state.nearestAnchor = anchor
                            }
                        }
        
                        state.grabbedPanel!.rect = state.grabbedPanel!.rect.displace(
                            state.mousePos.x - mousePosPrev.x,
                            state.mousePos.y - mousePosPrev.y)
                    }
                }

                stateRef.commit()
                refState.commit()
            }
        }

        const onMouseUp = (ev: MouseEvent) =>
        {
            const state = stateRef.ref.current
            const dockable = refState.ref.current

            if (state.mouseDown && !state.mouseDragLocked)
            {
                if (state.mouseAction == MouseAction.MoveHeader &&
                    state.nearestAnchor)
                {
                    Dockable.dock(
                        dockable,
                        state.grabbedPanel!,
                        state.nearestAnchor.panel,
                        state.nearestAnchor.mode)
                }

                Dockable.clampFloatingPanels(dockable, rectRef.current)
            }

            state.mouseDown = false
            state.mouseAction = MouseAction.None
            stateRef.commit()
            refState.commit()
        }

        window.addEventListener("mousemove", onMouseMove)
        window.addEventListener("mouseup", onMouseUp)

        return () =>
        {
            window.removeEventListener("mousemove", onMouseMove)
            window.removeEventListener("mouseup", onMouseUp)
        }

    }, [])

    const onPanelActivate = (ev: MouseEvent, panel: Dockable.Panel) =>
    {
        if (panel.ephemeral)
        {
            (ev as any).clickedEphemeral = true
        }

        bringToFront(ev, panel)
    }

    const onPanelHeaderMouseDown = (ev: MouseEvent, panel: Dockable.Panel) =>
    {
        ev.preventDefault()
        const state = stateRef.ref.current
        state.grabbedPanel = panel
        state.grabbedTab = null
        state.mouseDown = true
        state.mouseAction = MouseAction.MoveHeader
        state.mouseDownPos = state.mousePos = transformMouse(ev)
        state.mouseDragLocked = true
        stateRef.commit()

        bringToFront(ev, panel)
    }

    const onPanelTabMouseDown = (ev: MouseEvent, panel: Dockable.Panel, tab: number) =>
    {
        ev.preventDefault()
        ev.stopPropagation()
        panel.tabIndex = tab
        const state = stateRef.ref.current
        state.grabbedPanel = panel
        state.grabbedTab = tab
        state.mouseDown = true
        state.mouseAction = MouseAction.MoveHeader
        state.mouseDownPos = state.mousePos = transformMouse(ev)
        state.mouseDragLocked = true
        stateRef.commit()
        refState.commit()

        bringToFront(ev, panel)
    }

    const onPanelResize = (ev: MouseEvent, panel: Dockable.Panel) =>
    {
        ev.preventDefault()
        const state = stateRef.ref.current
        state.grabbedPanel = panel
        state.grabbedTab = null
        state.mouseDown = true
        state.mouseAction = MouseAction.ResizePanel
        state.mouseDownPos = state.mousePos = transformMouse(ev)
        state.mouseDragLocked = true
        stateRef.commit()

        bringToFront(ev, panel)
    }

    const onDividerResize = (ev: MouseEvent, divider: Dockable.Divider) =>
    {
        ev.preventDefault()
        const state = stateRef.ref.current
        state.grabbedDivider = divider
        state.mouseDown = true
        state.mouseAction = MouseAction.ResizeDivider
        state.mouseDownPos = state.mousePos = transformMouse(ev)
        state.mouseDragLocked = true
        stateRef.commit()
    }

    const onPanelTabClose = (ev: MouseEvent, panel: Dockable.Panel, tab: number) =>
    {
        ev.preventDefault()
        const dockable = refState.ref.current
        const window = panel.contentList[tab]
        Dockable.removeContent(dockable, panel, window.contentId)
        Dockable.coallesceEmptyPanels(dockable)
        refState.commit()
    }

    return {
        grabbedPanel: stateRef.ref.current.mouseDown ?
            stateRef.ref.current.grabbedPanel :
            null,

        showAnchors:
            stateRef.ref.current.mouseDown &&
            !stateRef.ref.current.mouseDragLocked &&
            stateRef.ref.current.mouseAction == MouseAction.MoveHeader,

        draggingAnchor: stateRef.ref.current.nearestAnchor,
        onPanelActivate,
        onPanelHeaderMouseDown,
        onPanelTabMouseDown,
        onPanelResize,
        onDividerResize,
        onPanelTabClose,
    }
}