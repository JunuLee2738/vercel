import { put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const data = await req.body;
  const fileBuffer = Buffer.from(await data.arrayBuffer());
  const fileName = req.headers["x-file-name"];

  const { url } = await put(`images/${Date.now()}-${fileName}`, fileBuffer, {
    access: "public"
  });

  const id = url.split("/").pop(); // e.g. 1737104847773-photo.png

  res.status(200).json({ id });
}
