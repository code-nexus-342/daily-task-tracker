import Comment from '../models/comment.model.js';
import Task from '../models/task.model.js';

export const addComment = async (request, reply) => {
  try {
    const { taskId } = request.params;
    const { content } = request.body;
    const userEmail = request.user.email;

    // Check if task exists
    const task = await Task.findByPk(taskId);
    if (!task) {
      return reply.code(404).send({ message: 'Task not found' });
    }

    const comment = await Comment.create({
      taskId,
      userEmail,
      content
    });

    return reply.code(201).send({ comment });
  } catch (error) {
    console.error('Error adding comment:', error);
    return reply.code(500).send({ message: 'Failed to add comment' });
  }
};

export const getTaskComments = async (request, reply) => {
  try {
    const { taskId } = request.params;

    const comments = await Comment.findAll({
      where: { taskId },
      order: [['createdAt', 'DESC']]
    });

    return reply.send({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return reply.code(500).send({ message: 'Failed to fetch comments' });
  }
};

export const updateComment = async (request, reply) => {
  try {
    const { commentId } = request.params;
    const { content } = request.body;
    const userEmail = request.user.email;

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return reply.code(404).send({ message: 'Comment not found' });
    }

    // Check if user is the comment author
    if (comment.userEmail !== userEmail) {
      return reply.code(403).send({ message: 'Not authorized to update this comment' });
    }

    await comment.update({ content });
    return reply.send({ comment });
  } catch (error) {
    console.error('Error updating comment:', error);
    return reply.code(500).send({ message: 'Failed to update comment' });
  }
};

export const deleteComment = async (request, reply) => {
  try {
    const { commentId } = request.params;
    const userEmail = request.user.email;

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return reply.code(404).send({ message: 'Comment not found' });
    }

    // Check if user is the comment author
    if (comment.userEmail !== userEmail) {
      return reply.code(403).send({ message: 'Not authorized to delete this comment' });
    }

    await comment.destroy();
    return reply.send({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return reply.code(500).send({ message: 'Failed to delete comment' });
  }
}; 