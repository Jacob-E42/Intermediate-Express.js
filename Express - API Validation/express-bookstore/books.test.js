process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("./app");
const db = require("./db");

let book1;

describe("Book API tests", function () {
	beforeEach(async () => {
		await db.query(`DELETE FROM books`);
		book1 = {
			"isbn": "0691161518",
			"amazon_url": "http://a.co/eobPtX2",
			"author": "Matthew Lane",
			"language": "english",
			"pages": 264,
			"publisher": "Princeton University Press",
			"title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
			"year": 2017
		};
		await db.query(
			`INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
			[book1.isbn, book1.amazon_url, book1.author, book1.language, book1.pages, book1.publisher, book1.title, book1.year]
		);
	});
	describe("GET books/ routes", () => {
		test("GET books/", async () => {
			const resp = await request(app).get("/books/");
			expect(resp.statusCode).toBe(200);
			expect(resp.body).toEqual({ "books": [book1] });
		});
		test("GET books/:isbn", async () => {
			const resp = await request(app).get(`/books/${book1.isbn}`);
			expect(resp.statusCode).toBe(200);
			expect(resp.body.book.pages).toBe(264);
		});
		test("will resp w/ 404 if isbn is wrong", async () => {
			const resp = await request(app).get(`/books/"0691161517"`);
			expect(resp.statusCode).toBe(404);
		});
	});

	describe("POST books/:isbn", () => {
		test("creates book w/ valid data", async () => {
			const resp = await request(app).post(`/books/`).send({
				"isbn": "0691555518",
				"amazon_url": "http://a.co/eobPtX2",
				"author": "Testy",
				"language": "english",
				"pages": 264,
				"publisher": "Princeton University Press",
				"title": "This is a test title",
				"year": 2017
			});
			expect(resp.statusCode).toBe(201);
			expect(resp.body.book.title).toBe("This is a test title");
		});
		test("will respond w/ 400 if data is missing", async () => {
			const resp = await request(app).post(`/books/`).send({
				"isbn": "0691555518",
				"amazon_url": "http://a.co/eobPtX2",
				"author": "Testy",
				"language": "english",
				"pages": 264,
				"publisher": "Princeton University Press",
				"title": "This is a test title"
			});
			expect(resp.statusCode).toBe(400);
		});
		test("will respond w/ 400 if data is the wrong type", async () => {
			const resp = await request(app).post(`/books/`).send({
				"isbn": "0691555518",
				"amazon_url": "http://a.co/eobPtX2",
				"author": "Testy",
				"language": "english",
				"pages": "264",
				"publisher": "Princeton University Press",
				"title": "This is a test title"
			});
			expect(resp.statusCode).toBe(400);
		});
		test("will respond w/ 400 if a property is empty", async () => {
			const resp = await request(app).post(`/books/`).send({
				"isbn": "0691555518",
				"amazon_url": "http://a.co/eobPtX2",
				"author": "Testy",
				"language": "",
				"pages": 264,
				"publisher": "Princeton University Press",
				"title": "This is a test title"
			});
			expect(resp.statusCode).toBe(400);
		});
	});
	describe("PUT books/:isbn", () => {
		test("updates book w/ valid data", async () => {
			const resp = await request(app).put(`/books/${book1.isbn}`).send({
				"isbn": "0691555518",
				"amazon_url": "http://a.co/eobPtX2",
				"author": "Testy",
				"language": "english",
				"pages": 264,
				"publisher": "Princeton University Press",
				"title": "This is a test title",
				"year": 2019
			});
			expect(resp.statusCode).toBe(200);
			expect(resp.body.book.year).toBe(2019);
		});
		test("will respond w/ 400 if data is missing", async () => {
			const resp = await request(app).put(`/books/${book1.isbn}`).send({
				"isbn": "0691555518",
				"amazon_url": "http://a.co/eobPtX2",
				"language": "english",
				"pages": 264,
				"publisher": "Princeton University Press",
				"title": "This is a test title"
			});
			expect(resp.statusCode).toBe(400);
		});
	});
	describe("DELETE books/:isbn", () => {
		test("deletes book w/ valid isbn", async () => {
			const resp = await request(app).delete(`/books/${book1.isbn}`);
			expect(resp.statusCode).toBe(200);
			expect(resp.body).toEqual({ message: "Book deleted" });
		});
		test("throws 404 if isbn is wrong", async () => {
			const resp = await request(app).delete(`/books/${book1.isbn}1`);
			expect(resp.statusCode).toBe(404);
		});
	});
	afterAll(async () => {
		await db.end();
	});
});
