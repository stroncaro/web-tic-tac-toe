// Constants
const RTC_CONNECTION_SETTINGS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

// UI elements
const button = document.getElementById("connection-button");
const message = document.getElementById("connection-message");

// Connection
const [offer, answer] = getOfferAndAnswer();

// TODO: if all arguments are present, connect

// TODO: create initiation link

// TODO: create response linkk

// Functions
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
