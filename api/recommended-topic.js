import { recommendNextTopic } from "../lib/recommender.js";

export default function handler(req, res) {
    const { weakTopics } = req.body;

    const recommendation = recommendNextTopic(weakTopics);

    res.status(200).json({
        recommendation
    });
}