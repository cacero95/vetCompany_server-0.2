const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // se encarga de encriptar data
const app = express();
// importaciones de la libreria de twitter
const Twitter = require('twitter');
const _ = require('underscore');

// importamos el modelo de los normal user
const User = require('../models/user');
// importamos el modelo de las instituciones
const Vet = require('../models/instituciones');
/**
 * verifica tokens
 */
//const { verifica_token } = require('../middlewares/autenticacion');


/**
 * Twitter credentials
 */
const client = new Twitter({
    consumer_key: process.env.twitter_key,
    consumer_secret: process.env.twitter_secret,
    access_token_key: process.env.twitter_token_key,
    access_token_secret: process.env.twitter_token_secret
});
// twitter services
app.get('/twitter', (req, res) => {

    client.get('https://api.twitter.com/1.1/search/tweets.json?q=basket_best_players', params, (error, tweets, response) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                mensaje: err
            });
        }
        res.json({
            cuerpo: tweets
        })
    });

});




//institute services
app.get('/login_vet', (req, res) => {
    let body = req.body;
    Vet.findOne({ email: body, email }, (err, usuarioDB) => {
        if (err) { // lost network
            return res.status(500).json({
                ok: false,
                mensaje: err
            })
        }
        if (!usuarioDB) { // user no found 
            return res.status(400).json({
                ok: false,
                mensaje: err
            });
        }
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: err
            });
        }
        let token = jwt.sign({
            Vet: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
        /**
               * ese expired lee el parametro de la siguiente manera
               segundos, minutos, horas, dias en this case 30 days
               */
        res.json({
            ok: true,
            Vet: usuarioDB,
            token
        });

    })
})
app.get('/login_user', (req, res) => {
    let body = req.body; // agrego el body para poder usar sus parametros
    Users.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) { // error en la conexion
            return res.status(500).json({
                ok: false,
                mensaje: err
            });
        }
        if (!usuarioDB) { // no encontro el usuario en la dba
            return res.status(400).json({
                ok: false,
                err: {
                    mensaje: 'No se encontro el usuariO en la base de datos'
                }
            });
        }
        /**
         * se compara las contraseñas
         */
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {

            /**
             * contrasta el password digitado con el que tiene la base de datos segun el correo
             * arroja true is success, other way false
             */
            return res.status(400).json({
                ok: false,
                mensaje: {
                    mensaje: 'No se encontro el usuariO en la base de datos'
                }
            });
        }
        let token = jwt.sign({
            User: usuarioDB
        }, procees.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN })
        res.json({
            ok: true,
            User: usuarioDB,
            token
        });

    })
});
/**
 * Cargar usuarios
 */
app.post('/signUp', (req, res) => {
    let body = req.body;
    let usuario;
    if (body.type == 'normal') {
        usuario = new User({
            name: body.name,
            apellido: body.apellido,
            email: body.email,
            password: bcrypt.hashSync(body.password, 10), // se encripta password
            mascotas: body.mascotas,
            direccion: body.direccion,
            telefono: body.telefono,
            pet_institutes: body.pet_institutes
        });
    } else {
        usuario = new Vet({
            name: body.name,
            direccion: body.direccion,
            telefono: body.telefono,
            email: body.email, //no hay que verificar ya que el email es unique
            password: bcrypt.hashSync(body.password, 10), // se encripta password
            img: body.img,
            users: body.users,
            servicios: body.servicios
        });
    }

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: err
            })
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

module.exports = app;