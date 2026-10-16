const express = require('express');
const app = express();

let goal = 'Learn Docker';

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <title>My Goal</title>
            <link rel="stylesheet" href="/simple.css">
        </head>
        <body>
            <div class="container">
                <h1>My Current Goal</h1>
                <p>${goal}</p>

                <form action="/add-goal" method="POST">
                    <input type="text" name="goal"
                           placeholder="Enter a new goal" required>
                    <button type="submit">Update Goal</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

app.post('/add-goal', (req, res) => {
    goal = req.body.goal;
    res.redirect('/');
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});