// *** Importing libraries section ***

// bring in express
const express = require('express')
// bind express call to "app" 
const app = express()
// bring in mongodb client lib
const MongoClient = require('mongodb').MongoClient
// hardcoded port incase there is no env equivalent
const PORT = 2121
// load in env variables from dotenvs .env file
require('dotenv').config()

// *** Database bootstap section ***

// define variables used by db, hold the connection string which will have login and uri details and finally set the name of the db used
let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'todo'

// fire up db connection using the string from before, useUnifiedTopology will change rules for connecting and discovering db servers, possibly already default
MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        // once the connection is established then the db binding is set and can be used elsewhere
        db = client.db(dbName)
    })

// *** Middleware section ***

// set view engine to EJS, this is our templating engine, see .ejs files in ./views/ folder
app.set('view engine', 'ejs')
// set a folder for static routes, any file in the ./public/ folder will be served
app.use(express.static('public'))
// ability to grab parameters from the url itself, http://example.com/?foo=bar&goo=car will become an object {foo:bar, goo:car}
app.use(express.urlencoded({ extended: true }))
// handy json, shorthand ways to just pack an object into a response or read from a request (?)
app.use(express.json())

// *** routing logic section ***

// get webroot route. an async function which may delay actions until the await requests within finish
app.get('/',async (request, response)=>{
    // make an array of all items in the collection, pause execution until the db responds
    const todoItems = await db.collection('todos').find().toArray()
    // returns a number of items which have a specified value
    const itemsLeft = await db.collection('todos').countDocuments({completed: false})
    // make a response but first render it through ejs, pass values to be used by the renderer
    response.render('index.ejs', { items: todoItems, left: itemsLeft })
    
    // old way of doing things using promises rather than async
    // db.collection('todos').find().toArray()
    // .then(data => {
    //     db.collection('todos').countDocuments({completed: false})
    //     .then(itemsLeft => {
    //         response.render('index.ejs', { items: data, left: itemsLeft })
    //     })
    // })
    // .catch(error => console.error(error))
    // guess we don't expect errors so no catching here (TODO : add error catching)
})

// route to add data to the system via HTTP POST
app.post('/addTodo', (request, response) => {
    // grab the data sent via post and create a new object to put into the database using the post data and some default initial values
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false})
    .then(result => {
        console.log('Todo Added')
        // once the db operation has completed and returned our promise redirect the user to the webroot where they will pull fresh data
        response.redirect('/')
    })
    .catch(error => console.error(error))
    // just incase the db falls over show an error
})

// updating a record in the db which is already present but needs one thing changed
app.put('/markComplete', (request, response) => {
    // updateOne(filter, update, options) first param is to find the item to update, second is what to update and then misc options
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: true
          }
    },{
        sort: {_id: -1},    // TO TEST - Guess it resorts based on id, not sure if this is normal
        upsert: false       // would add a new document if one didn't exist, not what we want today
    })
    .then(result => {
        console.log('Marked Complete')
        // send a response back to the client after the db operations are done, just a string but as its json it'll look complicated
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})

// same as above but setting a different value
app.put('/markUnComplete', (request, response) => {
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: false
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})

// HTTP DELETE method request
app.delete('/deleteItem', (request, response) => {
    // deleteOne just needs a filter, it'll delete the first thing that it finds which matches the filter
    db.collection('todos').deleteOne({thing: request.body.itemFromJS})
    .then(result => {
        console.log('Todo Deleted')
        // and once the db action is complete and the promise is returned send a confomration to the client
        response.json('Todo Deleted')
    })
    .catch(error => console.error(error))

})

// *** Server launch section ***

// Open our server on PORT from .env or if that fails the PORT set at the beginning of this file, all other options are default (like hostname)
// once open fire off a callback to console.log for convenience
app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})
