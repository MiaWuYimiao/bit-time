const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");
const slugify = require('slugify')


router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`);
        return res.json({ companies: results.rows })
    } catch (e) {
        return next(e);
    }
})

router.get('/:code', async (req, res, next) => {
    try {
        const companies = await db.query(`SELECT * FROM companies WHERE code = $1`, [req.params.code]);
        if(companies.rows.length === 0) {
            throw new ExpressError("company cannot be found", 404);
        }

        const invoices = await db.query(`SELECT * FROM invoices WHERE comp_code = $1`, [req.params.code]);
        const indusRes = await db.query(`
                            SELECT i.industries
                                FROM industries AS i
                                LEFT JOIN industries_companies AS ic
                                ON i.code = ic.industry_code
                                LEFT JOIN companies AS c
                                ON ic.company_code = c.code
                                WHERE c.code = $1;`, [req.params.code]);
        const industries = indusRes.rows.map(r => r.industries);
        
        const { code, name, description } = companies.rows[0];
        return res.json({company: {code, name, description, invoices: invoices.rows, industries: industries}});
    } catch (e) {
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try {
        var { code, name, description } = req.body;
        code = slugify(code, {remove: /[*+~.()'"!:@]/g});
        const results = await db.query(`INSERT INTO companies (code, name, description) 
                                        VALUES ($1, $2, $3)
                                        RETURNING code, name, description`, [code, name, description]);
        return res.status(201).json({companies: results.rows[0]});
    } catch (e) {
        return next(e);
    }
})


router.put('/:code', async (req, res, next) => {
    try{
        const { code } = req.params;
        const { name, description } = req.body;
        const results = await db.query(`UPDATE companies SET name = $1, description = $2
                                        WHERE code = $3 RETURNING code, name, description`,[name, description, code]);
        if(results.rows.length === 0) {
            throw new ExpressError("company cannot be found", 404)
        }
        return res.json({company: results.rows[0]})
    } catch (e) {
        return next(e);
    }
})


router.delete('/:code', async (req, res, next) => {
    try {
        const results = await db.query(`DELETE FROM companies WHERE code = $1 RETURNING code, name, description`, [req.params.code]);
        if(results.rows.length === 0) {
            throw new ExpressError("company cannot be found", 404);
        }
        return res.json({status: "deleted"});
    } catch (e) {
        return next(e);
    }
})

module.exports = router;    