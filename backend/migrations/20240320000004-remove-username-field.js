import { DataTypes } from 'sequelize';

export async function up(queryInterface) {
  await queryInterface.removeColumn('Users', 'username');
}

export async function down(queryInterface) {
  await queryInterface.addColumn('Users', 'username', {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  });
} 