const express = require('express')
const router = express.Router()

module.exports = (db) => {
  router.post('/churches/:id/entries', async (req, res) => {
    const { amount, finance_type_id, payment_method, description, account_id } = req.body
    const [entry] = await db('church_entries').insert({ id: db.raw('uuid_generate_v4()'), church_id: req.params.id, account_id, finance_type_id, amount, payment_method, description }).returning('*')
    res.status(201).json(entry)
  })
  router.post('/church_accounts/:id/close', async (req, res) => {
    await db.raw('select calculate_repass_and_close(?)', [req.params.id])
    res.json({ ok: true })
  })
  return router
}

