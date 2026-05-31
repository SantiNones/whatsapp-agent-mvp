export function getMediaItemsFromTwilioPayload(body) {
  const mediaCount = Number.parseInt(body.NumMedia || "0", 10);

  if (!Number.isFinite(mediaCount) || mediaCount <= 0) {
    return [];
  }

  return Array.from({ length: mediaCount }, (_, index) => ({
    url: body[`MediaUrl${index}`],
    contentType: body[`MediaContentType${index}`]
  })).filter((mediaItem) => mediaItem.url && mediaItem.contentType);
}

export async function downloadTwilioMediaAsDataUrl(mediaUrl, contentType) {
  const credentials = Buffer.from(
    `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
  ).toString("base64");

  const response = await fetch(mediaUrl, {
    headers: {
      Authorization: `Basic ${credentials}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to download Twilio media. Status: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  return `data:${contentType};base64,${base64}`;
}
