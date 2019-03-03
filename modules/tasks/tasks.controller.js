const _ = require('lodash');
const async = require('koa-async');
const Cloudy = require('../../integrations/cloudinary');
const TaskModel = require('./tasks.model');

module.exports = class Tasks {
  static create(ctx) {
    return TaskModel.create(ctx.request.body).then(ctx.ok, ctx.badRequest);
  }

  static list(ctx) {
    let q = ctx.query;
    let findParams = { enable: true };
    let queryParams = {};

    if (q.sort) {
      queryParams.sort = q.sort;
    }
    if (q.filter) {
      findParams[_.replace(q.filter, '-', '')] = _.indexOf(q.filter, '-') > -1 ? false : true;
    }

    return TaskModel.find(findParams, null, queryParams).lean().exec().then(ctx.ok, ctx.badRequest);
  }

  static read(ctx) {
    return TaskModel.findById(ctx.params.id).lean().exec().then(ctx.ok, ctx.badRequest);
  }

  static update(ctx) {
    return TaskModel.findByIdAndUpdate(ctx.params.id, ctx.request.body).lean().exec().then(ctx.ok, ctx.badRequest);
  }

  static updateTitle(ctx) {
    // return TaskModel.findByIdAndUpdate(ctx.params.id, {
    //   title: ctx.request.body.title
    // }).lean().exec().then(ctx.ok, ctx.badRequest);

    let taskDoc = null;
    async.parallel([pCb => {
      TaskModel.findById(ctx.params.id).exec((err, doc) => {
        taskDoc = doc;
        pCb(err);
      });
    }], err => {
      taskDoc.title = ctx.request.body.title;
      taskDoc.save().then(ctx.ok, ctx.badRequest);
    });
  }

  static updateCompleted(ctx) {
    return TaskModel.findByIdAndUpdate(ctx.params.id, {
      completed: ctx.request.body.completed
    }).lean().exec().then(ctx.ok, ctx.badRequest);
  }

  static async updateImages(ctx) {
    function uploadImages(files) {
      return new Promise((resolve, reject) => {
        return Cloudy.uploadImages(files).then(resolve, reject);
      });
    }

    function getTaskImages(taskId) {
      return new Promise((resolve, reject) => {
        return TaskModel.findById(taskId).select('images').lean().exec().then(resolve, reject);
      });
    }

    function updateImages(taskId, docImages, images) {
      return new Promise((resolve, reject) => {
        return TaskModel.findByIdAndUpdate(taskId, {
          images: _.concat(docImages || [], _.map(images, img => img.url))
        }).lean().exec().then(resolve, reject);
      });
    }

    return await Promise.all([getTaskImages(ctx.params.id), uploadImages(ctx.request.files)]).then(values => {
      return updateImages(ctx.params.id, values[0].images, values[1]).then(ctx.ok, ctx.badRequest);
    }, ctx.badRequest);
  }

  static delete(ctx) {
    // return TaskModel.findByIdAndRemove(ctx.params.id).lean().exec().then(ctx.ok, ctx.badRequest);
    return TaskModel.findByIdAndUpdate(ctx.params.id, {
      enable: false
    }).lean().exec().then(ctx.ok, ctx.badRequest);
  }
};