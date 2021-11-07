import * as React from "react"
import * as Dockable from "@hlorenzi/react-dockable"


export function Clock()
{
    const [value, setValue] = React.useState(Date.now())

    React.useEffect(() =>
    {
        const interval = setInterval(() => setValue(Date.now()), 1000)
        return () => clearInterval(interval)
    })


    const ctx = Dockable.useContentContext()
    ctx.setTitle(`Clock`)
    ctx.setPreferredSize(450, 250)

    
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
        { new Date(value).toLocaleString() }
    </div>
}