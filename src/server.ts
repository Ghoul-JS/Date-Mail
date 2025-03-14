import 'dotenv/config'
// require('dotenv/config');
import app from './app'
// import dbConnect from './database';
const PORT = 3001;

// dbConnect()

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`)
})