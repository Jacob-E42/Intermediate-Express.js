const express = require("express");
const router = express.Router();
const { SECRET_KEY } = require("../config");
const User = require("../models/user");
const Message = require("../models/message");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const ExpressError = require("../expressError");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", ensureCorrectUser, async (req, res, next) => {
	const message = await Message.get(req.params.id);
	if (message.rows.length == 0) return next(new ExpressError("Message not found!", 404));
	return res.json({ message });
});
/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, async (req, res, next) => {
	const message = await Message.create(req.body.to_username, req.body.body);
	if (message.rows.length == 0) return next(new ExpressError("Message not created!", 400));
	return res.json({ message });
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read", ensureCorrectUser, async (req, res, next) => {
	const message = await Message.create(req.body.to_username, req.body.body);
	if (message.rows.length == 0) return next(new ExpressError("Message not created!", 400));
	return res.json({ message });
});

module.exports = router;
