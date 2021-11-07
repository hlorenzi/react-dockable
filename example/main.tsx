import * as React from "react"
import * as ReactDOM from "react-dom"
import * as Dockable from "@hlorenzi/react-dockable"
import { Counter } from "./Counter"
import { Clock } from "./Clock"
import { TextEditor } from "./TextEditor"


const fillerText =
[
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
]


function App()
{
    const state = Dockable.useDockable((state) =>
    {
        // Set up initial panels and content

        // Dock three Counters in the same panel
        // (which will show up as tabs)...
        Dockable.createDockedPanel(
            state, state.rootPanel, Dockable.DockMode.Full,
            <Counter/>)

        Dockable.createDockedPanel(
            state, state.rootPanel, Dockable.DockMode.Full,
            <Counter/>)

        Dockable.createDockedPanel(
            state, state.rootPanel, Dockable.DockMode.Full,
            <Counter/>)

        // ...then dock one TextEditor to the right...
        Dockable.createDockedPanel(
            state, state.rootPanel, Dockable.DockMode.Right,
            <TextEditor initialValue={ fillerText[0] }/>)
        
        // ...and finally dock one Clock at the bottom
        Dockable.createDockedPanel(
            state, state.rootPanel, Dockable.DockMode.Bottom,
            <Clock/>)
    })


    const spawnCounter = () =>
    {
        Dockable.spawnFloating(
            state,
            <Counter/>)
    }

    const spawnClock = () =>
    {
        Dockable.spawnFloating(
            state,
            <Clock/>)
    }

    const spawnTextEditor = () =>
    {
        Dockable.spawnFloating(
            state,
            <TextEditor
                initialValue={ fillerText[Math.floor(Math.random() * fillerText.length)] }
            />)
    }


    return <div style={{
        display: "grid",
        gridTemplate: "auto 1fr / 1fr",
        width: "100%",
        height: "100vh",
    }}>

        <div style={{
            padding: "0.5em",
            display: "grid",
            gridTemplate: "auto / auto auto auto 1fr",
            gridGap: "0.25em",
        }}>
            <button onClick={ spawnCounter }>
                Spawn Counter
            </button>
            
            <button onClick={ spawnClock }>
                Spawn Clock
            </button>
            
            <button onClick={ spawnTextEditor }>
                Spawn Text Editor
            </button>
        </div>

        <Dockable.Container state={ state }/>

    </div>
}


document.body.onload = function()
{
	ReactDOM.render(<App/>, document.getElementById("divApp"))
}