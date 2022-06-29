// require express
const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
var cors = require('cors')
const app = express();
const PORT = 3010;
const connectionString = 'mongodb+srv://sanoj:ItsFreeGuys@cluster0.0fswi.mongodb.net/?retryWrites=true&w=majority';
const data = require('./csvjson.json');
var ObjectId = require('mongodb').ObjectId;

const startAPP = async () => {
    // Middleware
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static('public'));
    app.use(bodyParser.json());
    app.use(cors())

    MongoClient.connect(connectionString, (err, client) => {
        if (err) return console.error(err);
        console.log('Connected to Database');
        const db = client.db('drama-db');
        const dramaCollection = db.collection('dramas');


        app.get('/', function (req, res) {
            res.json({
                msg: 'API is running'
            });
        });

        app.get('/dramas', async (req, res) => {
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            const offset = req.query.offset ? parseInt(req.query.offset) : 0;
            const count = await dramaCollection.countDocuments();
            const totalPages = Math.ceil(count / limit);

            return dramaCollection.find().limit(limit).skip(offset).toArray().then(result => res.json({ result, count, totalPages })).catch(error => console.err(error));
        })


        app.get('/dramas/:id', async (req, res) => {
            const { id } = req.params;
            await dramaCollection.findOne({ _id: ObjectId(id) }).then(result => res.json(result)).catch(error => console.err(error));
        })


        app.post('/dramas', (req, res) => {
            dramaCollection.insertOne(res?.body).then(result => res.json(result)).catch(error => console.err(error));
        })


        app.put('/dramas', (req, res) => {
            dramaCollection.findOneAndUpdate(
                { name: 'Yoda' },
                {
                    $set: {
                        name: req.body.name,
                        quote: req.body.quote
                    }
                },
                {
                    upsert: true
                }
            )
                .then(result => {
                    res.json('Success');
                })
                .catch(error => console.error(error));
        })

        app.delete('/dramas', (req, res) => {
            dramaCollection.deleteOne(
                { name: req.body.name }
            )
                .then(result => {
                    if (result.deletedCount === 0) {
                        return res.json('No quote to delete')
                    }
                    res.json(`Deleted Darth Vadar's quote`)
                })
                .catch(error => console.error(error))
        })
    });

    app.listen(PORT, () => {
        console.log(`listening on port ${PORT}`);
    })
};


startAPP()
    .then(() => console.debug('Server start sequence finished and the API is UP AND RUNNING'))
    .catch(e => console.error('Failed to start the app', e));
