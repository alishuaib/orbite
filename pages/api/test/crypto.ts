import { NextApiRequest, NextApiResponse } from "next/types"
import { createCipheriv, randomBytes, createDecipheriv } from "crypto"

export default async (req: NextApiRequest, res: NextApiResponse) => {
	// Encryption
	const message = JSON.stringify({
		course_id: "2",
		course_name: "This is a Test",
		user_id: "user_9018249081209",
	})
	const key = Buffer.from("12345678901234567890123456789012") // use a Buffer for the key
	const iv = randomBytes(16) // generate a new IV

	const cipher = createCipheriv("aes-256-cbc", key, iv)

	let encrypted = cipher.update(message, "utf8", "hex")
	encrypted += cipher.final("hex")

	const outputMessage = iv.toString("hex") + ":" + encrypted // prepend the IV to the ciphertext

	console.log(outputMessage)

	// Decryption
	const [ivHex, encryptedMessage] = outputMessage.split(":") // split the IV and the ciphertext

	const decipher = createDecipheriv(
		"aes-256-cbc",
		key,
		Buffer.from(ivHex, "hex")
	) // use the IV to create the decipher

	let decrypted = decipher.update(encryptedMessage, "hex", "utf8")
	decrypted += decipher.final("utf8")

	console.log(decrypted)

	return res.status(200).send("success")
}
