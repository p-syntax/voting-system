import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['admin', 'voter'],
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Admin-specific fields
  username: {
    type: String, // allows null for voters
    trim: true,
  },
  password: {
    type: String,
    select: false, // don't include in queries
  },
  // Voter-specific fields
  registrationNumber: {
    type: String, // allows null for admins
    trim: true,
    uppercase: true,
  },
  fullName: {
    type: String,
    trim: true,
  },
  faceDescriptor: {
    type: [Number],
    select: false,
  },
  hasVoted: {
    type: Boolean,
    default: false,
  },
  votedAt: {
    type: Date,
  },
}, {
  timestamps: true, // automatically adds createdAt & updatedAt
});

// Indexes for faster querying and uniqueness
userSchema.index({ role: 1 });
userSchema.index({ hasVoted: 1 });
userSchema.index({ registrationNumber: 1 }, { 
  unique: true, 
  sparse: true,
  partialFilterExpression: { role: 'voter' },
});
userSchema.index({ username: 1 }, { 
  unique: true, 
  sparse: true,
  partialFilterExpression: { role: 'admin' },
});
// hashing password for the admin 
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.role !== 'admin') {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
//creating a method to compare the saved admin password and the generated password 
userSchema.methods.comparePassword = async function (adminPass) {
    if(!this.password){
        throw new Error("password not set for this user")
    }
    return await bcrypt.compare(adminPass,this.password);
}
//finding a voter using their registration number 
userSchema.statics.findVoter = function(registrationNumber) {
  return this.findOne({ 
    role: 'voter', 
    registrationNumber: registrationNumber.toUpperCase(),
    isActive: true
  }).select('+faceDescriptor');
};
//finding the admin 
userSchema.statics.findAdmin = function(username) {
  return this.findOne({ 
    role: 'admin', 
    username: username.toLowerCase(),
    isActive: true
  }).select('+password');
};
// Method to get public profile
userSchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.faceDescriptor;
  delete obj.__v;
  return obj;
};
// Export the model
export const User = mongoose.model('User', userSchema);
