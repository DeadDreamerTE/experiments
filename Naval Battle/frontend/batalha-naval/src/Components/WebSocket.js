import { useEffect, useState } from "react"

function TabStyle(c) {
    if (c === "") { return { backgroundColor: "#0A1B33" } }
    else if (c === "5") { return { backgroundColor: "#DB901C" } }
    else if (c === "4") { return { backgroundColor: "#E8E163" } }
    else if (c === "3") { return { backgroundColor: "#7FC5DC" } }
    else if (c === "2.0") { return { backgroundColor: "#4888C8" } }
    else if (c === "2.1") { return { backgroundColor: "#173679" } }
    else if (c === "1") { return { backgroundColor: "#FAF7C5" } }
    else if (c === "a") { return { backgroundColor: "#0AD2F2" } }
    else if (c === "x") { return { backgroundColor: "#A13B3B" } }
}

function AdvStyle(c) {
    if (c === "") { return { backgroundColor: "rgb(60, 10, 10)" } }
    if (c === "a") { return { backgroundColor: "#0AD2F2" } }
    if (c === "x") { return { backgroundColor: "#007A7A" } }
}

let ws

export default function TheWebSocket() {
    const [Tabuleiro, setTabuleiro] = useState({
        Tabuleiro: [["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""]],
        Player: "",
        V: 0,
        D: 0
    })
    //tabuleiro só de cores "água"= "a" && hit="x"
    const [enemy, setEnemy] = useState({
        Tabuleiro: [["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", ""]],
        Player: "",
        V: 0,
        D: 0
    })
    const [hist, setHist] = useState([])
    const [turn, setTurn] = useState("")
    const [jogada, setJogada] = useState("")

    useEffect(() => {
        async function getBoardByToken() {
            const token = localStorage.getItem("session")
            if (!token) {
                window.location.pathname = "/login"
            }
            const result = await fetch("/board", {
                method: "GET",
                headers: { "Authorization": token }
            })
            if (result.status !== 200) {
                window.location.pathname = "/login"
            } else {
                const profile = await result.json()
                console.log(profile)
                setTabuleiro((e) => { return { ...e, Tabuleiro: profile.Tabuleiro, Player: profile.user, V: profile.V, D: profile.D } })
            }
        } getBoardByToken()
        //chega aqui antes do tabuleiro dar set

    }, [])

    useEffect(() => {
        if (Tabuleiro.Player != "") {
            setTimeout(() => {

                ws = new WebSocket('ws://localhost:8080')
                ws.addEventListener("open", (ev) => {
                    ws.addEventListener("message", (ev) => {
                        console.log(`A mensagem é : ${ev.data}`)
                        if (ev.data === "Lobby is Full!") {
                            alert(ev.data)
                            window.location.pathname = ""
                        }
                        if (Object.keys(JSON.parse(ev.data)).includes("Winner")) {
                            ws.close()
                            alert(`The Victor is... ${JSON.parse(ev.data).Winner}!`)
                            window.location.pathname = ""
                        }
                        if (Object.keys(JSON.parse(ev.data)).includes("First")) {
                            const batata = JSON.parse(ev.data)
                            const enemyname = batata.users.find(e => e != Tabuleiro.Player)
                            setEnemy((e) => { return { ...e, Player: enemyname, V: batata[enemyname].V, D: batata[enemyname].D } })
                            setTurn(() => JSON.parse(ev.data).First)
                        }
                        if (Object.keys(JSON.parse(ev.data)).includes("hit")) {

                            const info = JSON.parse(ev.data).hit
                            console.log(info)
                            setHist((e) => e.concat(info.hist))
                            if (info.from == Tabuleiro.Player) {
                                setEnemy((t) => { return { ...t, Tabuleiro: t.Tabuleiro.map((e, i) => e.map((elem, j) => i == info.i && j == info.j ? "x" : elem)) } })
                                setTurn(() => Tabuleiro.Player)
                                setJogada(() => "")
                            } else {
                                setTabuleiro((t) => { return { ...t, Tabuleiro: t.Tabuleiro.map((e, i) => e.map((elem, j) => i == info.i && j == info.j ? "x" : elem)) } })
                            }
                        }
                        if (Object.keys(JSON.parse(ev.data)).includes("miss")) {
                            const info = JSON.parse(ev.data).miss
                            console.log(info)
                            setHist((e) => e.concat(info.hist))
                            if (info.from == Tabuleiro.Player) {
                                setEnemy((t) => { return { ...t, Tabuleiro: t.Tabuleiro.map((e, i) => e.map((elem, j) => i == info.i && j == info.j ? "a" : elem)) } })

                            } else {
                                setTabuleiro((t) => { return { ...t, Tabuleiro: t.Tabuleiro.map((e, i) => e.map((elem, j) => i == info.i && j == info.j ? "a" : elem)) } })
                                setTurn(() => Tabuleiro.Player)
                                setJogada(() => "")
                            }
                        }
                    })
                    ws.send(JSON.stringify({ Tabuleiro: Tabuleiro.Tabuleiro, user: Tabuleiro.Player, V: Tabuleiro.V, D: Tabuleiro.D, path: window.location.pathname }))
                })


            }, 5000)
        }


    }, [Tabuleiro.Player])

    useEffect(() => {
        if (jogada != "") {
            setTurn(() => "a")
            ws.send(jogada)
        }
    }, [jogada])

    return (<div>
        {turn == "" && <div>
            <p>Looking for a enemy...</p>
        </div>}

        {turn != "" && <div>
            <section className="Jogo">

                <div>
                    <p><span>{Tabuleiro.Player}</span></p>
                    <table className="TabuleiroB" style={(turn == Tabuleiro.Player && turn != "") ? { boxShadow: "0px 0px 2px 2px grey" } : {}}>
                        <tbody>{Tabuleiro.Tabuleiro.map((l, i) => (
                            <tr key={i}>
                                {l.map((c, j) => (
                                    <td style={TabStyle(c)} key={j}></td>))}
                            </tr>))}
                        </tbody>
                    </table>

                    <p>V: <span>{Tabuleiro.V}</span>   D:<span>{Tabuleiro.D}</span></p>
                    <div className="controls">
                        <button style={{ backgroundColor: "rgb(255, 30, 30)" }} onClick={() => window.location.pathname = ""}>Desistir</button>
                    </div>
                </div>

                <div>
                    <p><span>{enemy.Player}</span></p>
                    <table className="TabuleiroR" style={(turn != Tabuleiro.Player && turn != "") ? { boxShadow: "0px 0px 2px 2px grey" } : {}}>
                        <tbody>{enemy.Tabuleiro.map((l, i) => (
                            <tr key={i}>
                                {l.map((c, j) => (
                                    <td onClick={() => {
                                        if (turn == Tabuleiro.Player && c === "" && jogada == "") {
                                            setJogada(() => JSON.stringify({ i: i, j: j, path: window.location.pathname, user: Tabuleiro.Player }))
                                        }
                                    }} style={AdvStyle(c)} key={j}></td>))}
                            </tr>))}
                        </tbody>
                    </table>

                    <p>V: <span>{enemy.V}</span>   D:<span>{enemy.D}</span></p>
                </div>


            </section>
            <div className="chat" >
                {hist.map((e, i) => <p key={i} style={e.includes(Tabuleiro.Player) ? { color: "rgb(127, 197, 220)", paddingBottom: "10px" } : { color: "rgb(255, 82, 84)", paddingBottom: "20px" }}>{e}</p>)}
            </div>
        </div >}
    </div >
    );
}

