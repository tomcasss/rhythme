import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema = new Schema({
  username: {
    type: String,
    required: false,
    unique: false,
    min: 4,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function () {
      return this.authProvider === 'local';
    },
  },
  profilePicture: {
    type: String,
    default: "",
  },
  coverPicture: {
    type: String,
    default: "",
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  followers: {
    type: [String],
    default: [],
  },
  following: {
    type: [String],
    default: [],
  },
  desc: {
    type: String,
    max: 250,
  },
  from: {
    type: String,
    default: "",
  },
  relationship: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
    default: 1,
  },

  // Preferencias musicales del usuario (géneros)
  musicPreferences: {
    type: [String],
    default: [],
  },

  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },

  // Integración con Spotify
  spotifyAccount: {
    isConnected: {
      type: Boolean,
      default: false,
    },
    spotifyId: {
      type: String,
      default: "",
    },
    displayName: {
      type: String,
      default: "",
    },
    accessToken: {
      type: String,
      default: "",
    },
    refreshToken: {
      type: String,
      default: "",
    },
    tokenExpiry: {
      type: Date,
      default: null,
    },
    lastConnected: {
      type: Date,
      default: null,
    }
  },

  // Privacidad granular
  privacy: {
    profile: { type: String, enum: ['public', 'followers', 'private'], default: 'public' },
    posts: { type: String, enum: ['public', 'followers', 'private'], default: 'public' },
    friends: { type: String, enum: ['public', 'followers', 'private'], default: 'public' },
  },

  // Usuarios bloqueados por este usuario
  blockedUsers: [
    { type: Schema.Types.ObjectId, ref: 'User', default: [] }
  ],

  // Estado de cuenta: activo, desactivado, pendiente de eliminación (soft delete)
  accountStatus: {
    type: String,
    enum: ['active', 'desactivado', 'deletedPending'],
    default: 'active'
  },
  deletedAt: { type: Date, default: null },
  passwordUpdatedAt: { type: Date, default: null },
});

export default mongoose.model("User", userSchema);
