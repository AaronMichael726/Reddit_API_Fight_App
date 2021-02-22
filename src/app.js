const express = require('express')
const hbs = require('hbs')
require('./db/mongoose')
const User = require('./models/user')
const auth = require('./middleware/auth')
const bodyParser = require('body-parser')
const path = require('path')

const app = express() 
const PORT = process.env.PORT || 3000

// paths for express config
const publicDirectory = path.join(__dirname, './public')
const pagePath = path.join(__dirname, './views/pages')
const templatePath = path.join(__dirname, './views/pages')

app.set('view engine', 'hbs')
app.set('views', pagePath)
hbs.registerPartials(templatePath)

app.use(express.static(publicDirectory))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('', (req, res) => {
    res.render('index')
})

app.get('/signup', (req, res) => {
    res.render('signup')
})

// 
app.post('/signup', async (req, res) => {
    let { username, email, password } = req.body
    const errors = []

    if (!username) { errors.push('username') } 
    if (!email) { errors.push(' email') }
    if (!password) { errors.push(' password') }

    console.log(errors)

    if(errors.length > 0){
        res.render('signup', {
            body: 'You did not enter: ' + errors
        })

        return
    }
    
    const user = new User(req.body)
    
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send('index', { user, token })
    } catch (e) {
        res.status(400)
    }

    res.redirect('/memePage')  
})

app.post('', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.username, req.body.password)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400)
    }

    res.redirect('/memePage')
})

app.get('/memePage', auth, async (req, res) => {
    res.render('memePage')
})

app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`)
})