import { get } from "@vercel/blob";

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).send("Missing id");

  try {
    const blob = await get(`images/${id}`);
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", blob.contentType);
    res.setHeader("Content-Length", buffer.length);

    return res.status(200).send(buffer);
  } catch (e) {
    return res.status(404).send("File not found");
  }
}
