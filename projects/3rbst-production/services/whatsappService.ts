
/**
 * Sends a message to a user via the Evolution API.
 * @param remoteJid The user's JID (e.g., "4915100000000@s.whatsapp.net")
 * @param text The message text to send.
 */
export async function sendToWhatsApp(remoteJid: string, text: string) {
  const apiUrl = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_TOKEN;
  const instance = process.env.EVOLUTION_INSTANCE;

  if (!apiUrl || !apiKey || !instance) {
    console.error("WhatsApp API environment variables are not fully configured.");
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/message/sendText/${instance}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify({
        number: remoteJid,
        options: { delay: 1000, presence: "composing" },
        textMessage: { text: text }
      })
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Failed to send WhatsApp message, API responded with error:", {
            status: response.status,
            body: errorBody
        });
    }

  } catch (err) {
    console.error("An exception occurred while trying to send a WhatsApp message:", err);
  }
}
