const express = require("express");
const router = express.Router();
const { SECRET_KEY } = require("../config");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const ExpressError = require("../expressError");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async (req, res, next) => {
	try {
		const authenticated = await User.authenticate(req.body.username, req.body.password);
		if (!authenticated) return next(new ExpressError("Invalid username/password", 400));
		let token = jwt.sign({ username: req.body.username }, SECRET_KEY);

		User.updateLoginTimestamp();

		return res.json({ token });
	} catch (err) {
		return next(err);
	}
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post("/register", async (req, res, next) => {
	try {
		const { username } = await User.register(req.body);

		let token = jwt.sign({ username }, SECRET_KEY);

		User.updateLoginTimestamp();
		console.log(token);
		return res.json({ token });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
