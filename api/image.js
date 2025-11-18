export default function handler(req, res) {
  const { id, name } = req.query;
  if (!id || !name) return res.status(400).send("Missing query parameters");
  return res.redirect(`https://i.ibb.co/${id}/${name}`);
}
