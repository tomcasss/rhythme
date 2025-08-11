import { loginUser, registerUser } from "../services/auth.service.js";
import { OAuth2Client } from 'google-auth-library';
import User from '../models/user.model.js';

// Register user
export const register = async (req, res) => {
    try {
        const newUser = await registerUser(req.body);
        const {password, ...data} = newUser._doc; // Exclude password from response
        res.status(201).json({
            data,
            message: 'User registered successfully',
        });
    } catch (error) {
        res.status(500).json({
            error: error,
            message: 'An error occurred while registering the user.'
        });
        console.log(error);
    }
};

export const login = async (req, res)=> {
  const { email, password } = req.body;

    // Soporte legacy: si se pasa 'admin' como email, intentar encontrar usuario real admin por username/email
    if (email === 'admin') {
      const existingAdmin = await User.findOne({ $or: [{ email: 'admin' }, { username: 'admin' }], isAdmin: true }).select('-password');
      if (existingAdmin && password === 'admin123') {
        return res.status(200).json({ message: 'Admin logged in successfully', data: { ...existingAdmin._doc, isAdmin: true } });
      }
      // Si no hay usuario admin real, devolver dummy (solo para entorno de desarrollo)
      if (password === 'admin123') {
        return res.status(200).json({
          message: 'Admin (dummy) logged in successfully',
          data: { username: 'admin', email: 'admin', isAdmin: true, dummy: true }
        });
      }
    }
    try {
        const loggedInUser = await loginUser(req.body);
        const {password, ...data} = loggedInUser._doc; // Exclude password from response

    res.status(200).json({
      message: 'User logged in successfully',
      data: { ...data, isAdmin: !!data.isAdmin },
    });
    } catch (error) {
      console.log("❌ Error en login:", error);
        res.status(500).json({
            error: error,
            message: 'An error occurred while login the user.'
        });
        console.log(error);
    }
};

const client = new OAuth2Client();

export const loginWithGoogle = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: '33897519693-nsv0vuemj6lhqcolqicnfek241gffvdp.apps.googleusercontent.com',
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        name,
        profilePicture: picture,
        authProvider: 'google'
      });

      await user.save();
    }

    res.status(200).json({ user });

  } catch (error) {
    console.error('Error en loginWithGoogle:', error);
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};