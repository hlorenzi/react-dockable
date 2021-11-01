import * as React from "react"
import * as Dockable from "./index"


export function useDockable(init?: (state: Dockable.State) => void): Dockable.RefState<Dockable.State>
{
    return Dockable.useRefState(() =>
    {
        const state = Dockable.makeState()

        if (init)
            init(state)

        return state
    })
}


interface MousePos
{
    x: number
    y: number
}


export const mousePos: MousePos =
{
    x: 0,
    y: 0,
}


window.addEventListener("mousemove", (ev: MouseEvent) =>
{
    mousePos.x = ev.pageX
    mousePos.y = ev.pageY
})


export function createFloating(
    refState: Dockable.RefState<Dockable.State>,
    elem: JSX.Element,
    alignX?: number,
    alignY?: number,
    rect?: Dockable.Rect)
    : Dockable.Panel
{
    let state = refState.ref.current

    const panel = Dockable.makePanel(state)
    Dockable.addNewContent(state, panel, elem)
    if (rect)
        panel.rect = new Dockable.Rect(rect.x2, rect.y2, 500, 300)
    else
        panel.rect = new Dockable.Rect(mousePos.x, mousePos.y, 500, 300)

    panel.justOpenedAnchorRect = rect ?? new Dockable.Rect(mousePos.x - 15, mousePos.y - 15, 30, 30)
    panel.justOpenedAnchorAlignX = alignX ?? 1
    panel.justOpenedAnchorAlignY = alignY ?? 1
    panel.bugfixAppearOnTop = true

    state.activePanel = panel
    refState.commit()
    return panel
}


export function createFloatingEphemeral(
    refState: Dockable.RefState<Dockable.State>,
    elem: JSX.Element,
    alignX?: number,
    alignY?: number,
    rect?: Dockable.Rect)
    : Dockable.Panel
{
    const panel = createFloating(refState, elem, alignX, alignY, rect)
    Dockable.removeEphemerals(refState.ref.current)
    panel.ephemeral = true
    refState.commit()
    return panel
}


export interface WindowProps
{
    panel: Dockable.Panel
    contentId: Dockable.ContentId

    setTitle: (title: string) => void
    setPreferredSize: (w: number, h: number) => void
}


export const WindowContext = React.createContext<WindowProps>(null!)


export function useWindow(): WindowProps
{
    return React.useContext(WindowContext)
}