import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import jwt_decode from 'jwt-decode';
import UserModel from '../models/user.js';

const secret = 'test';

export const signup = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  try {
    const oldUser = await UserModel.findOne({ email });
    if (oldUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcryptjs.hash(password, 12);

    const result = await UserModel.create({
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
    });

    const token = jwt.sign({ email: result.email, id: result._id }, secret, {
      expiresIn: '1h',
    });

    return res.status(201).json({ result, token });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Server internal error, Something went wrong ' });
    console.error(error);
  }
};

export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User doesn't exist" });
    }

    const isCorrectPassword = await bcryptjs.compare(password, user.password);
    if (!isCorrectPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ email: user.email, id: user._id }, secret, {
      expiresIn: '7d',
    });

    return res.status(200).json({ result: user, token });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Server internal error, Something went wrong' });
    console.error(error);
  }
};

export const googleSignIn = async (req, res) => {
  const { email, name, googleId, token } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (user) {
      return res.status(200).json({ result: user, token });
    }

    const result = await UserModel.create({
      email,
      name,
      googleId,
    });

    return res.status(200).json({ result, token });
  } catch (error) {
    res.status(500).json({ message: 'Server internal error' });
    console.error(error);
  }
};
