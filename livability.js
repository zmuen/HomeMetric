const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
require('dotenv').config();

const db = new sqlite3.Database('./livability.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error('Error when connecting to the database', err.message);
        return;
    }
    console.log('Connected to the database.');
    db.run(`CREATE TABLE IF NOT EXISTS livability (
        neighbourhood TEXT PRIMARY KEY,
        amenities INTEGER,
        commute INTEGER,
        cost_of_living INTEGER,
        crime INTEGER,
        employment INTEGER,
        health_safety INTEGER,
        housing INTEGER,
        schools INTEGER,
        user_ratings INTEGER,
        overall_livability INTEGER
    )`);
});

async function fetchLivabilityScores(neighbourhood) {
    const options = {
        method: 'POST',
        url: 'https://api.perplexity.ai/chat/completions',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`
        },
        data: {
            model: 'mistral-7b-instruct',
            messages: [
                { role: 'system', content: 'Be precise and concise.' },
                { role: 'user', content: `Give me the livability scores (integer type) for each of the categories in separate lines: [amenities, commute, cost_of_living, crime, employment, health_safety, housing, schools, user_ratings, overall_livability] for the neighbourhood: ${neighbourhood} from Area Vibes website. If a particular category is not available, please return a score of 0. Please ensure all the categories listed above get a value as listed in the Area Vibes website and the output format is as follows: '- [Category]: [Score]'` }
            ]
        }
    };

    try {
        const response = await axios.request(options);
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error fetching data from Perplexity AI:', error);
        throw error;
    }
}

function parseLivabilityScores(scoresText) {
    const validCategories = [
        'amenities',
        'commute',
        'cost_of_living',
        'crime',
        'employment',
        'health_safety',
        'housing',
        'schools',
        'user_ratings',
        'overall_livability'
    ];

    return scoresText.trim().split('\n').reduce((acc, line) => {
        const [category, scoreString] = line.slice(2).split(': ').map(s => s.trim());
        if (validCategories.includes(category)) {
            const score = parseInt(scoreString, 10) || 0;
            acc[category.replace(/ /g, '_').toLowerCase()] = score;
        }
        return acc;
    }, {});
}

async function getLivability(req, res) {
    const neighbourhood = req.body.neighbourhood;
    console.log('Received request for livability scores for neighbourhood:', neighbourhood);

    db.get('SELECT * FROM livability WHERE neighbourhood = ?', [neighbourhood], async (err, row) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ error: 'Database error', message: err.message });
        }
        if (row) {
            console.log('Livability scores found in the database for neighbourhood:', neighbourhood);
            return res.json(row);
        }
        console.log('Livability scores not found in the database. Fetching from Perplexity AI...');
        try {
            const scoresText = await fetchLivabilityScores(neighbourhood);
            console.log('Fetched livability scores text:', scoresText);
            const scores = parseLivabilityScores(scoresText);
            console.log('Parsed livability scores:', scores);

            const columns = Object.keys(scores).join(', ');
            const placeholders = Object.keys(scores).map(() => '?').join(', ');
            const sql = `INSERT INTO livability (neighbourhood, ${columns}) VALUES (?, ${placeholders})`;
            db.run(sql, [neighbourhood, ...Object.values(scores)], function(err) {
                if (err) {
                    console.error('Database insert error:', err.message);
                    return res.status(500).json({ error: 'Database insert error', message: err.message });
                }
                console.log('Livability scores inserted into the database for neighbourhood:', neighbourhood);
                res.json({ neighbourhood, ...scores });
            });
        } catch (error) {
            console.error('Error fetching or parsing livability scores:', error.message);
            res.status(500).json({ error: 'Failed to fetch or parse livability scores', message: error.message });
        }
    });
}

module.exports = { getLivability };
