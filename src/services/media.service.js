export function getMediaItemsFromTwilioPayload(body) {
  const mediaCount = Number.parseInt(body.NumMedia || "0", 10);

  if (!Number.isFinite(mediaCount) || mediaCount <= 0) {
    return [];
  }

  const mediaItems = Array.from({ length: mediaCount }, (_, index) => ({
    url: body[`MediaUrl${index}`],
    contentType: body[`MediaContentType${index}`]
  })).filter((mediaItem) => mediaItem.url && mediaItem.contentType);

  console.log("Media detected from Twilio payload", {
    mediaCount: mediaItems.length,
    contentTypes: mediaItems.map((mediaItem) => mediaItem.contentType)
  });

  return mediaItems;
}

export async function downloadTwilioMediaAsDataUrl(mediaUrl, contentType) {
  try {
    console.log("Downloading Twilio media", {
      contentType
    });

    const credentials = Buffer.from(
      `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
    ).toString("base64");

    const response = await fetch(mediaUrl, {
      headers: {
        Authorization: `Basic ${credentials}`
      }
    });

    if (!response.ok) {
      console.error("Failed to download Twilio media", {
        status: response.status
      });

      throw new Error(`Failed to download Twilio media. Status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const byteSize = arrayBuffer.byteLength;
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    console.log("Twilio media downloaded successfully", {
      contentType,
      byteSize
    });

    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error("Failed to download Twilio media", {
      message: error.message
    });

    throw error;
  }
}
