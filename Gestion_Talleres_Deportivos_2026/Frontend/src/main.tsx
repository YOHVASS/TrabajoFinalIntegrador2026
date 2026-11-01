
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import "./index.css";
import App from "./App";
import PortalPublico from "./portal/PortalPublico";
import OfertaPublica from "./portal/OfertaPublica";
import InscripcionPublica from "./portal/InscripcionPublica";
import ConsultaPreinscripcion from "./portal/ConsultaPreinscripcion";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<PortalPublico />} />
                <Route path="/oferta" element={<OfertaPublica />} />
                <Route path="/inscripcion" element={<InscripcionPublica />} />
                <Route
                    path="/consulta-preinscripcion"
                    element={<ConsultaPreinscripcion />}
                />
                <Route path="/admin/*" element={<App />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    </StrictMode>
);
