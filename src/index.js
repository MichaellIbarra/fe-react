import React from "react";
import ReactDOM from "react-dom/client";
import Approuter from "./approuter";
import { refreshTokenKeycloak } from "./auth/authService";

// CSS & Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import "./assets/css/style.css";
import "./assets/css/select2.min.css";
//Font Awesome
import '../node_modules/@fortawesome/fontawesome-free/css/all.min.css';
import '../node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.js';

function decodeJWT(token) {
    if (!token) return null;
    try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        return decoded;
    } catch (e) {
        return null;
    }
}

async function checkAndRefreshToken() {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    if (!accessToken || !refreshToken) return;
    const decoded = decodeJWT(accessToken);
    if (!decoded || !decoded.exp) return;
    const now = Math.floor(Date.now() / 1000);
    // Si faltan menos de 60 segundos para expirar, refresca
    if (decoded.exp - now < 60) {
        await refreshTokenKeycloak(refreshToken);
    }
}

setInterval(checkAndRefreshToken, 60000); // Cada minuto
checkAndRefreshToken(); // Al cargar

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
        <Approuter/>
);