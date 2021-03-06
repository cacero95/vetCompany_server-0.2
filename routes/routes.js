const express = require('express');
const jwt = require('jsonwebtoken');
const FCM = require('fcm-node');
const serverKey = 'AAAAlmADi1I:APA91bGsjLbkSuzR9OEBcTKzeCUkls0hoi96k6DLUGY4KSO7_nF538JMyGInm0JVz-3T7RCGMOJvvvZIooYglGR26__VsunVn5um4GWjAsVkJpYdGqluLMz6YiRQONj88XhNPdkcaUfK';
const bcrypt = require('bcrypt'); // se encarga de encriptar data
const app = express();
// importaciones de la libreria de twitter
const Twitter = require('twitter');

const _ = require('underscore');

// importamos el modelo de los normal user
const User = require('../models/user');
// importamos el modelo de las instituciones
const Vet = require('../models/instituciones');

//FB.getLoginStatus(response => {
//    console.log(response);
//    statusChangeCallback(response);
//});

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
const params = { screen_name: 'nodejs' };
app.post('/twitter', (req, res) => {

    let body = req.body;
    let tema_busqueda = body.tema;

    let type = body.type;

    let lenguage = body.idioma;

    // https://api.twitter.com/1.1/search/tweets.json?q=${tema_busqueda}&count=5 busqueda de tweets sobre un tema


    /**
     * si queremos buscar por hashtag usamos https://api.twitter.com/1.1/search/tweets.json?q=%23programando&result_type=recent
     */
    /**
     * entra al switch case para ver que tipo de servicio se necesita
     */
    switch (type) {
        case 'normal':
            client.get(`https://api.twitter.com/1.1/lists/members.json?owner_screen_name=cacero95&cursor=-1&list_id=1115750658475528192`, params, (error, tweets, response) => {
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
            break;
        case 'cambiar_lista': //obtine las listas en twitter de un usuario ya loggeado
            client.get(`https://api.twitter.com/1.1/lists/list.json?screen_name=${tema_busqueda}`, params, (error, tweets, response) => {
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
            break;
        case 'hashtag':
            client.get(`https://api.twitter.com/1.1/search/tweets.json?q=%23${tema_busqueda}&result_type=recent`, params, (error, tweets, response) => {
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
            break;
        case 'tweets':
            client.get(`https://api.twitter.com/1.1/search/tweets.json?q=${tema_busqueda}&count=10&lang=es`, params, (error, tweets, response) => {
                if (error) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: err
                    });
                }
                res.json({
                    cuerpo: tweets
                })
            })

    }

});

app.post('/notificaciones', (req, res) => {
    let body = req.body;
    let fcm = new FCM(serverKey);
    let message = {
        to: body.token,
        collapse_key: 'curiosidadandroid',
        notification: {
            title: 'Mensaje para andres',
            body: 'texto del mensaje',
            click_action: 'FCM_PLUGIN_ACTIVITY'
        },
        data: {
            Usuario: 'Usuario nodejs',
            Email: 'cacero95@gmail.com'
        }
    }
    fcm.send(message, (err, response) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'something was wrong in the notifications'
            });
        }
        res.json({
            ok: true,
            mensaje: response
        });
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
app.post('/cargar', (req, res) => {
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
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});


module.exports = app;
