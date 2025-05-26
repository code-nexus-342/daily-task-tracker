export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'firebaseUid', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      after: 'id'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'firebaseUid');
  }
}; 