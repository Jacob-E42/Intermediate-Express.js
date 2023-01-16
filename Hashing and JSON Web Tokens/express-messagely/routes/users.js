const express = require("express");
const router = express.Router();
const { SECRET_KEY } = require("../config");
const User = require("../models/user");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const ExpressError = require("../expressError");

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get("/", ensureLoggedIn, async (req, res, next) => {
	try {
		const users = await User.all();
		if (users.length === 0) return next(new ExpressError("No users found!", 404));
		return res.json({ users });
	} catch (err) {
		return next(err);
	}
});

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get("/:username", ensureLoggedIn, async (req, res, next) => {
	try {
		const user = await User.get(req.params.username);
		if (user.length === 0) return next(new ExpressError("User not found!", 404));
		return res.json({ user });
	} catch (err) {
		return next(err);
	}
});

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/to", ensureCorrectUser, async (req, res, next) => {
	try {
		const user_messages = await User.messagesTo(req.params.username);
		if (user_messages.length === 0) return next(new ExpressError("Messages not found!", 404));
		return res.json({ user_messages });
	} catch (err) {
		return next(err);
	}
});

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/from", ensureCorrectUser, async (req, res, next) => {
	try {
		const user_messages = await User.messagesFrom(req.params.username);
		if (user_messages.length === 0) return next(new ExpressError("Messages not found!", 404));
		return res.json({ user_messages });
	} catch (err) {
		return next(err);
	}
});
module.exports = router;
