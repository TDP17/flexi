import { DataTypes, Sequelize } from 'sequelize';

import sequelize from '../utils/database.js'

class Company extends Sequelize.Model { };

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
    bannerURL: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    logoURL: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    bannerID: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    logoID: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    approved: {
        type: Sequelize.ENUM("pending", "accepted", "rejected"),
        allowNull: false
    }
}, { sequelize, paranoid: true, modelName: 'company' });

export default Company;