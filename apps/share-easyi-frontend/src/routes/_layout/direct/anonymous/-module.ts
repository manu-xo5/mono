export async function getScreenCaptureStream() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
    });

    return stream;
  } catch (err) {
    console.debug(err);
    return null;
  }
}
