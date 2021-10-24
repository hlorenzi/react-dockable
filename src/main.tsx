import * as React from "react"
import * as ReactDOM from "react-dom"
import * as Dockable from "./dockable"


function WindowBasic(props: {
    value: number,
})
{
    return <div>{ props.value }</div>
}


function App()
{
    const state = Dockable.useDockable()

    const counter = React.useRef(1)

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

            <div>
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