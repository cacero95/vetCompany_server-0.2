const unique_validator = require('mongoose-unique-validator');
const mongoose = require('mongoose');


let Schema = mongoose.Schema;

let usuarioSchema = new Schema({
    name: {
        type: String,
        required: [true, 'el nombre es requerido']
    },
    apellido: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: [true, 'El correo es requerido'],
        unique: true
    },
    password: {
        type: String,
        required: false
    },
    telefono: {
        type: Number,
        required: [true, 'el telefono es requerido']
    },
    direccion: {
        type: String,
        required: [true, 'la dirección es requerida']
    },
    google: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        default: 'normal'
    },
    estado: { // indica si el usuario esta identificado
        type: String,
        default: true
    },
    pet_institutes: {
        type: Array
    },
    mascotas: {
        type: Array
    }
});
/**
 * funciona para quitar el password del usuarios
 * cuando se quiera devolver los normal_user de la
 * aplicación
 */
usuarioSchema.methods.toJSON = function() {
    let user = this; // aqui hago que la variable consiga la info del usuario
    let userObject = user.toObject();
    delete userObject.password; // aqui borro el campo password de la salida
    return userObject;
}

usuarioSchema.plugin(unique_validator, {
    message: '{PATH} ya existe'
        /**
           con este {PATH} le indico a mongoose que busque los campos unique
           y restrinja los registros que tengan el mismo valor en los
           campos
        */
});
module.exports = mongoose.model('usuario', usuarioSchema); // usuario se puede cambiar aqui se le da un nombre cualquiera
