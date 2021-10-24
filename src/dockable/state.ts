import Rect from "../util/rect"


export type PanelId = number
export type ContentId = number
export type ContentElement = JSX.Element


export interface State
{
    idNext: number
    rootPanel: Panel
    floatingPanels: Panel[]
    activePanel: Panel | null
}


export enum SplitMode
{
    LeftRight,
    TopBottom,
}


export enum DockMode
{
    Full,
    Left,
    Right,
    Top,
    Bottom,
}


export interface Panel
{
    id: PanelId
    floating: boolean
    rect: Rect
    bugfixAppearOnTop: boolean

    contentList: Content[]
    tabIndex: number

    splitPanels: Panel[]
    splitMode: SplitMode
    splitSize: number

    preferredFloatingSize: Rect

    justOpened: boolean
    justOpenedAnchorRect: Rect
    justOpenedAnchorAlignX: number
    justOpenedAnchorAlignY: number
    ephemeral: boolean
}


export interface Content
{
    contentId: ContentId
    title: string
    element: JSX.Element
}


export interface Divider
{
    panel: Panel
    vertical: boolean
    rect: Rect
    resizeMin: number
    resizeMax: number
}


export interface Anchor
{
    panel: Panel
    x: number
    y: number
    mode: DockMode
    previewRect: Rect
}


export interface Layout
{
    panelRects: LayoutPanel[]
    content: LayoutContent[]
    dividers: Divider[]
    anchors: Anchor[]
}


export interface LayoutPanel
{
    panel: Panel
    rect: Rect
    floating: boolean
    zIndex: number
}


export interface LayoutContent
{
    content: Content
    tabIndex: number
    panel: Panel
    panelRect: LayoutPanel
}


export function makeState(): State
{
    return {
        idNext: 2,
        rootPanel: {
            id: 1,
            floating: false,
            bugfixAppearOnTop: false,
            rect: new Rect(0, 0, 0, 0),
            contentList: [],
            tabIndex: 0,
            splitPanels: [],
            splitMode: SplitMode.LeftRight,
            splitSize: 0.5,

            preferredFloatingSize: new Rect(0, 0, 300, 250),

            justOpened: false,
            justOpenedAnchorRect: new Rect(0, 0, 0, 0),
            justOpenedAnchorAlignX: 0,
            justOpenedAnchorAlignY: 1,
            ephemeral: false,
        },
        floatingPanels: [],
        activePanel: null,
    }
}


export function makePanel(state: State): Panel
{
    const id = state.idNext++
    const panel: Panel = {
        id,
        floating: true,
        bugfixAppearOnTop: false,
        rect: new Rect(0, 0, 0, 0),

        contentList: [],
        tabIndex: 0,

        splitPanels: [],
        splitMode: SplitMode.LeftRight,
        splitSize: 0.5,

        preferredFloatingSize: new Rect(0, 0, 300, 250),

        justOpened: true,
        justOpenedAnchorRect: new Rect(0, 0, 0, 0),
        justOpenedAnchorAlignX: 0,
        justOpenedAnchorAlignY: 1,
        ephemeral: false,
    }
    state.floatingPanels.push(panel)
    return panel
}


export function detachPanel(state: State, panel: Panel)
{
    if (!panel.floating)
    {
        panel.floating = true
        state.activePanel = panel
        state.floatingPanels.push(panel)
    }
}


export function addNewContent(state: State, toPanel: Panel, element: ContentElement)
{
    const id = state.idNext++
    toPanel.contentList.push({
        contentId: id,
        title: "",
        element,
    })
    toPanel.tabIndex = toPanel.contentList.length - 1
    toPanel.ephemeral = false
}


export function addContent(state: State, toPanel: Panel, content: Content)
{
    const id = state.idNext++
    toPanel.contentList.push(content)
    toPanel.tabIndex = toPanel.contentList.length - 1
    toPanel.ephemeral = false
}


export function removeContent(state: State, fromPanel: Panel, contentId: ContentId)
{
    const windowIndex = fromPanel.contentList.findIndex(w => w.contentId === contentId)
    if (windowIndex < 0)
        return
    
    fromPanel.contentList.splice(windowIndex, 1)
    fromPanel.tabIndex = Math.max(0, Math.min(fromPanel.contentList.length - 1, fromPanel.tabIndex))
}


export function removeEphemerals(state: State)
{
    for (var i = 0; i < state.floatingPanels.length; i++)
        removeEphemeralsRecursive(state, state.floatingPanels[i])

    coallesceEmptyPanels(state)
}


