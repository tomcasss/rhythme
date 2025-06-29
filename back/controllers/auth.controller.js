import { loginUser, registerUser } from "../services/auth.service.js";

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
    try {
        const loggedInUser = await loginUser(req.body);
        const {password, ...data} = loggedInUser._doc; // Exclude password from response

        res.status(200).json({
            message: 'User logged in successfully',
            data,
        });
    } catch (error) {
        res.status(500).json({
            error: error,
            message: 'An error occurred while login the user.'
        });
        console.log(error);
    }
};