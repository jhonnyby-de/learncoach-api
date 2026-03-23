export default function handler(req, res) {
    res.status(200).json({
        status: "ok",
        service: "LearnCoach API",
        version: "1.0.0"
    });
}