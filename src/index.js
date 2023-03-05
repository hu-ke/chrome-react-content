import { createRoot } from "react-dom/client";
import Hello from "./Hello.tsx";
import * as React from "react";


const DIV = document.createElement('div')
DIV.id = 'hkk'
document.body.appendChild(DIV)

const container = document.getElementById("hkk");
const root = createRoot(container);
root.render(<Hello />);


