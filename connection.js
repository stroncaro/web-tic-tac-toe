// Constants
const RTC_CONNECTION_SETTINGS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

// UI elements
const button = document.getElementById("connection-button");
const message = document.getElementById("connection-message");

// Connection
const connection = await initializeConnection();
const channel = connection.createDataChannel("data");
channel.onmessage((event) => alert(event.data));

async function makeOffer() {
  const offer = connection.createOffer();
  await connection.setLocalDescription(offer);
}

async function makeAnswer() {
  if (connection.remoteDescription) {
    const answer = await connection.createAnswer();
    await connection.setLocalDescription(answer);
  }
}

// TODO: generate a link
function makeLink() {}

// Functions
async function initializeConnection() {
  const connection = new RTCPeerConnection(RTC_CONNECTION_SETTINGS);
  const [offer, answer] = getOfferAndAnswer();

  if (offer) {
    if (answer) {
      // This is the offering party replying to the answer
      await connection.setLocalDescription(offer);
      await connection.setRemoteDescription(answer);
    } else {
      // This is the answering party
      await connection.setRemoteDescription(offer);
    }
  }

  return connection;
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
