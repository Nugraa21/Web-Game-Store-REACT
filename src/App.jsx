import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./index.css";
import Home from "./Pages/Home.jsx";
import Game from "./Pages/Game.jsx";
import AnimatedBackground from "./components/Background.jsx";
import Navbar from "./components/Navbar.jsx";
import Portofolio from "./Pages/Portofolio.jsx"
import ContactPage from "./Pages/Contact.jsx";
import WelcomeScreen from "./Pages/WelcomeScreen.jsx";
import { AnimatePresence } from 'framer-motion';
import NotFound from "./NotFound.jsx";

// Di bagian atas untuk memasukan berberapa import librari / componentes
// Dan pada bagian bawah di di mana kita akan langsung memprogram structure nya satu persatu


const LandingPage = ({ showWelcome, setShowWelcome }) => {
  return (
    <div>App</div>
  )
}

export default App