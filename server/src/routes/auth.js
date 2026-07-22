import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { envStr } from '../services/env.js';

const router = Router();

function getGoogleClient() {
  const clientId = envStr('GOOGLE_CLIENT_ID');
  if (!clientId) return null;
  return new OAuth2Client(clientId);
}

function publicUser(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name || '',
  };
}

router.get('/config', (_req, res) => {
  return res.json({
    googleClientId: envStr('GOOGLE_CLIENT_ID'),
  });
});

router.post('/register', async (req, res) => {
  try {
    const email = String(req.body.email || '')
      .trim()
      .toLowerCase();
    const password = String(req.body.password || '');
    const name = String(req.body.name || '').trim();

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ email, passwordHash, name });
    const token = signToken(user);

    return res.status(201).json({
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '')
      .trim()
      .toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (!user.passwordHash) {
      return res.status(401).json({
        message: 'This account uses Google Sign-In. Use Continuar con Google.',
      });
    }
    if (!(await user.verifyPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user);
    return res.json({
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Login failed' });
  }
});

router.post('/google', async (req, res) => {
  try {
    const client = getGoogleClient();
    if (!client) {
      return res.status(503).json({ message: 'Google Sign-In is not configured' });
    }

    const credential = String(req.body.credential || '');
    if (!credential) {
      return res.status(400).json({ message: 'Missing Google credential' });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: envStr('GOOGLE_CLIENT_ID'),
    });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload.sub) {
      return res.status(401).json({ message: 'Invalid Google token' });
    }
    if (payload.email_verified === false) {
      return res.status(401).json({ message: 'Google email is not verified' });
    }

    const email = payload.email.trim().toLowerCase();
    const googleId = payload.sub;
    const name = String(payload.name || '').trim();

    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (!user) {
      user = await User.create({
        email,
        googleId,
        name,
        passwordHash: null,
      });
    } else {
      if (!user.googleId) user.googleId = googleId;
      if (!user.name && name) user.name = name;
      await user.save();
    }

    const token = signToken(user);
    return res.json({
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Google Sign-In failed' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  return res.json({
    user: publicUser(req.user),
  });
});

export default router;
