
//connect to the right db  -- set before loading db.js
process.env.NODE_ENV = "test"

//npm pakages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");

let testCompany = {code: "TSL", name: "Tesla", description: "Crazy stock price"};
let testInvoice;

beforeEach( async function() {
    const resCompany = await db.query(`INSERT INTO companies (code, name, description)
                                    VALUES ($1, $2, $3)`,
                                    [testCompany.code, testCompany.name, testCompany.description]);

    const resInvoice = await db.query( `INSERT INTO invoices (comp_code, amt)
                                    VALUES ('TSL', 66)
                                    RETURNING id, comp_code`)
    testInvoice = resInvoice.rows[0];
})


/** GET /companies - returns `{companies: [{code, name}, ...]}` */
describe("GET /invoices", function() {
    test("get a list of 1 invoice", async function() {
        const response = await request(app).get('/invoices');
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            invoices: [testInvoice]});
    })
});

afterEach( async function() {
    await db.query(`DELETE FROM companies`);
    await db.query(`DELETE FROM invoices`);
})

afterAll( async function() {
    await db.end();
})