import postModel from "../models/post.model.js";
import userModel from "../models/user.model.js";
import mongoose from "mongoose";
import {
  getArtistDetails,
  getTrackDetails,
  getAlbumDetails,
} from "./spotify.service.js";

// Crear un nuevo post, asegurando que userId sea ObjectId
export const createPost = async (body) => {
  try {
    console.log("🏗️ Creating post in service with body:", body);

    // Convertir userId a ObjectId si es string
    if (body.userId && typeof body.userId === "string") {
      body.userId = new mongoose.Types.ObjectId(body.userId);
    }

    // Normalizar géneros si hay contenido de Spotify
    if (
      body.spotifyContent &&
      body.spotifyContent.spotifyId &&
      !Array.isArray(body.spotifyContent.genres)
    ) {
      try {
        const sc = body.spotifyContent;
        let genres = [];
        if (sc.type === "track") {
          const track = await getTrackDetails(sc.spotifyId);
          // tomar géneros del primer artista del track
          const firstArtistId = track?.artists?.[0]?.id;
          if (firstArtistId) {
            const artist = await getArtistDetails(firstArtistId);
            genres = (artist?.genres || []).map((g) => String(g).toLowerCase());
          }
        } else if (sc.type === "artist") {
          const artist = await getArtistDetails(sc.spotifyId);
          genres = (artist?.genres || []).map((g) => String(g).toLowerCase());
        } else if (sc.type === "album") {
          const album = await getAlbumDetails(sc.spotifyId);
          // no hay géneros en álbum directo, tomar del primer artista
          const firstArtistId = album?.artists?.[0]?.id;
          if (firstArtistId) {
            const artist = await getArtistDetails(firstArtistId);
            genres = (artist?.genres || []).map((g) => String(g).toLowerCase());
          }
        }
        body.spotifyContent.genres = Array.from(new Set(genres)).slice(0, 20);
      } catch (e) {
        console.warn(
          "No se pudieron obtener géneros para el contenido de Spotify:",
          e?.message || e
        );
        body.spotifyContent.genres = [];
      }
    }

    console.log("📋 Final post data before save:", body);
    const newPost = new postModel(body);
    await newPost.save();

    console.log("💾 Post saved to database:", newPost);
    return newPost;
  } catch (error) {
    console.error("❌ Error in createPost service:", error);
    throw error;
  }
};

// Editar un post propio
export const updatePost = async (params, body) => {
  try {
    const updatedPost = await postModel.findById(params.id);
    // Solo el autor puede editar
    if (updatedPost.userId.toString() === body.userId.toString()) {
      await postModel.updateOne({ _id: params.id }, { $set: body });
      return updatedPost;
    } else {
      throw new Error("You can only update your own posts!");
    }
  } catch (error) {
    throw error;
  }
};

// Eliminar un post propio
export const deletePost = async (params, body) => {
  try {
    const deletedPost = await postModel.findById(params.id);
    // Solo el autor puede eliminar
    if (!deletedPost) {
      throw new Error("Post not found");
    } else if (deletedPost.userId.toString() === body.userId.toString()) {
      await postModel.deleteOne({ _id: params.id });
      return deletedPost;
    } else {
      throw new Error("You can only delete your own posts!");
    }
  } catch (error) {
    throw error;
  }
};

// Like/unlike a un post (un usuario solo puede dar/retirar like una vez)
export const likeAndUnlikePost = async (params, body) => {
  try {
    const post = await postModel.findById(params.id);
    if (!post.likes.includes(body.userId)) {
      await post.updateOne({ $push: { likes: body.userId } });
    } else {
      await post.updateOne({ $pull: { likes: body.userId } });
    }
    return post;
  } catch (error) {
    throw error;
  }
};

// Obtener un post por id
export const getPost = async (params) => {
  try {
    const post = await postModel.findById(params.id);
    return post;
  } catch (error) {
    throw error;
  }
};

// Obtener timeline de posts (propios y de seguidos), usando populate para devolver username/email del autor
export const getTimelinePosts = async (body) => {
  try {
    const currentUser = await userModel.findById(body.userId);
    if (!currentUser) return [];
    // Populate para incluir username/email del autor
    const userPosts = await postModel
      .find({ userId: currentUser._id })
      .populate("userId", "username email");
    let timeLinePosts = [];
    if (
      Array.isArray(currentUser.following) &&
      currentUser.following.length > 0
    ) {
      const friendsPosts = await Promise.all(
        currentUser.following.map((friendId) =>
          postModel
            .find({ userId: friendId })
            .populate("userId", "username email")
        )
      );
      timeLinePosts = friendsPosts.flat();
    }
    return [...userPosts, ...timeLinePosts];
  } catch (error) {
    throw error;
  }
};

// Comentar un post
export const commentPost = async (params, body) => {
  try {
    // Validar que el ID del post sea válido
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      throw new Error("Invalid post ID");
    }

    // Validar que el userId sea válido
    if (!body.userId || !mongoose.Types.ObjectId.isValid(body.userId)) {
      throw new Error("Invalid user ID");
    }

    // Validar que el texto del comentario existe
    if (!body.text || body.text.trim() === "") {
      throw new Error("Comment text is required");
    }

    // Buscar el post
    const post = await postModel.findById(params.id);
    if (!post) {
      throw new Error("Post not found");
    }

    // Verificar que el usuario existe
    const user = await userModel.findById(body.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Convertir userId a ObjectId si es string
    const userIdObjectId =
      typeof body.userId === "string"
        ? new mongoose.Types.ObjectId(body.userId)
        : body.userId;

    // Agregar comentario usando el esquema definido
    const newComment = {
      userId: userIdObjectId,
      text: body.text.trim(),
    };

    post.comments.push(newComment);
    await post.save();

    // Retornar el post actualizado con populate
    const populatedPost = await postModel
      .findById(params.id)
      .populate("userId", "username email profilePicture")
      .populate("comments.userId", "username email profilePicture");

    return populatedPost;
  } catch (error) {
    throw error;
  }
};

