self.onconnect = (conn) => {
    conn.postMessage("connected 200")
    console.debug("heelo from shared worker")
}

console.debug("hello worker world")
