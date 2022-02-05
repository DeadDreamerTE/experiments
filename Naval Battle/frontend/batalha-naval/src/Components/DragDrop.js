import React, { useEffect, useState } from "react";
import { useDrop } from "react-dnd";
import './components.css'
import Items from "./Items";

async function getToken() {
    const token = localStorage.getItem("session")

    if (!token) { window.location.pathname = "/login" }
    else {
        const result = await fetch("/user", {
            method: "GET",
            headers: { "Authorization": token }
        })
        if (result.status !== 200) {
            window.location.pathname = "/login"
        } else { return }
    }
}

async function updateBoard(board) {
    const token = localStorage.getItem("session")
    const result = await fetch("/board", {
        method: "POST",
        headers: {
            "Authorization": token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(board)
    })

    if (result.status !== 200) {
        window.location.pathname = "/login"
    } else {
        const json = await result.json()
        console.log("aleluia")
    }
}

export default function DragDrop() {
    getToken()
    const [jogo, setJogo] = useState({
        Tabuleiro: [["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""]],
    })
    const [save, setSave] = useState([])
    const [mongo, setMongo] = useState(0)
    const [path, setPath] = useState("")
    const [ready, setReady] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem("session")
        async function getBoardByToken(token) {
            if (!token) {
                window.location.pathname = "/login"
            }
            else {
                const result = await fetch("/board", {
                    method: "GET",
                    headers: { "Authorization": token }
                })
                if (result.status !== 200) {
                    window.location.pathname = "/login"
                } else {
                    const json = await result.json()
                    const board = json.Tabuleiro
                    setSave(e => { return { ...e, Tabuleiro: board } })
                    setJogo(e => { return { ...e, Tabuleiro: board } })
                    setReady((e) => {
                        let test = new Set()
                        const holder1 = board.reduce((acc, e) => acc.concat(e.reduce((acc2, elem) => elem != "" ? acc2.concat([elem]) : acc2, [])), [])
                        holder1.forEach((e) => test.add(e))
                        if (test.size == 6) {
                            return true
                        } else {
                            return false
                        }
                    })
                    console.log(jogo.Tabuleiro)
                }
            }
        }
        getBoardByToken(token)

    }, [mongo])

    function Dropable({ c, iT, jT }) {
        const [{ isOver }, droping] = useDrop(() => {
            return {
                accept: ["0", "1", "2", "3", "4", "5"],
                canDrop: undefined,
                hover: undefined,
                drop: (item, monitor) => {
                    setJogo(e => {
                        function Clone(jogo, item) {
                            let clone = jogo.Tabuleiro.map(e => e.map(c => c === item.navio.id ? "" : c))
                            const pos = item.navio["item" + item.var].reduce((acc1, e, i1) => acc1.concat(e.reduce((acc2, elem, i2) => elem === "" ? acc2 : acc2.concat([{ i: i1 - item.coords.i, j: i2 - item.coords.j }]), [])), [])
                            for (const { i, j } of pos) {
                                if (i + iT < 0 || iT + i > 9 || j + jT < 0 || j + jT > 9) { return null; }
                                if (clone[iT + i][jT + j] !== "") { return null }
                                clone[iT + i][jT + j] = item.navio.id
                            }
                            return (clone)
                        }
                        const clone = Clone(e, item)
                        if (clone == null) {
                            return e
                        } else {
                            return { ...e, Tabuleiro: clone }
                        }
                    })
                }
            }
        })

        return <td ref={droping} style={style(c)} ></td>

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
    }
    //let coords = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] //th n funcionam
    /*<thead>
                        <tr>
                            {jogo.Tabuleiro.map((l, i) => <th>{coords[i]}</th>)}
                        </tr>
                    </thead>*/

    return (
        <div className="items">
            <Items />

            <div className="items" style={{ flexDirection: "column", paddingLeft: "250px" }}>
                <span style={{ color: "white" }}>Set your Board here!</span>
                <table className="Tabuleiro">

                    <tbody>{jogo.Tabuleiro.map((l, i) => (
                        <tr key={i}>
                            {l.map((c, j) => (
                                <Dropable c={c} iT={i} jT={j} key={`${i},${j}`} />))}
                        </tr>))}
                    </tbody>
                </table>
                <div className="controls">
                    <button onClick={() => { updateBoard(jogo.Tabuleiro); setMongo(e => (e + 1) % 2) }}>Save</button>
                    <button onClick={() => setJogo(e => { return { ...e, Tabuleiro: save.Tabuleiro } })}>Reset</button>
                    <button onClick={() => setJogo(e => { return { ...e, Tabuleiro: e.Tabuleiro.map(elem => elem.map(elemento => elemento === "" ? elemento : "")) } })}>Clear</button>
                </div>

            </div>
            <div className="Path">
                <input type={"text"} value={path} onChange={(e) => setPath(() => e.target.value)} />
                <button disabled={ready == false} onClick={() => window.location.pathname = `/private/${path}`}>Private Lobby</button>
            </div>
        </div>
    )
}










