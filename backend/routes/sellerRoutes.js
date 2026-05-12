const express = require('express');
const router = express.Router();
const {
  getSellerAccount,
  updateSellerAccount,
  getSellerStaff,
  addSellerStaff,
  updateStaffPermissions,
  removeStaff,
} = require('../controllers/sellerController');
const { protect, authorizeSeller } = require('../middleware/auth');

// All routes here require being a seller owner/admin
router.use(protect);

router.get('/account', authorizeSeller('view_settings'), getSellerAccount);
router.put('/account', authorizeSeller('manage_settings'), updateSellerAccount);

router.get('/staff', authorizeSeller('manage_team'), getSellerStaff);
router.post('/staff', authorizeSeller('manage_team'), addSellerStaff);
router.put('/staff/:id/permissions', authorizeSeller('manage_team'), updateStaffPermissions);
router.delete('/staff/:id', authorizeSeller('manage_team'), removeStaff);

module.exports = router;
