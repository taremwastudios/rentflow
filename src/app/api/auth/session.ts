export default function handler(req, res) { res.status(200).json({ user: { id: 1, name: "Demo User", email: "user@demo.com", role: "landlord" } }); }
