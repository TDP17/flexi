import { DataTypes, Sequelize } from 'sequelize';

import sequelize from '../utils/database.js'

class Company extends Sequelize.Model {};

Company.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.TEXT,
        unique: true,
        allowNull: false
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
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    logo: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    banner: {
        type: DataTypes.TEXT,
        allowNull: false
    }

}, { sequelize, modelName: 'company' });

export default Company;