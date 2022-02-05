import React, { useState } from "react";
import { useDrag } from "react-dnd";

export default function Items() {
    const items = [{
        id: "5",

        item0: [["5", "5", "5"], ["", "5", ""], ["", "5", ""]],
        item1: [["", "", "5"], ["5", "5", "5"], ["", "", "5"]],
        item2: [["", "5", ""], ["", "5", ""], ["5", "5", "5"]],
        item3: [["5", "", ""], ["5", "5", "5"], ["5", "", ""]]
    }, {
        id: "4",

        item0: [["4", "4", "4", "4"], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""]],
        item1: [["4", "", "", ""], ["4", "", "", ""], ["4", "", "", ""], ["4", "", "", ""]]
    }, {
        id: "3",

        item0: [["3", "3", "3"], ["", "", ""], ["", "", ""]],
        item1: [["3", "", ""], ["3", "", ""], ["3", "", ""]]
    }, {
        id: "2.0",

        item0: [["2.0", "2.0"], ["", ""]],
        item1: [["2.0", ""], ["2.0", ""]]
    }, {
        id: "2.1",

        item0: [["2.1", "2.1"], ["", ""]],
        item1: [["2.1", ""], ["2.1", ""]]
    }, {
        id: "1",
        item0: [["1"]]
    }]

    const [avioes, setAvioes] = useState(0)
    const [caca, setCaca] = useState(0)
    const [tres, setTres] = useState(0)
    const [dois1, setDois1] = useState(0)
    const [dois2, setDois2] = useState(0)

    function style(c) {
        if (c === "") { return { backgroundColor: "#0A1B33" } }
        else if (c === "5") { return { backgroundColor: "#DB901C" } }
        else if (c === "4") { return { backgroundColor: "#E8E163" } }
        else if (c === "3") { return { backgroundColor: "#7FC5DC" } }
        else if (c === "2.0") { return { backgroundColor: "#4888C8" } }
        else if (c === "2.1") { return { backgroundColor: "#173679" } }
        else {
            return { backgroundColor: "#FAF7C5" }
        }
    }

    function Navio(props) {
        const { items, id, type } = props
        const [coords, setCoords] = useState({ i: 0, j: 0 })
        const [{ isDragging }, drag] = useDrag(() => ({
            type: type,
            item: { navio: items[Number(type)], var: id, type: type, coords },
            collect: (monitor) => {
                return {
                    isDragging: !!monitor.isDragging()
                }
            }
        }), [coords])
        return (
            <table ref={drag}>
                <tbody>{items[Number(type)]["item" + id].map((l, i) => (
                    <tr key={`${items[Number(type)].id}&${i}`}>
                        {l.map((c, j) => (
                            <td onMouseDown={() => setCoords({ i, j })} style={c === "" ? { backgroundColor: "none" } : style(c)} key={`${items[Number(type)].id}&&${j}`}>
                            </td>))}
                    </tr>))}
                </tbody>
            </table>
        )
    }

    return (<div key="items">
        <section key="porta-avioes" className="navios">
            <Navio items={items} id={avioes} type={"0"} />
            <button className="RollButton" onClick={() => setAvioes(e => (e + 1) % 4)}><img src="/images/rotation.png" alt=""></img></button>
        </section>

        <section key="caçador" className="navios">
            <Navio items={items} id={caca} type={"1"} />
            <button className="RollButton" onClick={() => setCaca(e => (e + 1) % 2)}><img src="/images/rotation.png" alt=""></img></button>
        </section>

        <section key="trescanos" className="navios">
            <Navio items={items} id={tres} type={"2"} />
            <button className="RollButton" onClick={() => setTres(e => (e + 1) % 2)}><img src="/images/rotation.png" alt=""></img></button>
        </section>

        <section key="doiscanos1" className="navios">
            <Navio items={items} id={dois1} type={"3"} />
            <button className="RollButton" onClick={() => setDois1(e => (e + 1) % 2)}><img src="/images/rotation.png" alt=""></img></button>
        </section>

        <section key="doiscanos2" className="navios">
            <Navio items={items} id={dois2} type={"4"} />
            <button className="RollButton" onClick={() => setDois2(e => (e + 1) % 2)}><img src="/images/rotation.png" alt=""></img></button>
        </section>

        <section key="sub" className="navios">
            <Navio items={items} id={0} type={"5"} />
        </section>
    </div >)
}

/*function Porta(props) {
        const { items, id } = props
        const [coords, setCoords] = useState({ i: 0, j: 0 })
        const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
            type: "0",
            item: { navio: items[0], var: id, type: "0", coords },
            collect: (monitor) => {
                return {
                    isDragging: !!monitor.isDragging()
                }
            }
        }), [coords])
        if (isDragging) {
            return <div ref={dragPreview} style={{ color: "blue" }}>azul</div>
        }
        return (<table ref={drag}>
            <tbody>{items[0]["item" + id].map((l, i) => (
                <tr key={`${items[0]["id" + id]}&${i}`}>
                    {l.map((c, j) => (
                        <td onMouseDown={() => setCoords({ i, j })} style={c === "" ? { backgroundColor: "none" } : { backgroundColor: "#DB901C" }} key={`${items[0]["id" + id]}&&${j}`}>
                        </td>))}
                </tr>))}
            </tbody>
        </table>)
    }*/