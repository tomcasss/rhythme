import postModel from "../models/post.model.js";
import userModel from "../models/user.model.js";
import mongoose from "mongoose";

// Crear un nuevo post, asegurando que userId sea ObjectId
export const createPost = async (body) => {
    try {
        console.log('🏗️ Creating post in service with body:', body);
        
        // Convertir userId a ObjectId si es string
        if (body.userId && typeof body.userId === "string") {
            body.userId = new mongoose.Types.ObjectId(body.userId);
        }
        
        console.log('📋 Final post data before save:', body);
        const newPost = new postModel(body);
        await newPost.save();
        
        console.log('💾 Post saved to database:', newPost);
        return newPost;
    } catch (error) {
        console.error('❌ Error in createPost service:', error);
        throw error;
    }
};

// Editar un post propio
export const updatePost = async (params, body) => {
    try {
        const updatedPost = await postModel.findById(params.id);
        // Solo el autor puede editar
        if (updatedPost.userId.toString() === body.userId.toString()) {
            await postModel.updateOne(
                { _id: params.id },
                { $set: body }
            );
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
        if (deletedPost.userId.toString() === body.userId.toString()) {
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
            await post.updateOne({$push: {likes: body.userId}})
        } else {
            await post.updateOne({$pull: {likes: body.userId}})
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
        const userPosts = await postModel.find({ userId: currentUser._id }).populate('userId', 'username email');
        let timeLinePosts = [];
        if (Array.isArray(currentUser.following) && currentUser.following.length > 0) {
            const friendsPosts = await Promise.all(
                currentUser.following.map((friendId) => postModel.find({ userId: friendId }).populate('userId', 'username email'))
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
        const userIdObjectId = typeof body.userId === "string" 
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
        const populatedPost = await postModel.findById(params.id)
            .populate('userId', 'username email profilePicture')
            .populate('comments.userId', 'username email profilePicture');

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
        const post = await postModel.findById(params.id)
            .populate('comments.userId', 'username email profilePicture')
            .select('comments');

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
        const posts = await postModel.find({ userId: params.userId })
            .populate('userId', 'username email profilePicture')
            .sort({ createdAt: -1 }); // Ordenar por más recientes primero

        return posts;
    } catch (error) {
        throw error;
    }
};
