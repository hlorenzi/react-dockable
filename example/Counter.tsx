import * as React from "react"
import * as Dockable from "@hlorenzi/react-dockable"


export function Counter()
{
    const [value, setValue] = React.useState(0)
    const countUp = () => setValue(value + 1)


    const ctx = Dockable.useContentContext()
    ctx.setTitle(`Count: ${ value }`)
    ctx.setPreferredSize(300, 250)


    return <div style={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplate: "auto / auto auto",
        textAlign: "center",
        justifyContent: "center",
        justifyItems: "center",
        alignContent: "center",
        alignItems: "stretch",
        fontSize: "3em",
    }}>
        { value }

        <button
            onClick={ countUp }
            style={{ marginLeft: "1em" }}
        >
            Count up!
        </button>
    </div>
}