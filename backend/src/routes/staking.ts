import express from 'express';

const router = express.Router();

router.post('/stake', async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Staking functionality coming soon'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/unstake', async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Unstaking functionality coming soon'
    });
  } catch (error) {
    next(error);
  }
});

router.get('/rewards/:address', async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        pending: 0,
        claimed: 0
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