// Obtener comentarios de un post
export const getPostComments = async (params) => {
  try {
    // Validar que el ID del post sea válido
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      throw new Error("Invalid post ID");
    }

    // Buscar el post y sus comentarios
    const post = await postModel
      .findById(params.id)
      .populate("comments.userId", "username email profilePicture")
      .select("comments");

    if (!post) {
      throw new Error("Post not found");
    }

    return post.comments;
  } catch (error) {
    throw error;
  }
};

// Obtener posts de un usuario específico
export const getUserPosts = async (params) => {
  try {
    // Validar que el ID del usuario sea válido
    if (!mongoose.Types.ObjectId.isValid(params.userId)) {
      throw new Error("Invalid user ID");
    }

    // Obtener todos los posts del usuario
    const posts = await postModel
      .find({ userId: params.userId })
      .populate("userId", "username email profilePicture")
      .sort({ createdAt: -1 }); // Ordenar por más recientes primero

    return posts;
  } catch (error) {
    throw error;
  }
};

// Recomendación de contenido: mezcla de posts de amigos de amigos, posts populares recientes y afinidad por Spotify
export const getRecommendedPosts = async (userId, { limit = 5 } = {}) => {
  try {
    const me = await userModel.findById(userId).lean();
    if (!me) return [];

    // base: no mostrar mis posts
    const excludeAuthor = userId;
    const excludeAuthorId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    // 1) posts de amigos y amigos de amigos
    const following = new Set((me.following || []).map(String));
    const friends = Array.from(following);
    const friendsObjectIds = friends
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));
    const friendsFollowingDocs = await userModel
      .find({ _id: { $in: friends } })
      .select("following")
      .lean();
    const followersOfFriends = new Set();
    for (const friendFollowing of friendsFollowingDocs) {
      for (const followerId of friendFollowing.following || []) {
        const followerIdString = String(followerId);
        if (followerIdString !== String(userId)) followersOfFriends.add(followerIdString);
      }
    }

    // 2) Afinidad por Spotify: si el usuario tiene posts con spotifyContent, priorizar similares
    const mySpotify = await postModel
      .find({ userId, spotifyContent: { $exists: true, $ne: null } })
      .select(
        "spotifyContent.type spotifyContent.artist spotifyContent.spotifyId"
      )
      .lean();
    const preferredArtists = new Set(
      mySpotify
        .map((p) => (p.spotifyContent && p.spotifyContent.artist) || "")
        .filter(Boolean)
    );
    const preferredIds = new Set(
      mySpotify
        .map((p) => (p.spotifyContent && p.spotifyContent.spotifyId) || "")
        .filter(Boolean)
    );

    // 3) Query base: últimos 30 días y excluir mis posts
    const since = new Date();
    since.setDate(since.getDate() - 30);

    // Filtrado por géneros preferidos: inferidos de posts del usuario y sus follows
    const myGenrePosts = await postModel
      .find({ userId: excludeAuthorId })
      .select("spotifyContent.genres")
      .lean();
    const myGenres = new Set(
      myGenrePosts
        .flatMap((p) => p.spotifyContent?.genres || [])
        .map((g) => String(g).toLowerCase())
    );
    // Si no hay géneros propios, derivar de follows (opcional)
    if (myGenres.size === 0 && friends.length) {
      const followGenrePosts = await postModel
        .find({ userId: { $in: friends } })
        .select("spotifyContent.genres")
        .lean();
      for (const p of followGenrePosts) {
        for (const g of p.spotifyContent?.genres || [])
          myGenres.add(String(g).toLowerCase());
      }
    }

    const candidates = await postModel
      .find({
        // excluir mis posts y los de usuarios que ya sigo
        userId: {
          $ne: excludeAuthorId,
          ...(friendsObjectIds.length ? { $nin: friendsObjectIds } : {}),
        },
        createdAt: { $gte: since },
        // Si hay géneros preferidos, exigir intersección
        ...(myGenres.size > 0
          ? {
              "spotifyContent.genres": {
                $elemMatch: { $in: Array.from(myGenres) },
              },
            }
          : {}),
      })
      .populate("userId", "username email profilePicture")
      .sort({ createdAt: -1 })
      .limit(limit * 5) // traer más para poder reordenar por score
      .lean();

    const scored = candidates.map((p) => {
      let score = 0;
      const authorId = String(p.userId?._id || p.userId);
      if (following.has(authorId)) score += 5; // sigo al autor
      if (followersOfFriends.has(authorId)) score += 3; // amigo de amigo
      const likeCount = (p.likes || []).length;
      score += Math.min(likeCount, 10) * 0.5; // popularidad acotada
      // Afinidad Spotify
      const sc = p.spotifyContent;
      if (sc) {
        if (preferredArtists.has(sc.artist || "")) score += 4;
        if (preferredIds.has(sc.spotifyId || "")) score += 6;
        if (sc.type === "track") score += 1; // pequeño boost a tracks
      }
      return { ...p, recommendationScore: score };
    });

    // Orden final por score desc y fecha reciente como desempate
    scored.sort(
      (a, b) =>
        b.recommendationScore - a.recommendationScore ||
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Si no hay candidatos por filtro estricto y no hay géneros, retorna top por score
    const result = scored.slice(0, limit);
    return result;
  } catch (error) {
    throw error;
  }
};
