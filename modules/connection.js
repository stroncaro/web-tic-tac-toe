// Constants
const RTC_CONNECTION_SETTINGS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

// UI elements
const div = document.getElementById("connection-applet");
const button = document.getElementById("connection-button");
const message = document.getElementById("connection-message");
const input = document.getElementById("connection-input");
const output = document.getElementById("connection-output");
const inputMsg = document.getElementById("connection-input-message");
const confirmButton = document.getElementById("connection-confirm-button");

// Connect and set up
let channel = null;
const connection = new RTCPeerConnection(RTC_CONNECTION_SETTINGS);
const offerFromQuery = getOfferFromQuery();

connection.ondatachannel = (event) => {
  console.log("ondatachannel");
  channel = event.channel;
  channel.onmessage = (event) => alert(event.data);
};

connection.onconnectionstatechange = () => {
  console.log(`connectionstatechange: ${connection.connectionState}`);
};

connection.oniceconnectionstatechange = () => {
  console.log(`iceconnectionstatechange: ${connection.iceConnectionState}`);
};

(async () => {
  if (offerFromQuery) {
    // This is the answering party receiving an offer
    message.textContent = "Loading invitation...";
    await connection.setRemoteDescription(offerFromQuery);

    message.textContent = "Click button to accept invitation!";
    button.textContent = "Accept invitation";
    button.disabled = false;
    button.onclick = createAnswer;
  } else {
    // Page loaded without an offer
    message.textContent = "Click button to start connection process";
    button.disabled = false;
    button.onclick = createOffer;
  }
})();

// Functions
async function createOffer() {
  button.disabled = true;

  channel = connection.createDataChannel("data");
  channel.onmessage = (event) => alert(event.data);

  connection.onicecandidate = (event) => {
    if (!event.candidate) {
      // Feedback
      // TODO: extract method
      const href = window.location.href;
      const base = href.includes("?") ? href.slice(0, href.indexOf("?")) : href;
      const query =
        "?O=" + encodeURI(JSON.stringify(connection.localDescription));
      const link = base + query;

      // TODO: decouple UI?
      message.textContent = "Share link to invite! (copied to clipboard)";
      navigator.clipboard.writeText(link); // TODO: manage possible errors
      output.value = link;
      output.hidden = false;

      inputMsg.textContent = "Paste peer reply below to initiate connection";
      input.value = "";
      input.hidden = false;
      input.oninput = () => {
        confirmButton.hidden = false;
      };
      confirmButton.onclick = acceptAnswer;
    }
  };

  const offer = await connection.createOffer();
  await connection.setLocalDescription(offer);
}

async function createAnswer() {
  button.disabled = true;

  connection.onicecandidate = (event) => {
    if (!event.candidate) {
      const answerJson = JSON.stringify(connection.localDescription);

      // Feedback
      navigator.clipboard.writeText(answerJson); // TODO: manage possible errors

      // TODO: decouple UI?
      output.value = answerJson;
      output.hidden = false;
      message.textContent = "Share code to connect (copied to clipboard)";
    }
  };

  const answer = await connection.createAnswer();
  await connection.setLocalDescription(answer);
}

async function acceptAnswer() {
  confirmButton.disabled = true;

  const answer = JSON.parse(input.value);
  connection.setRemoteDescription(answer);
}

function getOfferFromQuery() {
  const params = decodeURI(window.location.search).slice(1).split("&");

  let offer;
  try {
    offer = params.find((p) => p.startsWith("O={") && p.endsWith("}"));
    offer = offer.slice("O=".length);
    offer = JSON.parse(offer);
  } catch {
    offer = null;
  }

  return offer;
}
