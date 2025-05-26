import { DataTypes } from 'sequelize';

export async function up(queryInterface) {
  await queryInterface.addColumn('Users', 'firebaseUid', {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    defaultValue: '' // Temporary default value
  });

  // Remove the default value after adding the column
  await queryInterface.changeColumn('Users', 'firebaseUid', {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn('Users', 'firebaseUid');
} 