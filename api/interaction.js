export default function handler(req, res) {
    if (req.method === "POST") {
        const { ticker } = req.body;
        res.status(200).json({ message: `Simulation for ${ticker} started!` });
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}
