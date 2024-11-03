const WARN = {
  ALREADY_CONFIGURED: "Configure superfluous call",
  NOT_CONNECTED: "Not connected to peer",
};

const ERROR = {
  NOT_CONFIGURED: "Must configure first",
  INVALID_ROLE: "Invalid role",
};

const ROLE = {
  NONE: null,
  SENDER: "sender",
  RECEIVER: "receiver",
};

const RTC_CONNECTION_SETTINGS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const connection = new RTCPeerConnection(RTC_CONNECTION_SETTINGS);

class ConnectionManagerState {
  static configured = false;
  static connected = false;
  static role = ROLE.NONE;
  static channel = null;
}

export default class ConnectionManager {
  static onconfigurestart;
  static onconfigureend;
  static oncreateofferstart;
  static oncreateofferend;
  static onacceptofferstart;
  static onacceptofferend;
  static oncreatereplystart;
  static oncreatereplyend;
  static onacceptreplystart;
  static onacceptreplyend;
  static onconnected;
  static onmessage;

  static async configure(offer = null) {
    if (ConnectionManagerState.configured) {
      console.warn(WARN.ALREADY_CONFIGURED);
      return;
    }

    ConnectionManager.onconfigurestart?.();

    connection.ondatachannel = (event) => {
      console.log("ondatachannel");
      const channel = event.channel;
      channel.onmessage = (event) => ConnectionManager.onmessage?.(event.data);
      ConnectionManagerState.channel = channel;
    };

    connection.onconnectionstatechange = () => {
      console.log(`connectionstatechange: ${connection.connectionState}`);
      if (connection.connectionState === "connected") {
        ConnectionManagerState.connected = true;
        ConnectionManager.onconnected?.();
      }
    };

    connection.oniceconnectionstatechange = () => {
      console.log(`iceconnectionstatechange: ${connection.iceConnectionState}`);
    };

    ConnectionManagerState.configured = true;

    // TODO: manage error from invalid offer?
    if (offer) {
      await this.acceptOffer(offer);
    } else {
      // TODO: make the acceptOffer events fire after after onconfigureend?
      ConnectionManager.onconfigureend?.();
    }
  }

  static async createOffer() {
    assertConfigured();
    assertRole(ROLE.NONE);

    ConnectionManager.oncreateofferstart?.();

    const channel = connection.createDataChannel("data");
    channel.onmessage = (event) => ConnectionManager.onmessage?.(event.data);
    ConnectionManagerState.channel = channel;

    connection.onicecandidate = (event) => {
      if (!event.candidate) {
        const offer = connection.localDescription;
        ConnectionManager.oncreateofferend?.(offer);
      }
    };

    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);
    ConnectionManagerState.role = ROLE.SENDER;
  }

  static async acceptOffer(offer) {
    assertConfigured();
    assertRole(ROLE.NONE);

    ConnectionManager.onacceptofferstart?.();

    ConnectionManagerState.role = ROLE.RECEIVER;
    await connection.setRemoteDescription(offer);

    ConnectionManager.onacceptofferend?.();
  }

  static async createReply() {
    assertConfigured();
    assertRole(ROLE.RECEIVER);

    ConnectionManager.oncreatereplystart?.();

    connection.onicecandidate = (event) => {
      if (!event.candidate) {
        const reply = connection.localDescription;
        ConnectionManager.oncreatereplyend?.(reply);
      }
    };

    const answer = await connection.createAnswer();
    await connection.setLocalDescription(answer);
  }

  static async acceptReply(reply) {
    assertConfigured();
    assertRole(ROLE.SENDER);

    ConnectionManager.onacceptreplystart?.();
    await connection.setRemoteDescription(reply);
    ConnectionManager.onacceptreplyend?.();
  }

  static sendData(data) {
    if (!ConnectionManagerState.connected) {
      console.warn(WARN.NOT_CONNECTED);
      return;
    }

    ConnectionManagerState.channel.send(data);
  }
}

function assertConfigured() {
  if (!ConnectionManagerState.configured) {
    throw Error(ERROR.NOT_CONFIGURED);
  }
}

function assertRole(role) {
  if (ConnectionManagerState.role !== role) {
    throw Error(ERROR.INVALID_ROLE);
  }
}
