const mongoose = require('mongoose');

const UserConfigSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    // Mirror of local text expansion snippets: { "?@": "yash.sushil16@gmail.com", ... }
    commands: {
      type: Map,
      of: String,
      default: {},
    },
    // Mirror of custom AI prompt templates: { "!casual": "Rewrite...", ... }
    ai_commands: {
      type: Map,
      of: String,
      default: {},
    },
    // Non-sensitive model preferences (API keys excluded for client-side zero-trust security)
    preferences: {
      primary_provider: {
        type: String,
        enum: ['groq', 'gemini'],
        default: 'groq',
      },
      groq_model: {
        type: String,
        default: 'llama-3.3-70b-versatile',
      },
      gemini_model: {
        type: String,
        default: 'gemini-2.0-flash',
      },
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('UserConfig', UserConfigSchema);
