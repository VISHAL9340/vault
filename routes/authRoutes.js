import express from 'express';

const router = express.Router();

router.get('/login', (req, res) => {
  res.json({ message: "🔑 Login API Working!" });
});

export default router;
