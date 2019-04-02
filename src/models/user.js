import mongoose from 'mongoose';

const UserSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  createdAt: String,
  password: String,
});

export default mongoose.model('User', UserSchema);
