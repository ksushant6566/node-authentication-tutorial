const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const Favorite = require('../models/favorite');
const cors = require('./cors');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
    .get(cors.cors, authenticate.verifyUser, (req, res) => {
        Favorite.find({user: req.user._id})
            .populate('dishes')
            .populate('user')
            .then(favorites => {
                res.status(200).json(favorites);
            })
            .catch(err => res.status(400).json(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        Favorite.findOne({user: req.user._id})
            .then(favorites => {
                if(favorites == null) {
                    Favorite.create({
                        user: req.user._id
                    })
                    .then(fav => {
                        req.body.forEach(dish => fav.dishes.push(dish._id));
                        fav.save()
                        .then(favorite => {res.status(200).json(favorite)})
                        .catch(err => res.status(400).json({err, line: "line32"}));
                    })
                    .catch(err => res.status(400).json({line: "line34",err}));
                }
                else {
                    req.body.forEach(dish => {
                        if(favorites.dishes.indexOf(dish._id) < 0) {
                            favorites.dishes.push(dish._id);
                        }
                    })
                    favorites.save()
                        .then(favorite => {res.status(200).json(favorite)})
                        .catch(err => res.status(400).json({line: "line44",err}));
                }
            })
            .catch(err => res.status(400).json({line: "line47",err}));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        Favorite.findOneAndDelete({user: req.user._id})
            .then(favorite => res.status(200).json(favorite))
            .catch(err => res.status(400).jaon(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.json({err: " post operation not supported on /favorites/"})
    })

favoriteRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
    .get((req, res) =>{ 
        res.json({err: " get operation not supported on /favorites/dishid"}) 
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        Favorite.findOne({user: req.user._id})
            .then(favorite => {
                if(favorite == null) {
                    Favorite.create({
                        user: req.user._id
                    })
                    .then(favorite => {
                        favorite.dishes.push(req.params.dishId);
                        favorite.save()
                        .then(favorite => res.status(200).json(favorite))
                        .catch(err => res.status(400).json(err))
                    })
                    .catch(err => res.status(400).status(err));
                }else {
                    if(favorite.dishes.indexOf(req.params.dishId) < 0) {
                        favorite.dishes.push(req.params.dishId);
                        favorite.save()
                            .then(favorite => res.status(200).json(favorite))
                            .catch(err => res.status(400).json(err));
                    }
                }
            })
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        Favorite.findOne({user: req.user._id})
            .then(fav => {
                if(fav != null && fav.dishes.indexOf(req.params.dishId) >= 0) {
                    fav.dishes = fav.dishes.filter(id => { id !== req.params.dishId })
                    fav.save()
                        .then(fav => res.status(200).json(fav))
                        .catch(err => res.status(400).json(err));
                }else {
                    return res.status(400).json({err: "error bro"});
                }
            })
            .catch(err => res.status(400).json(err))
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.json({err: " post operation not supported on /favorites/dishId"})
    })

module.exports = favoriteRouter;