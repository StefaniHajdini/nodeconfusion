const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Favorites = require('../models/favorite')
const authenticate = require('../authenticate');
const cors = require('./cors');
const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());
favoriteRouter.route('/')
	.options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => { res.sendStatus(200); })
	.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
		Favorites.findOne({ user: req.user })
			.populate('user')
			.populate('dishes')
			.then((favorites) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(favorites);
			}, (err) => next(err))
			.catch((err) => next(err));
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		Favorites.findOne({ user: req.user })
			.then((favorite) => {
				if (favorite != null) {
					for (dish of req.body) {
						console.log("dishID=" + dish._id);
						if (favorite.dishes.indexOf(dish._id) < 0) {
							favorite.dishes.push(dish._id);
						}
					}
					favorite.save()
						.then((favorite) => {
							res.statusCode = 200;
							res.setHeader('Content-Type', 'application/json');
							res.json(favorite);
						}, (err) => next(err))
						.catch((err) => next(err));
				} else {
					item = {}
					item.user = req.user._id;
					item.dishes = req.body;
					Favorites.create(item)
						.then((newFavorite) => {
							console.log('Favorite Created ', newFavorite);
							res.statusCode = 200;
							res.setHeader('Content-Type', 'application/json');
							res.json(newFavorite);
						}, (err) => next(err))
				}
			}, (err) => next(err))
			.catch((err) => next(err));
	})
	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		res.statusCode = 403;
		res.end('PUT operation not supported on /favorites/');
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		Favorites.findOneAndRemove({ user: req.user })
			.then((resp) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(resp);
			}, (err) => next(err))
			.catch((err) => next(err));
	});
favoriteRouter.route('/:dishId')
	.options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => { res.sendStatus(200); })
	.get(cors.cors, (req, res, next) => {
		res.statusCode = 403;
		res.end('GET operation not supported on /dishes/' + req.params.dishId);
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		Favorites.findOne({ user: req.user })
			.then((favorite) => {
				if (favorite == null) {
					Favorites.create({ user: req.user._id })
						.then((favorite) => {
							favorite.dishes.push(req.params.dishId);
							favorite.save()
								.then((favorite) => {
									res.statusCode = 200;
									res.setHeader('Content-Type', 'application/json');
									res.json(favorite);
								})
						}, (err) => next(err))
						.catch((err) => next(err));
				} else {
					if (favorite.dishes.indexOf(req.params.dishId) < 0) {
						favorite.dishes.push(req.params.dishId);
					}
					favorite.save()
						.then((favorite) => {
							res.statusCode = 200;
							res.setHeader('Content-Type', 'application/json');
							res.json(favorite);
						}, (err) => next(err))
						.catch((err) => next(err));
				}
			}, (err) => next(err))
			.catch((err) => next(err));
	})
	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		res.statusCode = 403;
		res.end('PUT operation not supported on /favorites/:dishId');
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		Favorites.findOne({ user: req.user })
			.then((favorite) => {
				if (favorite != null) {
					if (favorite.dishes.indexOf(req.params.dishId) > -1) {
						favorite.dishes.remove(req.params.dishId);
					}
					favorite.save()
						.then((favorite) => {
							res.statusCode = 200;
							res.setHeader('Content-Type', 'application/json');
							res.json(favorite);
						})
				}
			}, (err) => next(err))
			.catch((err) => next(err))
	});
module.exports = favoriteRouter;