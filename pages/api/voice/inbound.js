export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  // This endpoint acts as the Webhook URL you configure in your Twilio numbers console.
  // When someone calls the Twilio number, Twilio POSTs to here.
  // We respond with TwiML (XML) commanding Twilio to connect the caller's audio stream to our Python WebSocket.

  // Use a secure WSS URL pointing to our Python worker's real-time endpoint
  const wssUrl = process.env.VOICE_WEBSOCKET_URL || `wss://${req.headers.host.replace('localhost', 'your-ngrok.app')}/voice/stream`;

  // The TwiML command to connect to Sarvam AI integration stream
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Connect>
        <Stream url="${wssUrl}">
            <Parameter name="scrayvaAuth" value="true" />
        </Stream>
    </Connect>
</Response>`;

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(twiml);
}
