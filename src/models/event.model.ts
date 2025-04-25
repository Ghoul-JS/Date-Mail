import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fechaDetectada: { type: Date, required: true },
  resumen: { type: String },
  googleEventId: { type: String },
});

export default mongoose.model('Event', eventSchema);
