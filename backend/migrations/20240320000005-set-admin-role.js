import { DataTypes } from 'sequelize';

export async function up(queryInterface) {
  await queryInterface.sequelize.query(
    `UPDATE "Users" SET role = 'admin' WHERE email = 'lawravasco@gmail.com'`
  );
}

export async function down(queryInterface) {
  await queryInterface.sequelize.query(
    `UPDATE "Users" SET role = 'user' WHERE email = 'lawravasco@gmail.com'`
  );
} 