//Kết nối database
const sequelize = require('sequelize');
const config = new sequelize ({
  host: "ec2-54-204-23-228.compute-1.amazonaws.com",
  username: "qsazzvvbopiolj",
  password: "23d411af50c296de532da9df874d68d657d9af9108a9607baa3e0d1cde1931ef",
  database: "dauaa88394fkno",
  port:"5432",
  dialect: "postgres",
  operatorsAliases: false,
  dialectOptions: { ssl: true},
  define: {freezeTableName: true}
});

module.exports = config;
