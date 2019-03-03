const TasksController = require('./tasks.controller');
const middlewares = require('../../middlewares');

module.exports = router => {
  router
    .get('/tasks', TasksController.list)
    .post('/tasks', middlewares.isValidDomain, TasksController.create)
    .get('/tasks/:id', middlewares.isValidDomain, TasksController.read)
    .put('/tasks/:id', middlewares.isValidDomain, TasksController.update)
    .put('/tasks/:id/title', middlewares.isValidDomain, TasksController.updateTitle)
    .put('/tasks/:id/completed', middlewares.isValidDomain, TasksController.updateCompleted)
    .put('/tasks/:id/images', middlewares.isValidDomain, TasksController.updateImages)
    .del('/tasks/:id', middlewares.isValidDomain, TasksController.delete);
};