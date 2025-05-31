import { DataTypes } from 'sequelize';

export async function up(queryInterface) {
  await queryInterface.createTable('Comments', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    taskId: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: 'Tasks',
        key: 'id'
      }
    },
    userEmail: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false }
  });

  // Add indexes for better query performance
  await queryInterface.addIndex('Comments', ['taskId']);
  await queryInterface.addIndex('Comments', ['userEmail']);
}

export async function down(queryInterface) {
  await queryInterface.dropTable('Comments');
} 