export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const fileBuffer = Buffer.concat(chunks);

  // const filename = req.headers["x-file-name"] || `file-${Date.now()}`;
  const encoded = req.headers["x-file-name"];
  const filename = decodeURIComponent(escape(Buffer.from(encoded, "base64").toString("utf-8")));

  try {
    const form = new FormData();
    form.append("image", new Blob([fileBuffer]), filename);

    const result = await fetch(
      `https://api.imgbb.com/1/upload?key=03ecaa75934206c013c19cb81890da15`,
      { method: "POST", body: form }
    );

    const json = await result.json();
    const url = json.data.url; // https://i.ibb.co/C5x1rm6z/profile.png
    const [, , , id, name] = url.split("/");

    return res.status(200).json({ id, name });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
