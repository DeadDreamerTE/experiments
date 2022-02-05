import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import './App.css';
import DragDrop from "./Components/DragDrop";
import LoginForm from "./Components/LoginForm";
import SignupForm from "./Components/SignupForm";
import TheWebSocket from "./Components/WebSocket";


function App() {
  return (
    <BrowserRouter>


      <Routes>
        <Route exact path="/" element={<DndProvider backend={HTML5Backend}><DragDrop /></DndProvider>} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/private/:idk" element={<TheWebSocket />} />



      </Routes>
    </BrowserRouter>

  )
}


export default App;
