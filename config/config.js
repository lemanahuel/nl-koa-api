module.exports = {
  PORT: process.env.PORT || 5001,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/todo-list',
  CLOUDINARY_URL: process.env.CLOUDINARY_URL,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  WHITE_LIST_DOMAINS: ['http://localhost:5000', 'http://localhost:5001',
    'https://nl-static-www.herokuapp.com',
    'https://nl-koa-www.herokuapp.com', 'https://nl-koa-api.herokuapp.com',
    'https://nl-koa-www-prod.herokuapp.com', 'https://nl-koa-api-prod.herokuapp.com']
};