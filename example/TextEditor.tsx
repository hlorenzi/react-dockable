import * as React from "react"
import * as Dockable from "@hlorenzi/react-dockable"


export function TextEditor(props: {
    initialValue: string,
})
{
    const [value, setValue] = React.useState(props.initialValue)
    const [edited, setEdited] = React.useState(false)

    const onEdit = (newValue: string) =>
    {
        setEdited(true)
        setValue(newValue)
    }


    const ctx = Dockable.useContentContext()
    ctx.setTitle(`Text Editor${ edited ? " [edited]" : "" }`)
    ctx.setPreferredSize(300, 250)


    return <div style={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplate: "auto 1fr / 1fr",
        gridGap: "0.25em",
        justifyContent: "center",
        justifyItems: "left",
        alignContent: "center",
        alignItems: "stretch",
        fontSize: "3em",
        boxSizing: "border-box",
        padding: "0.25em",
    }}>
        <button
            onClick={ () => setEdited(false) }
        >
            Mark as saved
        </button>

        <textarea
            value={ value }
            onChange={ ev => onEdit(ev.target.value) }
            style={{
                width: "100%",
                height: "100%",
                resize: "none",
                backgroundColor: "transparent",
                color: "white",
        }}/>
    </div>
}