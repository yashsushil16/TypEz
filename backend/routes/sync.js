const express = require('express');
const UserConfig = require('../models/UserConfig');
const { authenticateToken } = require('./auth');

const router = express.Router();

// GET /api/sync/pull — Retrieve cloud-saved commands and preferences
router.get('/pull', authenticateToken, async (req, res) => {
  try {
    const user = await UserConfig.findById(req.user.id).select(
      'commands ai_commands preferences lastSyncedAt'
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'User configuration not found' });
    }

    res.json({
      success: true,
      data: {
        commands: user.commands || {},
        ai_commands: user.ai_commands || {},
        preferences: user.preferences || {},
        lastSyncedAt: user.lastSyncedAt,
      },
    });
  } catch (err) {
    console.error('[Sync Pull Error]:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve sync data' });
  }
});

// POST /api/sync/push — Merge and save local snippets & preferences to cloud
router.post('/push', authenticateToken, async (req, res) => {
  try {
    const { commands, ai_commands, preferences } = req.body;

    const user = await UserConfig.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Merge or overwrite commands
    if (commands && typeof commands === 'object') {
      user.commands = commands;
    }

    if (ai_commands && typeof ai_commands === 'object') {
      user.ai_commands = ai_commands;
    }

    if (preferences && typeof preferences === 'object') {
      user.preferences = {
        ...user.preferences,
        ...preferences,
      };
    }

    user.lastSyncedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Cloud synchronization complete',
      lastSyncedAt: user.lastSyncedAt,
      stats: {
        total_commands: user.commands ? Object.keys(user.commands).length : 0,
        total_ai_commands: user.ai_commands ? Object.keys(user.ai_commands).length : 0,
      },
    });
  } catch (err) {
    console.error('[Sync Push Error]:', err);
    res.status(500).json({ success: false, error: 'Failed to save sync data' });
  }
});

module.exports = router;
