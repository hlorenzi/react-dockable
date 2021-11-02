import * as React from "react"
import * as ReactDOM from "react-dom"
import * as Dockable from "./index"


function WindowBasic(props: {
    value: number,
})
{
    const ctx = Dockable.useContentContext()
    ctx.setTitle("Test " + props.value)
    ctx.setPreferredSize(150, 100)

    return <div style={{
        width: "100%",
        height: "100%",
        display: "grid",
        justifyContent: "center",
        alignContent: "center",
        fontSize: "3em",
    }}>
        Test { props.value }
    </div>
}


function App()
{
    const state = Dockable.useDockable((state) =>
    {
        Dockable.createAndDockPanel(state, state.rootPanel, Dockable.DockMode.Full, <WindowBasic value={ 0 }/>)
        Dockable.createAndDockPanel(state, state.rootPanel, Dockable.DockMode.Full, <WindowBasic value={ 1 }/>)
        Dockable.createAndDockPanel(state, state.rootPanel, Dockable.DockMode.Full, <WindowBasic value={ 2 }/>)
        Dockable.createAndDockPanel(state, state.rootPanel, Dockable.DockMode.Full, <WindowBasic value={ 3 }/>)
        Dockable.createAndDockPanel(state, state.rootPanel, Dockable.DockMode.Full, <WindowBasic value={ 4 }/>)
        Dockable.createAndDockPanel(state, state.rootPanel, Dockable.DockMode.Right, <WindowBasic value={ 5 }/>)
        Dockable.createAndDockPanel(state, state.rootPanel, Dockable.DockMode.Bottom, <WindowBasic value={ 6 }/>)
    })

    const counter = React.useRef(7)

    const onSpawnWindow = () =>
    {
        Dockable.createFloating(
            state,
            <WindowBasic value={ counter.current++ }/>)
    }

    return <>
        <div style={{
            display: "grid",
            gridTemplate: "auto 1fr / 1fr",
            width: "100%",
            height: "100vh",
        }}>

            <div style={{
                padding: "0.5em",
            }}>
                <button onClick={ onSpawnWindow }>
                    Spawn window
                </button>
            </div>

            <Dockable.Container state={ state }/>

        </div>
    </>
}


document.body.onload = function()
{
	ReactDOM.render(<App/>, document.getElementById("divApp"))
}