export function removeEphemeralsRecursive(state: State, fromPanel: Panel)
{
    for (var i = 0; i < fromPanel.splitPanels.length; i++)
        coallesceEmptyPanelsRecursive(state, fromPanel.splitPanels[i])

    if (fromPanel.ephemeral)
    {
        fromPanel.contentList = []
        fromPanel.tabIndex = 0
    }
}


export function coallesceEmptyPanels(state: State)
{
    coallesceEmptyPanelsRecursive(state, state.rootPanel)
    for (var i = 0; i < state.floatingPanels.length; i++)
        coallesceEmptyPanelsRecursive(state, state.floatingPanels[i])

    state.floatingPanels = state.floatingPanels.filter(p =>
        p.contentList.length != 0 || p.splitPanels.length != 0)
}


export function coallesceEmptyPanelsRecursive(state: State, fromPanel: Panel)
{
    for (var i = 0; i < fromPanel.splitPanels.length; i++)
        coallesceEmptyPanelsRecursive(state, fromPanel.splitPanels[i])

    fromPanel.splitPanels = fromPanel.splitPanels.filter(p =>
        p.contentList.length != 0 || p.splitPanels.length != 0)

    if (fromPanel.splitPanels.length == 1)
        Object.assign(fromPanel, fromPanel.splitPanels[0])
}


export function dock(state: State, panel: Panel, dockIntoPanel: Panel, mode: DockMode)
{
    if (mode == DockMode.Full ||
        (dockIntoPanel.contentList.length == 0 && dockIntoPanel.splitPanels.length == 0))
    {
        if (dockIntoPanel.splitPanels.length > 0)
            throw "invalid full docking into subdivided panel"

        for (const window of panel.contentList)
            addContent(state, dockIntoPanel, window)

        detachPanel(state, panel)
        panel.contentList = []
        state.floatingPanels = state.floatingPanels.filter(p => p !== panel)
        state.activePanel = dockIntoPanel
    }
    else if (mode == DockMode.Right ||
        mode == DockMode.Left ||
        mode == DockMode.Top ||
        mode == DockMode.Bottom)
    {
        const subdivMode =
            (mode == DockMode.Right || mode == DockMode.Left) ?
                SplitMode.LeftRight :
                SplitMode.TopBottom

        const subdivOriginalFirst =
            (mode == DockMode.Bottom || mode == DockMode.Right)

        const newSubpanels = [panel]

        const newSubpanel = makePanel(state)
        newSubpanel.contentList = dockIntoPanel.contentList
        newSubpanel.tabIndex = dockIntoPanel.tabIndex
        newSubpanel.splitMode = dockIntoPanel.splitMode
        newSubpanel.splitPanels = dockIntoPanel.splitPanels
        newSubpanel.splitSize = dockIntoPanel.splitSize

        dockIntoPanel.contentList = []
        dockIntoPanel.splitPanels = newSubpanels
        dockIntoPanel.splitMode = subdivMode
        dockIntoPanel.splitSize = subdivOriginalFirst ? 0.75 : 0.25

        if (subdivOriginalFirst)
            newSubpanels.unshift(newSubpanel)
        else
            newSubpanels.push(newSubpanel)
            
        panel.floating = false
        dockIntoPanel.floating = false
        newSubpanel.floating = false
        state.activePanel = panel
        state.floatingPanels = state.floatingPanels.filter(p => p !== panel && p !== newSubpanel)
    }
    else
    {
        throw "invalid docking"
    }
}


export function clampFloatingPanels(state: State, rect: Rect)
{
    const margin = 10

    for (const panel of state.floatingPanels)
    {
        panel.rect.x =
            Math.max(rect.x + margin - panel.rect.w / 2,
            Math.min(rect.x2 - margin - panel.rect.w / 2,
                panel.rect.x))

        panel.rect.y =
            Math.max(rect.y + margin,
            Math.min(rect.y2 - margin - panel.rect.h / 2,
                panel.rect.y))
    }
}


export function clampFloatingPanelStrictly(state: State, panel: Panel, rect: Rect)
{
    const margin = 10

    panel.rect.x =
        Math.max(rect.x + margin,
        Math.min(rect.x2 - margin - panel.rect.w,
            panel.rect.x))

    panel.rect.y =
        Math.max(rect.y + margin,
        Math.min(rect.y2 - margin - panel.rect.h,
            panel.rect.y))
}


