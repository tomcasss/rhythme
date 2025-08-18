import UserModel from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendMail } from '../utils/mailer.js';

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
    const user = await UserModel.findOne({ email: body.email }); // busca en la base de datos el correo
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    const passwordCheck = await bcrypt.compare(body.password, user.password); // Compara el password
    if (!passwordCheck) {
      const err = new Error('Wrong password');
      err.status = 400;
      throw err;
    }
    return user;
}

//Servicio para reset de contraseña

const clave = process.env.JWT_RESET_SECRET;


export const contrasena_olvidada = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    // No revelar si existe o no
    if (!user) {
      return res.json({ msg: 'Si el correo existe, te enviaremos instrucciones.' });
    }

    const token = jwt.sign({ id: String(user._id) }, clave, { expiresIn: '15m' });

    const FRONT = process.env.FRONT_BASE_URL || 'http://localhost:5173';
    const link = `${FRONT}/password-reset?uid=${user._id}&token=${encodeURIComponent(token)}`;

    await sendMail({
      to: email,
      subject: 'Recuperación de contraseña',
      html: `
        <div style="font-family:sans-serif">
          <h2>Restablecer contraseña</h2>
          <p>Si no solicitaste este correo, ignóralo.</p>
          <p><a href="${link}" style="background:#4f46e5;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none">Restablecer contraseña</a></p>
          <p>También puedes copiar este enlace en tu navegador:</p>
          <p>${link}</p>
        </div>
      `,
      text: `Abre este enlace para restablecer tu contraseña: ${link}`,
    });

    res.json({ msg: 'Si el correo existe, te enviaremos instrucciones.' });
  } catch (error) {
    res.status(500).json({ msg: 'Error', error: error?.message || error });
  }
};


export const reestablecer_contrasena = async (req, res) => {
  try {
    const { token, newPassword, uid } = req.body;
  const decoded = jwt.verify(token, clave);
    const userId = uid || decoded?.id;
    if (!userId) return res.status(400).json({ msg: 'Token inválido' });

    const usuario = await UserModel.findById(userId);
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });

    const hashed = await bcrypt.hash(newPassword, 10);
    usuario.password = hashed;
    await usuario.save();

    res.json({ msg: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(400).json({ msg: 'El token expiró o es inválido', error: error?.message || error });
  }
};