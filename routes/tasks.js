const express = require('express')
const db = require('../database');
const router = express.Router()

router.get('/:username', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }

    const username = req.params.username;
    const userQuery = 'SELECT id FROM users WHERE username = ?';

    db.query(userQuery, [username], (err, userResult) => {
        if (err || userResult.length === 0) {
            return res.render('tasks', { error: 'User not found', currentUser: username, tasks: [] });
        }

        const userId = userResult[0].id;
        const taskQuery = 'SELECT * FROM tasks WHERE user_id = ?';

        db.query(taskQuery, [userId], (err, taskResults) => {
            if (err) {
                return res.render('tasks', { error: err.message, currentUser: username, tasks: [] });
            }
            res.render('tasks', { error: null, currentUser: username, tasks: taskResults });
        });
    });
});

// Add a new task
router.post('/:username/add', (req, res) => {
    const { username, task } = req.body;
    const userQuery = 'SELECT id FROM users WHERE username = ?';

    db.query(userQuery, [username], (err, userResult) => {
        if (err || userResult.length === 0) {
            return res.status(500).send('User not found');
        }

        const userId = userResult[0].id;
        const insertQuery = 'INSERT INTO tasks (user_id, task) VALUES (?, ?)';

        db.query(insertQuery, [userId, task], (err, result) => {
            if (err) {
                return res.status(500).send(err.message);
            }
            res.redirect(`/tasks/${username}`);
        });
    });
});

// Delete a task
router.post('/:username/delete/:id', (req, res) => {
    const taskId = req.params.id;
    const deleteQuery = 'DELETE FROM tasks WHERE id = ?';

    db.query(deleteQuery, [taskId], (err, result) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.redirect(`/tasks/${req.body.username}`);
    });
});

// Mark a task as completed
router.post('/:username/complete/:id', (req, res) => {
    const taskId = req.params.id;
    const updateQuery = 'UPDATE tasks SET status = "Finalizado" WHERE id = ?';

    db.query(updateQuery, [taskId], (err, result) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.redirect(`/tasks/${req.body.username}`);
    });
});

module.exports = router