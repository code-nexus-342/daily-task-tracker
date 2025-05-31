import { DataTypes } from 'sequelize';

export async function up(queryInterface) {
  await queryInterface.removeColumn('Users', 'name');
  await queryInterface.removeColumn('Users', 'profileComplete');
}

export async function down(queryInterface) {
  await queryInterface.addColumn('Users', 'name', {
    type: DataTypes.STRING,
    allowNull: true
  });
  await queryInterface.addColumn('Users', 'profileComplete', {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  });
} 