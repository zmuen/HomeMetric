const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
require('dotenv').config();

PERPLEXITY_API_KEY = "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"

const db = new sqlite3.Database('./livability.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error('Error when connecting to the database', err.message);
    } else {
        console.log('Connected to the database.');
        db.run(`CREATE TABLE IF NOT EXISTS livability (
            neighbourhood TEXT PRIMARY KEY,
            amenities INTEGER, commute INTEGER, cost_of_living INTEGER, crime INTEGER,
            employment INTEGER, health_safety INTEGER, housing INTEGER, schools INTEGER,
            user_ratings INTEGER, overall_livability INTEGER
        )`);
    }
});

async function fetchLivabilityScores(neighbourhood) {
    const messages = [
        {
            role: "system",
            content: "You are an AI trained to provide livability scores."
        },
        {
            role: "user",
            content: `Give me the livability scores (integer type) for each of the categories in separate lines: [amenities, commute, cost_of_living, crime, employment, health_safety, housing, schools, user_ratings, overall_livability] for the neighbourhood: ${neighbourhood} from Area Vibes website. If a particular category is not available, please return a score of 0. Please ensure all the categories listed above get a value as listed in the Area Vibes website and the output JSON format is as follows: '- [Category]: [Score]'`
        }
    ];

    try {
        const response = await axios.post('https://api.perplexity.ai', {
            messages: messages,
        }, {
            headers: { 'Authorization': `Bearer ${PERPLEXITY_API_KEY}` }
        });
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error fetching data from Perplexity AI:', error);
        throw error;
    }
}

async function getLivability(req, res) {
    const neighbourhood = req.body.neighbourhood;
    db.get('SELECT * FROM livability WHERE neighbourhood = ?', [neighbourhood], async (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (row) {
            res.json(row);
        } else {
            try {
                const scoresText = await fetchLivabilityScores(neighbourhood);
                // You need to parse scoresText and extract scores, then insert them into the database
                res.json({ message: "Fetched new data from Perplexity AI", data: scoresText });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        }
    });
}

module.exports = { getLivability };