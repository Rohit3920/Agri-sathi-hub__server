const express = require('express');

const app = express();
const PORT =  5000;

app.use(express.json());


app.get('/', (req, res) => {
    res.send('Final year project (Agri sathi hub) website backend running...');
});

app.listen(PORT, () => {
    console.log(`Agri sathi hub - Server running on port ${PORT}`);
});