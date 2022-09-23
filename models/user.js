import { DataTypes, Sequelize } from 'sequelize';

import sequelize from '../utils/database.js'

class User extends Sequelize.Model { };

User.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.TEXT,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
}, { sequelize, modelName: 'user' });

export default User;