import { put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const fileBuffer = Buffer.concat(chunks);

    const fileName = req.headers["x-file-name"] || `file-${Date.now()}`;
    const { url } = await put(`images/${Date.now()}-${fileName}`, fileBuffer, {
      access: "public"
    });

    const id = url.split("/").pop(); // e.g. 1737186819100-photo.png
    return res.status(200).json({ id });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Upload failed", detail: err.message });
  }
}
