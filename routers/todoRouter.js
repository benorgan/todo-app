const express = require('express')

const { ToDo } = require('../models')

const router = express.Router()

router.get('/todos', async (req, res) => {
    const todos = await ToDo.find({
        user: req.user.id
    })
    return res.status(200).json(todos)
})

router.put('/todos', async (req, res) => {

    if (!req.body.title) {
        return res.status(400).json({ message: 'Title field is required to create todo' })
    }
    if (!req.body.details) {
        return res.status(400).json({ message: 'Details field is required to create todo' })
    }

    const todo = await ToDo.create({
        title: req.body.title,
        details: req.body.details,
        user: req.user.id
    })

    return res.status(201).json(todo)
})

router.patch('/todos/:id', async (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({ message: 'ID is required to update a todo' })
    }

    try {
        await ToDo.updateOne({
            _id: req.params.id,
            user: req.user.id
        }, {
            title: req.body.title,
            details: req.body.details,
            completed: req.body.completed
        })

        const todo = await ToDo.findOne({ _id: req.params.id })

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' })
        }
        return res.status(200).json(todo)
    } catch (error) {
        return res.status(400).json({ message: 'Update todo failed' })
    }
})

module.exports = router
