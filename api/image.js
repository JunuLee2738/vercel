export default async function handler(req, res) {
  const { id, name } = req.query;

  if (!id || !name) return res.status(400).send("Missing id or name");

  const targetUrl = `https://i.ibb.co/${id}/${name}`;

  try {
    const response = await fetch(targetUrl);

    if (!response.ok) {
      return res.status(response.status).send("Failed to fetch image");
    }

    // Content-Type 유지
    const contentType = response.headers.get("content-type");
    res.setHeader("Content-Type", contentType);

    // 이미지 데이터를 Stream 형태로 전달
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.status(200).send(buffer);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching raw image");
  }
}
