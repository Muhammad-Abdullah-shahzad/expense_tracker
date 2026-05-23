import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const budgetSchema = new mongoose.Schema({
  total: { type: Number, default: 1200 },
  food: { type: Number, default: 300 },
  utilities: { type: Number, default: 200 },
  shopping: { type: Number, default: 250 },
  entertainment: { type: Number, default: 150 },
  transportation: { type: Number, default: 100 },
  health: { type: Number, default: 100 },
  travel: { type: Number, default: 100 },
  miscellaneous: { type: Number, default: 50 }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  primaryCurrency: {
    type: String,
    default: 'PKR'
  },
  budgets: {
    type: budgetSchema,
    default: () => ({})
  }
}, {
  timestamps: true
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Configure JSON serialization transform to map _id to id
userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password; // Do not return password hash
    return ret;
  }
});

const User = mongoose.model('User', userSchema);

export default User;
