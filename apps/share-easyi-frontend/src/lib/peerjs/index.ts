import type { Peer } from "peerjs";

export async function createDataConn(peer: Peer, otherPeerId: string) {
  return new Promise((res) => {
    const conn = peer.connect(otherPeerId);

    function handleOpen() {
      clearTimeout(timer);
      res(conn);
    }

    const timer = setTimeout(() => {
      conn.off("open", handleOpen);
      console.debug("Timeout: Connection failed to open");
      res(null);
    }, 5000);

    conn.on("open", handleOpen);
  });
}
