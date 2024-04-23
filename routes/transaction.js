const express = require("express");
const { rateLimit } = require("express-rate-limit");
const userAuth = require("../middlewares/authMiddleware.js");


// IP rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
const {addIncome,
      addExpense,
      deleteTransaction,
      updateTransaction,
      getAllTransactions,
      getAllIncome,
      getAllExpenses,
      setwallet,
      getTotaleBlance
     }=require('../controllers/Transaction.js')
const router = express.Router();

router.post('/set_wallet',userAuth, setwallet);
router.get('/TotalBalance',userAuth, getTotaleBlance);
router.post('/add_income',userAuth,addIncome)

router.post('/expense',userAuth, addExpense);
router.delete('/delete_transaction/:id',userAuth, deleteTransaction);
router.put('/update_transaction/:id', userAuth,updateTransaction);
router.get('/transactions',userAuth, getAllTransactions);
router.get('/getAllIncome',userAuth, getAllIncome);
router.get('/getAllExpenses',userAuth, getAllExpenses);
module.exports=router