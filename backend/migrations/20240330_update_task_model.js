import { DataTypes } from 'sequelize';

export async function up(queryInterface) {
  // First, drop the foreign key constraint
  await queryInterface.removeConstraint('Comments', 'Comments_taskId_fkey');

  // Then drop the existing table
  await queryInterface.dropTable('Tasks');

  // Create the new table with the updated schema
  await queryInterface.createTable('Tasks', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userEmail: { type: DataTypes.STRING, allowNull: false },
    research: { type: DataTypes.TEXT, allowNull: false },
    challenges: { type: DataTypes.TEXT, allowNull: true },
    files: { type: DataTypes.JSONB },
    status: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      defaultValue: 'pending'
    },
    submittedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false }
  });

  // Re-add the foreign key constraint
  await queryInterface.addConstraint('Comments', {
    fields: ['taskId'],
    type: 'foreign key',
    name: 'Comments_taskId_fkey',
    references: {
      table: 'Tasks',
      field: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
}

export async function down(queryInterface) {
  // Remove the foreign key constraint
  await queryInterface.removeConstraint('Comments', 'Comments_taskId_fkey');
  
  // Drop the Tasks table
  await queryInterface.dropTable('Tasks');
} 