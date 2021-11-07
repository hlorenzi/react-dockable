import * as React from "react"
import * as Dockable from "./index.js"


export function useDockable(
    init?: (state: Dockable.State) => void)
    : Dockable.RefState<Dockable.State>
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


export function spawnFloating(
    state: Dockable.RefState<Dockable.State>,
    elem: JSX.Element)
    : Dockable.Panel
{
    const panel = Dockable.makePanel(state.ref.current)
    Dockable.addNewContent(state.ref.current, panel, elem)
    panel.rect = new Dockable.Rect(mousePos.x, mousePos.y, 500, 300)

    state.ref.current.activePanel = panel
    state.commit()
    return panel
}


export function spawnFloatingEphemeral(
    state: Dockable.RefState<Dockable.State>,
    elem: JSX.Element)
    : Dockable.Panel
{
    const panel = spawnFloating(state, elem)
    Dockable.removeEphemerals(state.ref.current)
    panel.ephemeral = true
    state.commit()
    return panel
}


export interface ContentContextProps
{
    layoutContent: Dockable.LayoutContent

    setTitle: (title: string) => void
    setPreferredSize: (w: number, h: number) => void
}


export const ContentContext = React.createContext<ContentContextProps>(null!)


export function useContentContext(): ContentContextProps
{
    return React.useContext(ContentContext)
}