import { Router } from 'express';
import { CvDocument } from '../models/CvDocument.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function toClient(doc) {
  const data = { ...(doc.data || {}) };
  data.id = doc._id.toString();
  data.name = doc.name || data.name || 'Mi CV';
  data.updatedAt = (doc.updatedAt || new Date()).toISOString();
  data.userId = doc.userId.toString();
  return data;
}

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const docs = await CvDocument.find({ userId: req.userId }).sort({ updatedAt: -1 });
    return res.json({
      documents: docs.map(toClient),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to list CVs' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doc = await CvDocument.findOne({ _id: req.params.id, userId: req.userId });
    if (!doc) return res.status(404).json({ message: 'CV not found' });
    return res.json({ document: toClient(doc) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to get CV' });
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = req.body?.data || req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ message: 'CV data is required' });
    }

    const { id: _ignore, userId: _u, ...data } = payload;
    const name = String(data.name || 'Mi CV').trim() || 'Mi CV';

    const doc = await CvDocument.create({
      userId: req.userId,
      name,
      data: { ...data, name },
    });

    return res.status(201).json({ document: toClient(doc) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to create CV' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const payload = req.body?.data || req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ message: 'CV data is required' });
    }

    const { id: _ignore, userId: _u, ...data } = payload;
    const name = String(data.name || 'Mi CV').trim() || 'Mi CV';

    const doc = await CvDocument.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: { name, data: { ...data, name } } },
      { new: true }
    );

    if (!doc) return res.status(404).json({ message: 'CV not found' });
    return res.json({ document: toClient(doc) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to update CV' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await CvDocument.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!deleted) return res.status(404).json({ message: 'CV not found' });
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to delete CV' });
  }
});

router.post('/:id/duplicate', async (req, res) => {
  try {
    const source = await CvDocument.findOne({ _id: req.params.id, userId: req.userId });
    if (!source) return res.status(404).json({ message: 'CV not found' });

    const requestedName = String(req.body?.name || '').trim();
    const name = requestedName || `${source.name} (copia)`;
    const data = { ...(source.data || {}), name };

    const doc = await CvDocument.create({
      userId: req.userId,
      name,
      data,
    });

    return res.status(201).json({ document: toClient(doc) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to duplicate CV' });
  }
});

export default router;
