export default () => ({
  port: parseInt(process.env.PORT || '4000', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'diachinhso_user',
    password: process.env.DB_PASSWORD || 'diachinhso_password_2026',
    name: process.env.DB_NAME || 'diachinhso_db',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'diachinhso_jwt_development_secret_key_2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
});
