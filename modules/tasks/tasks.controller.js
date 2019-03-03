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
    return TaskModel.findByIdAndUpdate(ctx.params.id, {
      title: ctx.request.body.title
    }).lean().exec().then(ctx.ok, ctx.badRequest);
  }

  static updateCompleted(ctx) {
    return TaskModel.findByIdAndUpdate(ctx.params.id, {
      completed: ctx.request.body.completed
    }).lean().exec().then(ctx.ok, ctx.badRequest);
  }

  static updateImages(ctx) {
    // return Cloudy.uploadImages(ctx.request.files).then(images => {
    //   return TaskModel.findById(ctx.params.id).select('images').lean().exec().then(doc => {
    //     return TaskModel.findByIdAndUpdate(ctx.params.id, {
    //       images: _.concat(doc.images || [], _.map(images, img => img.url))
    //     }).lean().exec().then(ctx.ok, ctx.badRequest);
    //   }, ctx.badRequest);
    // }, ctx.badRequest);
    // return new Promise((resolve, reject) => {
    let taskDoc = null;
    let uploadedImages = [];
    return async.parallel([pCb => {
      Cloudy.uploadImages(ctx.request.files).then(images => {
        uploadedImages = images;
        pCb(null);
      }, pCb);
    }, pCb => {
      TaskModel.findById(ctx.params.id).select('images').lean().exec((err, doc) => {
        taskDoc = doc;
        pCb(err);
      });
    }], err => {
      return TaskModel.findByIdAndUpdate(ctx.params.id, {
        images: _.concat(taskDoc.images || [], _.map(uploadedImages, img => img.url))
      }).lean().exec().then(ctx.ok, ctx.badRequest);;
    });
    // });
    // let taskDoc = null;
    // let uploadedImages = [];
    // return async.parallel([pCb => {
    //   Cloudy.uploadImages(ctx.request.files).then(images => {
    //     uploadedImages = images;
    //     pCb(null);
    //   }, pCb);
    // }, pCb => {
    //   TaskModel.findById(ctx.params.id).select('images').lean().exec((err, doc) => {
    //     taskDoc = doc;
    //     pCb(err);
    //   });
    // }], err => {
    //   return TaskModel.findByIdAndUpdate(ctx.params.id, {
    //     images: _.concat(taskDoc.images || [], _.map(uploadedImages, img => img.url))
    //   }).lean().exec().then(ctx.ok, ctx.badRequest);
    // });
  }

  static delete(ctx) {
    // return TaskModel.findByIdAndRemove(ctx.params.id).lean().exec().then(ctx.ok, ctx.badRequest);
    return TaskModel.findByIdAndUpdate(ctx.params.id, {
      enable: false
    }).lean().exec().then(ctx.ok, ctx.badRequest);
  }
};