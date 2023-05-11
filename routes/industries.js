const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");
const slugify = require('slugify')

router.get('/', async (req, res, next) => {
    try {
        const indusRes = await db.query(`SELECT * FROM industries;`);
        let industries = await Promise.all(indusRes.rows.map( async (r) => {
            const compRes = await db.query(
                    `SELECT c.code
                        FROM industries AS i
                        LEFT JOIN industries_companies AS ic
                        ON i.code = ic.industry_code
                        LEFT JOIN companies AS c
                        ON ic.company_code = c.code
                        WHERE i.code = $1;`, [r.code]);
            r.companies = compRes.rows.map(r => r.code);
            return r;
        }));
        return res.json({industries});
    } catch (e) {
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try {
        var { code, industries } = req.body;
        code = slugify(code, {remove: /[*+~.()'"!:@]/g});
        const results = await db.query(`INSERT INTO industries (code, industries) 
                                        VALUES ($1, $2)
                                        RETURNING code, industries`, [code, industries]);
        return res.status(201).json({industries: results.rows[0]});
    } catch (e) {
        return next(e);
    }
})


router.put('/:ind_code', async (req, res, next) => {
    try {
        const industry_code = req.params.ind_code;
        const results = await db.query(`INSERT INTO industries_companies (industry_code, company_code) 
                                        VALUES ($1, $2)
                                        RETURNING industry_code, company_code`, [industry_code, req.body.company_code]);
        return res.status(201).json({industries_companies: results.rows[0]});
    } catch (e) {
        return next(e);
    }
})

module.exports = router;  