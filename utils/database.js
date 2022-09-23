import { Sequelize } from 'sequelize';
import logger from './logger.js';

const sequelize = new Sequelize('postgres://postgres:postgres@172.17.0.2/flexi', {
    logging: msg => logger.debug(msg),
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
})

export default sequelize;