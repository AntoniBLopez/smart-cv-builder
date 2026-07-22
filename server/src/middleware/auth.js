import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { envStr } from '../services/env.js';

export function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email },
    envStr('JWT_SECRET'),
    { expiresIn: envStr('JWT_EXPIRES_IN', '7d') }
  );
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const payload = jwt.verify(token, envStr('JWT_SECRET'));
    const user = await User.findById(payload.sub).select('_id email name');
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
