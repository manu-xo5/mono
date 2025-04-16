export function getNameFromStorage() {
  try {
    const name = localStorage.getItem("share-easyi:display-name") ?? "";
    return name;
  } catch {
    return "";
  }
}
