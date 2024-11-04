import ConnectionManager from "./modules/connectionManager.js";

const div = document.getElementById("connection-applet");
const button = document.getElementById("connection-button");
const message = document.getElementById("connection-message");
const input = document.getElementById("connection-input");
const output = document.getElementById("connection-output");
const inputMsg = document.getElementById("connection-input-message");
const confirmButton = document.getElementById("connection-confirm-button");

const offer = getOfferFromURI();

ConnectionManager.onconfigurestart = () => console.log("configurestart");
ConnectionManager.onconfigureend = () => {
  console.log("configureend");
  button.textContent = "Connect";
  button.disabled = false;
  button.onclick = ConnectionManager.createOffer;
  message.textContent = "Click button to start connection process";
};

ConnectionManager.oncreateofferstart = () => {
  console.log("createofferstart");
  button.textContent = "...";
  button.disabled = true;
  button.onclick = null;
  message.textContent = "Creating link...";
};

ConnectionManager.oncreateofferend = (offer) => {
  console.log("createofferend");
  const query = "?" + encodeURI(JSON.stringify(offer));
  const link = createLink(query);

  navigator.clipboard.writeText(link); // TODO: manage possible errors
  message.textContent = "Share link to invite! (copied to clipboard)";
  button.hidden = true;
  output.value = link;
  output.hidden = false;
  inputMsg.textContent = "Paste peer reply below to initiate connection";
  input.value = "";
  input.hidden = false;
  input.oninput = () => (confirmButton.hidden = false);
  confirmButton.onclick = () => {
    const reply = JSON.parse(input.value);
    ConnectionManager.acceptReply(reply);
  };
};

ConnectionManager.onacceptofferstart = () => {
  console.log("acceptofferstart");
  button.hidden = true;
  message.textContent = "Loading...";
};

ConnectionManager.onacceptofferend = () => {
  console.log("acceptofferend");
  message.textContent = "Click button to accept invitation!";
  button.textContent = "Accept invitation";
  button.disabled = false;
  button.hidden = false;
  button.onclick = ConnectionManager.createReply;
};

ConnectionManager.oncreatereplystart = () => {
  console.log("createreplystart");
  button.disabled = true;
};

ConnectionManager.oncreatereplyend = (reply) => {
  console.log("createreplyend");
  const replyJson = JSON.stringify(reply);

  navigator.clipboard.writeText(replyJson); // TODO: handle possible errors
  message.textContent = "Share code to connect (copied to clipboard)";
  output.value = replyJson;
  output.hidden = false;
};

ConnectionManager.onacceptreplystart = () => {
  console.log("acceptreplystart");
  confirmButton.disabled = true;
};

ConnectionManager.onacceptreplyend = () => console.log("acceptreplyend");

ConnectionManager.onconnected = () => {
  button.hidden = true;
  output.hidden = true;
  message.textContent = "";
  inputMsg.textContent = "Send message to peer:";
  input.hidden = false;
  input.value = "";
  confirmButton.textContent = "Send";
  confirmButton.hidden = false;
  confirmButton.disabled = false;
  confirmButton.onclick = () => ConnectionManager.sendData(input.value);
};

ConnectionManager.onmessage = (data) =>
  (message.textContent = "Peer says: " + data);

await ConnectionManager.configure(offer);

function getOfferFromURI() {
  const data = decodeURI(window.location.search).slice(1);

  let offer;
  try {
    offer = JSON.parse(data);
  } catch {
    offer = null;
  }

  return offer;
}

function createLink(query) {
  const query_index = window.location.href.indexOf("?");
  const href =
    query_index !== -1
      ? window.location.href.slice(0, query_index)
      : window.location.href;
  const link = href + query;
  return link;
}
