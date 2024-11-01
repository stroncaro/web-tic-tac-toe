// Constants
const RTC_CONNECTION_SETTINGS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

// UI elements
const button = document.getElementById("connection-button");
const message = document.getElementById("connection-message");

// Connect and set up
let channel = null;
const connection = new RTCPeerConnection(RTC_CONNECTION_SETTINGS);
let [offer, answer] = getOfferAndAnswer();

connection.ondatachannel = (event) => {
  console.log("ondatachannel");
  channel = event.channel;
  channel.onmessage = (event) => alert(event.data);
};

connection.onconnectionstatechange = (event) => {
  console.log(`connectionstatechange: ${connection.connectionState}`);
};

connection.oniceconnectionstatechange = (event) => {
  console.log(`iceconnectionstatechange: ${connection.iceConnectionState}`);
};

(async () => {
  if (offer) {
    if (answer) {
      // This is the offering party receiving the answer
      await applyOffer(offer);
      await acceptAnswer(answer);

      // TODO: show feedback
    } else {
      // This is the answering party receiving an offer
      await acceptRemoteOffer(offer);

      // TODO: show feedback
    }
  } else {
    message.textContent = "Click button to start connection process";
    button.disabled = false;
    button.onclick = createOffer;
  }
})();

// Functions
async function createOffer() {
  channel = connection.createDataChannel("data");
  channel.onmessage = (event) => alert(event.data);

  offer = await connection.createOffer();
  await connection.setLocalDescription(offer);

  // Create link
  const href = window.location.href;
  const base = href.includes("?") ? href.slice(0, href.indexOf("?")) : href;
  const query = "?O=" + encodeURI(JSON.stringify(offer));
  const link = base + query;

  message.textContent = `Share link with peer! ${link}`;
  navigator.clipboard.writeText(link);
  button.disabled = true;
}

async function applyOffer(offer) {
  channel = connection.createDataChannel("data");
  channel.onmessage = (event) => alert(event.data);

  await connection.setLocalDescription(offer);
}

async function acceptRemoteOffer(offer) {
  await connection.setRemoteDescription(offer);
}

async function createAnswer() {
  answer = await connection.createAnswer();
  await connection.setLocalDescription(answer);

  // TODO: create link
}

async function acceptAnswer(answer) {
  await connection.setRemoteDescription(answer);
}

function getOfferAndAnswer() {
  const params = window.location.search.slice(1).split("&");

  let offer;
  try {
    offer = params.find((p) => p.startsWith("O={") && p.endsWith("}"));
    offer = offer.slice("O=".length);
    offer = decodeURI(offer);
    offer = JSON.parse(offer);
  } catch {
    offer = null;
  }

  let answer;
  try {
    answer = params.find((p) => p.startsWith("A={") && p.endsWith("}"));
    answer = offer.slice("A=".length);
    answer = decodeURI(answer);
    answer = JSON.parse(offer);
  } catch {
    answer = null;
  }

  return [offer, answer];
}
