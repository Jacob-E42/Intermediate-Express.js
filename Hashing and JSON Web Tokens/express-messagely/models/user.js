const db = require("../db");
const ExpressError = require("../expressError");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
/** User class for message.ly */

/** User of the site. */

class User {
	/** register new user -- returns
	 *    {username, password, first_name, last_name, phone}
	 */

	static async register({ username, password, first_name, last_name, phone }) {
		let hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
		const result = await db.query(
			`INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
	      VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
	      RETURNING username, password, first_name, last_name, phone`,
			[username, hashedPassword, first_name, last_name, phone]
		);
		// console.log(results);
		if (result.rowCount === 0) return new ExpressError("Invalid", 400);

		return result.rows[0];
	}

	/** Authenticate: is this username/password valid? Returns boolean. */

	static async authenticate(username, password) {
		if (!username || !password) throw new ExpressError("Must include username and password", 400);
		const result = await db.query(
			`
        SELECT password FROM users
        WHERE username=$1
      `,
			[username]
		);

		if (result.rowCount === 0) throw new ExpressError("Password not found", 404);
		const user = result.rows[0];
		return bcrypt.compare(password, user.password);
	}

	/** Update last_login_at for user */

	static async updateLoginTimestamp(username) {
		await db.query(`UPDATE users SET last_login_at=current_timestamp`);
	}

	/** All: basic info on all users:
	 * [{username, first_name, last_name, phone}, ...] */

	static async all() {
		try {
			const results = await db.query(
				`
        SELECT username, first_name, last_name, phone
        FROM users
      `
			);
			if (!results) throw new ExpressError("Invalid query", 400);

			return results.rows;
		} catch (err) {
			return err;
		}
	}

	/** Get: get user by username
	 *
	 * returns {username,
	 *          first_name,
	 *          last_name,
	 *          phone,
	 *          join_at,
	 *          last_login_at } */

	static async get(username) {
		try {
			const result = await db.query(
				`SELECT username, first_name, last_name, phone, join_at, last_login_at 
          FROM users
          WHERE username=$1`,
				[username]
			);
			if (result.rowCount === 0) return new ExpressError("Invalid username.", 400);

			return result.rows[0];
		} catch (err) {
			return err;
		}
	}

	/** Return messages from this user.
	 *
	 * [{id, to_user, body, sent_at, read_at}]
	 *
	 * where to_user is
	 *   {username, first_name, last_name, phone}
	 */

	static async messagesFrom(username) {
		const messages = await db.query(
			`SELECT m.id, m.body, m.sent_at, m.read_at, u.username, u. first_name, u.last_name, u.phone
        FROM messages as m
        JOIN users as u ON u.username=m.to_username
        WHERE from_username=$1`,
			[username]
		);

		return messages.rows.map((m) => ({
			id: m.id,
			to_user: { username: m.username, first_name: m.first_name, last_name: m.last_name, phone: m.phone },
			body: m.body,
			sent_at: m.sent_at,
			read_at: m.read_at
		}));
	}

	/** Return messages to this user.
	 *
	 * [{id, from_user, body, sent_at, read_at}]
	 *
	 * where from_user is
	 *   {username, first_name, last_name, phone}
	 */

	static async messagesTo(username) {
		const messages = await db.query(
			`SELECT m.id, m.body, m.sent_at, m.read_at, u.username, u. first_name, u.last_name, u.phone
        FROM messages as m
        JOIN users as u ON u.username=m.from_username
        WHERE to_username=$1`,
			[username]
		);

		return messages.rows.map((m) => ({
			id: m.id,
			from_user: { username: m.username, first_name: m.first_name, last_name: m.last_name, phone: m.phone },
			body: m.body,
			sent_at: m.sent_at,
			read_at: m.read_at
		}));
	}
}

module.exports = User;
