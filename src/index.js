import { createRoot } from "react-dom/client";
import Hello from "./Hello";

const DIV = document.createElement('div')
DIV.id = 'hkk'
document.body.appendChild(DIV)

const container = document.getElementById("hkk");
const root = createRoot(container);
root.render(<Hello />);


const messagesFromReactAppListener = (msg, sender, sendResponse) => {
  console.log('[content.js]. Message received', msg);

  const response = {
    title: document.title,
    headlines: Array.from(document.getElementsByTagName<"h1">("h1")).map(h1 => h1.innerText)
  };

  console.log('[content.js]. Message response', response);

  sendResponse(response)
}

/**
 * Fired when a message is sent from either an extension process or a content script.
 */
chrome.runtime.onMessage.addListener(messagesFromReactAppListener);
