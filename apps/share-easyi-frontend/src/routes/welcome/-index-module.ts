export function getPeerIdFromStorage() {
  try {
    const name = localStorage.getItem("share-easyi:peer-id") ?? "";
    return name;
  } catch {
    return "";
  }
}
