require('./config/config')
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const hbs = require('hbs');
const path = require('path');


/**
 * creo los middlewares de la aplicacion
 * con el app.use
 */
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// con estos metodos preparo el proyecto a recivir JSON
// parse application/json
app.use(bodyParser.json());

/**
 * con la siquiente linea permito hacer peticiones al servidor
 */

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

app.use(express.static(path.resolve(__dirname, './public')));


app.use(require('./routes/routes'));

// Dba connection

mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true },
    (err, res) => {
        // se llama para saber si se pudo hacer la coneccion
        if (err) throw err;
        console.log('data base online');
    });

/**
 * con esto doy permiso al servidor que use los servicios del crud
 */



app.listen(process.env.PORT, () => {
    console.log(`Estoy escuchando por el puerto ${process.env.PORT}`);
})