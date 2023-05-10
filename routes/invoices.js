const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");


router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT id, comp_code FROM invoices`);
        
        return res.json({ invoices: results.rows })
    } catch (e) {
        return next(e);
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        let results = await db.query(`SELECT * FROM invoices WHERE id=$1`, [req.params.id]);
        if(results.rows.length === 0){
            throw new ExpressError("invoice cannot be found", 404);
        }
        let { id, comp_code, amt, paid, add_date, paid_date } = results.rows[0];
        results = await db.query(`SELECT * FROM companies WHERE code = $1`, [comp_code]);
        return res.json({ invoices: {id, amt, paid, add_date, paid_date, company: results.rows[0]} })
    } catch (e) {
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try {
        let results = await db.query(`INSERT INTO invoices 
                                    (comp_code, amt) VALUES ($1, $2) 
                                    RETURNING id, comp_code, amt, paid, add_date, paid_date`, 
                                    [req.body.comp_code, req.body.amt]);
        return res.status(201).json({ invoice: results.rows[0]});
    } catch (e) {
        return next(e);
    }
})

router.put('/:id', async (req, res, next) => {
    try {
        const results = await db.query(`UPDATE invoices SET amt = $1
                                        WHERE id = $2 
                                        RETURNING id, comp_code, amt, paid, add_date, paid_date`,
                                        [req.body.amt, req.params.id]);
        if(results.rows.length === 0) {
            throw new ExpressError("invoice cannot be found", 404);
        }
        return res.json({invoice: results.rows[0]});
    } catch (e) {
        return next(e);
    }
})


router.delete('/:id', async (req, res, next) => {
    try {
        const results = await db.query(`DELETE FROM invoices WHERE id = $1 RETURNING id`, [req.params.id]);
        if(results.rows.length === 0) {
            throw new ExpressError("invoice cannot be found", 404);
        }
        return res.json({status: "deleted"});
    } catch (e) {
        return next(e);
    }
})

module.exports = router;  