export function traverseLayout(panel: Panel, rect: Rect, layout: Layout)
{
    const xMid = (rect.x1 + rect.x2) / 2
    const yMid = (rect.y1 + rect.y2) / 2

    if (panel.splitPanels.length == 2)
    {
        if (panel.splitMode == SplitMode.LeftRight)
        {
            const xSplit = rect.x1 + Math.round((rect.x2 - rect.x1) * panel.splitSize)

            const rect1 = rect.withX2(xSplit)
            const rect2 = rect.withX1(xSplit)
            const rectDivider = rect.withX1(xSplit).withX2(xSplit)

            traverseLayout(panel.splitPanels[0], rect1, layout)
            traverseLayout(panel.splitPanels[1], rect2, layout)
            
            layout.dividers.push({
                panel,
                vertical: false,
                rect: rectDivider,
                resizeMin: rect.x1,
                resizeMax: rect.x2,
            })
        }
        else if (panel.splitMode == SplitMode.TopBottom)
        {
            const ySplit = rect.y1 + Math.round((rect.y2 - rect.y1) * panel.splitSize)

            const rect1 = rect.withY2(ySplit)
            const rect2 = rect.withY1(ySplit)
            const rectDivider = rect.withY1(ySplit).withY2(ySplit)

            traverseLayout(panel.splitPanels[0], rect1, layout)
            traverseLayout(panel.splitPanels[1], rect2, layout)

            layout.dividers.push({
                panel,
                vertical: true,
                rect: rectDivider,
                resizeMin: rect.y1,
                resizeMax: rect.y2,
            })
        }
    }
    else
    {
        const panelRect = {
            panel,
            rect,
            floating: false,
            zIndex: 0,
        }

        for (let w = 0; w < panel.contentList.length; w++)
        {
            layout.content.push(
            {
                content: panel.contentList[w],
                tabIndex: w,
                panel,
                panelRect,
            })
        }
    
        layout.panelRects.push(panelRect)

        layout.anchors.push({
            panel,
            x: xMid,
            y: yMid,
            mode: DockMode.Full,
            previewRect: rect,
        })
    }

    layout.anchors.push({
        panel,
        x: rect.x2 - 10,
        y: yMid,
        mode: DockMode.Right,
        previewRect: rect.withX1(rect.x1 + (rect.x2 - rect.x1) * 3 / 4),
    })

    layout.anchors.push({
        panel,
        x: rect.x1 + 10,
        y: yMid,
        mode: DockMode.Left,
        previewRect: rect.withX2(rect.x1 + (rect.x2 - rect.x1) / 4),
    })

    layout.anchors.push({
        panel,
        x: xMid,
        y: rect.y2 - 10,
        mode: DockMode.Bottom,
        previewRect: rect.withY1(rect.y1 + (rect.y2 - rect.y1) * 3 / 4),
    })

    layout.anchors.push({
        panel,
        x: xMid,
        y: rect.y1 + 10,
        mode: DockMode.Top,
        previewRect: rect.withY2(rect.y1 + (rect.y2 - rect.y1) / 4),
    })
}


export function getLayout(state: State, rect: Rect): Layout
{
    const layout: Layout =
    {
        panelRects: [],
        content: [],
        dividers: [],
        anchors: [],
    }

    traverseLayout(state.rootPanel, rect, layout)

    for (let fp = 0; fp < state.floatingPanels.length; fp++)
    {
        const floatingPanel = state.floatingPanels[fp]

        const panelRect = 
        {
            panel: floatingPanel,
            rect: floatingPanel.rect,
            floating: true,
            zIndex: fp + 1,
        }

        for (let w = 0; w < floatingPanel.contentList.length; w++)
        {
            layout.content.push(
            {
                content: floatingPanel.contentList[w],
                tabIndex: w,
                panel: floatingPanel,
                panelRect,
            })
        }

        layout.panelRects.push(panelRect)

        layout.anchors.push({
            panel: floatingPanel,
            x: floatingPanel.rect.xCenter,
            y: floatingPanel.rect.yCenter,
            mode: DockMode.Full,
            previewRect: floatingPanel.rect,
        })
    }

    return layout
}


export function getContentRect(state: State, rect: Rect, contentId: ContentId): Rect | undefined
{
    const layout = getLayout(state, rect)
    return layout.panelRects.find(p => p.panel.contentList.some(c => c.contentId === contentId))!.rect
}