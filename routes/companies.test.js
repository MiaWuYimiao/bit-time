
//connect to the right db  -- set before loading db.js
process.env.NODE_ENV = "test"

//npm pakages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");

let testCompany = {code: "TSL", name: "Tesla", description: "Crazy stock price"};

beforeEach( async function() {
    const results = await db.query(`INSERT INTO companies (code, name, description)
                                    VALUES ($1, $2, $3)`,
                                    [testCompany.code, testCompany.name, testCompany.description]);
})


/** GET /companies - returns `{companies: [{code, name}, ...]}` */
describe("GET /companies", function() {
    test("get a list of 1 company", async function() {
        const response = await request(app).get('/companies');
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            companies: [testCompany]});
    })
});

afterEach( async function() {
    await db.query(`DELETE FROM companies`);
})

afterAll( async function() {
    await db.end();
})