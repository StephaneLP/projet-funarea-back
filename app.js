/*********************************************************
Dépendances
*********************************************************/
const express = require('express')
const morgan = require('morgan')
const serveFavicon = require('serve-favicon')
const cors = require('cors')
const app = express()

app
    .use(morgan('dev'))    
    .use(serveFavicon(__dirname + '/favicon.png'))
    .use(express.json())
    .use(cors())

/*********************************************************
Routes
*********************************************************/
const AuthRouter = require('./routes/auth.routes')
const AreaTypeRouter = require('./routes/area-type.routes')
const AreaZoneRouter = require('./routes/area-zone.routes')
const AreaRouter = require('./routes/area.routes')

app 
    .use('/api/auth', AuthRouter)
    .use('/api/areatypes', AreaTypeRouter)
    .use('/api/areazones', AreaZoneRouter)
    .use('/api/areas', AreaRouter)

/*********************************************************
Ouverture du port
*********************************************************/
const port = 3001

app.listen(port, () => {console.log(`L'app sur le port ${port}`)})

/*********************************************************
BDD : import des données
*********************************************************/
const data = require('./db/data')

data.initDb()