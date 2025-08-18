import UserModel from '../models/user.model.js';
import bcrypt from 'bcrypt';

// Servicio para registrar Usuario
export const registerUser = async (body) => {

    const hashedPassword = bcrypt.hashSync(body.password, 10); //Obtiene el password y lo Encripta
    const newUser = new UserModel({ //Crea un modelo de usuario con los datos obtenidos
        username: body.username,
        email: body.email,
        password: hashedPassword,
    });

    await newUser.save(); //Guarda el usuario en la base de datos

    return newUser;
};

//Servicio para verificar las credenciales del usuario para el acceso a la app
export const loginUser = async (body) => {
    const user = await UserModel.findOne({email: body.email}); //busca en la base de datos el correo
    !user && res.status(404).json("User not found");
    const passwordCheck = await bcrypt.compare(body.password, user.password); //Compara el password con el registrado en la base de datos
    !passwordCheck && res.status(400).json("Wrong password");

    return user;
}