import { WebSocketServer } from 'ws';
import "isomorphic-fetch"
const wss = new WebSocketServer({ port: 8080 });

let Lobbys = new Map([]);
let LobbyTurns = new Map([]);
let wsLocation = [];
let LobbyHist = new Map([]);

wss.on("connection", (ws) => {
    console.log("Alguém se ligou ao servidor")

    //converter ws Location para receber um token e no connect a ws tem um token, 
    //se já existir o token redirect para path=""

    ws.on("message", (data) => {
        const mensagem = JSON.parse(data)
        console.log(Object.keys(mensagem))

        if (Object.keys(mensagem).includes("Tabuleiro")) { //done
            const lobby = Lobbys.get(mensagem.path)

            if (!lobby) {
                Lobbys.set(mensagem.path, [{ user: mensagem.user, Tabuleiro: mensagem.Tabuleiro, V: mensagem.V, D: mensagem.D, ws: ws }])
                wsLocation.push({ ws: ws, path: mensagem.path })
                console.log(!lobby)
            }
            else if (lobby.length < 2) {
                if (!Lobbys.get(mensagem.path).some(e => e.ws == ws)) {
                    Lobbys.set(mensagem.path, Lobbys.get(mensagem.path).concat([{ user: mensagem.user, Tabuleiro: mensagem.Tabuleiro, V: mensagem.V, D: mensagem.D, ws: ws }]))
                    wsLocation.push({ ws: ws, path: mensagem.path })

                    const players = Lobbys.get(mensagem.path).reduce((acc, e) => acc.concat([e]), [])
                    const first = players[Math.round(Math.random())].user

                    LobbyTurns.set(mensagem.path, { users: [players[0].user, players[1].user], turn: first })
                    LobbyHist.set(mensagem.path, [])

                    wss.clients.forEach(wsClient => (wsClient == players[0].ws || wsClient == players[1].ws)
                        ? wsClient.send(JSON.stringify({ First: first, users: [players[0].user, players[1].user], [players[0].user]: { V: players[0].V, D: players[0].D }, [players[1].user]: { V: players[1].V, D: players[1].D } })) : null)
                } else {
                    ws.send("Lobby is Full")
                }
            }
            else {
                wss.clients.forEach(wsClient => wsClient == ws ? ws.send("Lobby is Full") : null) //talvez um dia
            }
        }

        else if (Object.keys(mensagem).includes("i")) {
            const mensagem = JSON.parse(data)
            const turno = LobbyTurns.get(mensagem.path).turn
            const lobby = Lobbys.get(mensagem.path)
            const websocketss = lobby.reduce((acc, e) => acc.concat(e.ws), [])
            let resultado
            if (turno == mensagem.user) {
                const board = lobby.reduce((acc, arroz) => arroz.user != mensagem.user ? acc.concat(arroz.Tabuleiro.map((e, i) => e.map((elem, j) => {
                    if (i == mensagem.i && j == mensagem.j) {
                        if (elem == "") { resultado = "a"; return "a" }
                        else { resultado = "x"; return "x" }
                    }
                    else { return elem }
                }))) : acc, [])

                const coordsy = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
                let oldBoard = new Set()
                const holder1 = (lobby.find(e => e.user != mensagem.user).Tabuleiro.reduce((acc, e) => acc.concat(e.reduce((acc2, elem) => (elem != "" && elem != "a" && elem != "x") ? acc2.concat([elem]) : acc2, [])), []))
                holder1.forEach((e) => oldBoard.add(e))


                Lobbys.set(mensagem.path, [lobby.find(e => e.user == mensagem.user), { ...lobby.find(e => e.user != mensagem.user), Tabuleiro: board }])

                if (resultado == "x") {
                    //acertaste só me dás trabalho

                    let hist = [`${mensagem.user}: Hit at, X:${mensagem.i + 1}  Y:${coordsy[mensagem.j]}`]

                    let Result = new Set()
                    const holder2 = board.reduce((acc, e) => acc.concat(e.reduce((acc2, elem) => (elem != "" && elem != "a" && elem != "x") ? acc2.concat([elem]) : acc2, [])), [])
                    holder2.forEach((e) => Result.add(e))

                    if (oldBoard.size != Result.size) {
                        hist = hist.concat([`${mensagem.user}: Destroyed a ship!`])
                    }

                    LobbyHist.set(mensagem.path, LobbyHist.get(mensagem.path).concat(hist))
                    console.log(JSON.stringify({ hit: { i: mensagem.i, j: mensagem.j, from: mensagem.user, hist: hist } }))
                    wss.clients.forEach(wsClients => {
                        for (let logar = 0; logar < websocketss.length; logar++) {
                            if (wsClients == websocketss[logar]) {
                                wsClients.send(JSON.stringify({ hit: { i: mensagem.i, j: mensagem.j, from: mensagem.user, hist: hist } }))
                            }
                        }
                    })


                    if (Result.size == 0) {
                        //checking for the end of the game
                        //done <.>
                        const loser = Lobbys.get(mensagem.path).find(e => e.user != mensagem.user).user
                        const winner = Lobbys.get(mensagem.path).find(e => e.user == mensagem.user).user

                        LobbyHist.set(mensagem.path, LobbyHist.get(mensagem.path).concat([`Vencedor: ${winner}`]).concat([`Derrotado: ${loser}`]))

                        Acabou(winner, loser, LobbyHist.get(mensagem.path))
                        //fetch do historico

                        Lobbys.delete(mensagem.path)
                        LobbyTurns.delete(mensagem.path)
                        LobbyHist.delete(mensagem.path)
                        console.log(JSON.stringify({ Winner: mensagem.user }))
                        wss.clients.forEach(wsClients => {
                            for (let logar = 0; logar < websocketss.length; logar++) {
                                if (wsClients == websocketss[logar]) {
                                    wsClients.send(JSON.stringify({ Winner: mensagem.user }))
                                }
                            }
                        })
                    }
                }

                else if (resultado == "a") {
                    //haha falhaste

                    const hist = [`${mensagem.user}: Missed at, X:${mensagem.i + 1}  Y:${coordsy[mensagem.j]}`]
                    LobbyHist.set(mensagem.path, LobbyHist.get(mensagem.path).concat(hist))

                    const turns = LobbyTurns.get(mensagem.path)
                    LobbyTurns.set(mensagem.path, { ...turns, turn: turns.users.find(e => e != turno) })
                    console.log(JSON.stringify({ miss: { i: mensagem.i, j: mensagem.j, from: mensagem.user, hist: hist } }))
                    wss.clients.forEach(wsClients => {
                        for (let logar = 0; logar < websocketss.length; logar++) {
                            if (wsClients == websocketss[logar]) {
                                wsClients.send(JSON.stringify({ miss: { i: mensagem.i, j: mensagem.j, from: mensagem.user, hist: hist } }))
                            }
                        }
                    })
                }
            }
        }
    })

    ws.on("close", (ws) => {
        console.log("Alguém desconectou-se")

        // não implementar filtro de same player para mostrar isto com mais que um lobby

        for (let i = 0; i < wsLocation.length; i++) {
            if (!wss.clients.has(wsLocation[i].ws)) {
                const path = wsLocation[i].path
                if (path) {

                    const loser = Lobbys.get(path)?.find(e => e.ws == wsLocation[i].ws)?.user
                    const winner = Lobbys.get(path)?.find(e => e.ws != wsLocation[i].ws)?.user



                    Lobbys.delete(path)
                    LobbyTurns.delete(path)


                    if (winner && loser) {
                        console.log(winner, loser)

                        LobbyHist.set(path, LobbyHist.get(path).concat([`Player:${loser} desistio`]).concat([`Vencedor: ${winner}`]))
                        Acabou(winner, loser, LobbyHist.get(path))
                        LobbyHist.delete(path)


                        wss.clients.forEach(wsClient => {
                            wsClient != wsLocation[i].ws ?
                                wsClient.send(JSON.stringify({ Winner: winner })) : null
                        })

                    }

                    wsLocation.splice(i, 1)
                }
            }
        }
        console.log(wss.clients.size)
    })
})

function Acabou(winner, loser, historico) {
    fetch("http://localhost:3001/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Winner: winner, Loser: loser })
    })
    fetch("http://localhost:3001/hist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(historico)
    })
}

