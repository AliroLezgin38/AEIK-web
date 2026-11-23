'use strict';

const express = require('express');
const { ObjectId } = require('mongodb');
const { getDb, sendDbUnavailable } = require('../db');
const { hashPassword, publicUser, requireAuth, requireRole, signToken, verifyPassword } = require('../auth');
const { ApiError, isEmail, isNonEmptyString, wrap } = require('../utils');

const router = express.Router();

// POST /api/v1/auth/register — yalnız owner/admin yeni istifadəçi yarada bilər.
router.post(
  '/register',
  requireAuth,
  requireRole('owner', 'admin'),
  wrap(async (req, res) => {
    const { email, password, displayName, department } = req.body || {};

    if (!isEmail(email)) throw new ApiError(400, 'Düzgün email ünvanı daxil edin.');
    if (!isNonEmptyString(displayName, 2)) throw new ApiError(400, 'Ad və soyad daxil edilməlidir.');
    if (typeof password !== 'string' || password.length < 6) {
      throw new ApiError(400, 'Şifrə ən azı 6 simvoldan ibarət olmalıdır.');
    }

    const db = await getDb();
    if (!db) return sendDbUnavailable(res);

    const users = db.collection('users');
    const normalizedEmail = email.trim().toLowerCase();

    if (await users.findOne({ email: normalizedEmail })) {
      throw new ApiError(409, 'Bu email ilə istifadəçi artıq mövcuddur.');
    }

    const doc = {
      email: normalizedEmail,
      password: await hashPassword(password),
      displayName: displayName.trim(),
      department: (department || 'Layihələrin idarə olunması').toString().trim(),
      role: 'member',
      createdAt: Date.now(),
    };

    let insertedId;
    try {
      const result = await users.insertOne(doc);
      insertedId = result.insertedId;
    } catch (error) {
      if (error && error.code === 11000) {
        throw new ApiError(409, 'Bu email ilə istifadəçi artıq mövcuddur.');
      }
      throw error;
    }

    res.status(201).json({
      user: publicUser({ ...doc, _id: insertedId }),
      token: signToken({ userId: String(insertedId), email: normalizedEmail, role: 'member' }),
      isDemo: false,
    });
  })
);

// POST /api/v1/auth/login
router.post(
  '/login',
  wrap(async (req, res) => {
    const { email, password } = req.body || {};
    if (!isEmail(email) || typeof password !== 'string' || password === '') {
      throw new ApiError(400, 'Email və şifrə daxil edilməlidir.');
    }

    const db = await getDb();
    if (!db) return sendDbUnavailable(res);

    const normalizedEmail = email.trim().toLowerCase();
    const user = await db.collection('users').findOne({ email: normalizedEmail });
    if (!user) throw new ApiError(401, 'Email və ya şifrə yanlışdır.');

    const valid = await verifyPassword(password, user.password);
    if (!valid) throw new ApiError(401, 'Email və ya şifrə yanlışdır.');

    res.json({
      user: publicUser(user),
      token: signToken({ userId: String(user._id), email: user.email, role: user.role }),
      isDemo: false,
    });
  })
);

// GET /api/v1/auth/me
router.get(
  '/me',
  requireAuth,
  wrap(async (req, res) => {
    const db = await getDb();
    if (!db) return sendDbUnavailable(res);

    if (!ObjectId.isValid(req.user.userId)) throw new ApiError(401, 'Token etibarsızdır.');

    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.userId) });
    if (!user) throw new ApiError(404, 'İstifadəçi tapılmadı.');

    res.json({ user: publicUser(user), callerRole: req.user.role });
  })
);

module.exports = router;
