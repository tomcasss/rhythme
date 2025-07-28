import mongoose from "mongoose";
import { Schema } from "mongoose";

// Esquema para comentarios
const commentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: {
        type: String,
        required: true,
        maxlength: 500,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

// Esquema para contenido de Spotify
const spotifyContentSchema = new Schema({
    type: {
        type: String,
        enum: ['track', 'playlist', 'artist', 'album'],
        required: true,
    },
    spotifyId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    artist: {
        type: String, // Para tracks y albums
    },
    image: {
        type: String, // URL de la imagen
    },
    externalUrl: {
        type: String, // URL para abrir en Spotify
        required: true,
    },
    previewUrl: {
        type: String, // URL de preview de 30 segundos (solo para tracks)
    },
    duration: {
        type: Number, // Duración en milisegundos (para tracks)
    }
});

const postSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    desc: {
        type: String,
        max: 500,
    },
    img: {
        type: String,
        default: "",
    },
    spotifyContent: spotifyContentSchema, // Contenido de Spotify opcional
    likes: {
        type: [Schema.Types.ObjectId],
        ref: "User",
        default: [],
    },
    comments: [commentSchema]
}, { timestamps: true });

export default mongoose.model("Post", postSchema);