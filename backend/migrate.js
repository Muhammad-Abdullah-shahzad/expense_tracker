import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Expense from './models/Expense.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('MongoDB Connected');
  
  // Update all Users
  const userResult = await User.updateMany(
    { primaryCurrency: 'USD' },
    { $set: { primaryCurrency: 'PKR' } }
  );
  console.log(`Updated ${userResult.modifiedCount} users to PKR.`);

  // Update all Expenses
  const expResult = await Expense.updateMany(
    { currency: 'USD' },
    { $set: { currency: 'PKR' } }
  );
  console.log(`Updated ${expResult.modifiedCount} expenses to PKR.`);

  process.exit();
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
