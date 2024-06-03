const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../database');
const router = express.Router();

// Login GET route
router.get("/login", (req, res) => {
    if (req.session.userId) {
        return res.redirect(`/tasks/${req.session.username}`);
    }
    res.render("login", { error: null, currentUser: req.session.username });
});

// Login POST route
router.post("/login", (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).send('Server error');
        }

        if (results.length !== 1) {
            return res.render('login', { error: 'Não foi encontrado nenhum usuário com este nome!', currentUser: null });
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                console.error('Erro ao comparar as senhas:', err);
                return res.status(500).send('Erro interno do servidor');
            }

            if (result) {
                req.session.userId = user.id;
                req.session.username = user.username;
                req.session.email = user.email;

                res.redirect(`/tasks/${req.session.username}`);
            } else {
                res.render('login', { error: 'Credenciais inválidas.', currentUser: null });
            }
        });
    });
});

// Register GET route
router.get("/register", (req, res) => {
    if (req.session.userId) {
        return res.redirect(`/tasks/${req.session.username}`);
    }

    res.render('register', { error: null, currentUser: req.session.username });
});

// Register POST route
router.post("/register", async (req, res) => {
    const { username, password, email } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.render('register', { error: 'Formato de email inválido.', currentUser: null });
    }

    const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.render('register', { error: 'A senha deve ter no mínimo 8 caracteres, incluindo pelo menos 2 números, 1 caractere especial, 1 letra maiúscula e 1 letra minúscula.', currentUser: null });
    }

    const query = 'SELECT * FROM users WHERE username = ? OR email = ?';
    db.query(query, [username, email], (error, results) => {
        if (error) {
            console.error('Erro ao consultar o banco de dados:', error);
            return res.status(500).send('Erro interno do servidor');
        }

        if (results.length > 0) {
            return res.render('register', { error: 'Nome de usuário ou email já está em uso.', currentUser: null });
        }

        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                console.error('Erro ao criar hash da senha:', err);
                return res.status(500).send('Erro interno do servidor');
            }

            const insertQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
            db.query(insertQuery, [username, email, hash], (insertError, insertResults) => {
                if (insertError) {
                    console.error('Erro ao inserir usuário no banco de dados:', insertError);
                    return res.status(500).send('Erro interno do servidor');
                }

                const userId = insertResults.insertId;
                const getUserQuery = 'SELECT * FROM users WHERE id = ?';
                db.query(getUserQuery, [userId], (getUserError, getUserResults) => {
                    if (getUserError) {
                        console.error('Erro ao recuperar usuário do banco de dados:', getUserError);
                        return res.status(500).send('Erro interno do servidor');
                    }

                    const user = getUserResults[0];

                    req.session.userId = user.id;
                    req.session.username = user.username;
                    req.session.email = user.email;

                    res.redirect(`/tasks/${req.session.username}`);
                });
            });
        });
    });
});

// Logout route
router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Could not log out.');
        }
        res.redirect('/auth/login');
    });
});

module.exports = router;
