import twilio from "twilio"

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = twilio(accountSid, authToken)

export default async function handler(req, res) {
  const { to, message } = req.body

  try {
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to, // e.g. "+919876543210"
    })
    res.status(200).json({ success: true, sid: response.sid })
  } catch (error) {
    console.error("SMS Error:", error)
    res.status(500).json({ success: false, error: error.message })
  }
}
