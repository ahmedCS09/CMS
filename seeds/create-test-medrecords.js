const mongoose = require('mongoose');
const { dbConnect } = require('../app/lib/mongodb');
const Appointment = require('../app/models/appointmentsModel');
const MedRecord = require('../app/models/medRecordsModel');
const Prescription = require('../app/models/prescriptionsModel');

async function seedTestData() {
  try {
    await dbConnect();

    // Sample completed appointment for ref
    const testAppointmentId = new mongoose.Types.ObjectId();
    const appointment = await Appointment.create({
      _id: testAppointmentId,
      patientName: 'John Doe',
      doctorName: 'Dr. Smith',
      patientId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'), // dummy
      doctorId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
      appointmentDate: new Date('2024-08-15'),
      appointmentTime: '14:00',
      appointmentStatus: 'completed',
    });

    // MedRecord
    const testRecordId = new mongoose.Types.ObjectId();
    const medRecord = await MedRecord.create({
      _id: testRecordId,
      appointmentId: testAppointmentId,
      patientName: 'John Doe',
      doctorName: 'Dr. Smith',
      diagnosis: 'Routine annual checkup. Patient in good health. Mild vitamin deficiency noted.',
    });

    // Prescriptions
    await Prescription.create({
      recordID: testRecordId,
      medicationName: 'Vitamin D3',
      dosage: '2000 IU daily',
      instructions: 'Take with breakfast or lunch. Continue for 3 months.',
      duration: '90 days',
    });

    await Prescription.create({
      recordID: testRecordId,
      medicationName: 'Aspirin 81mg',
      dosage: '1 tablet',
      instructions: 'As needed for headaches or minor pain. Not exceeding 2 per day.',
      duration: 'PRN',
    });

    console.log('✅ Successfully seeded test data for patient "John Doe":');
    console.log('- 1 Appointment (completed)');
    console.log('- 1 Medical Record');
    console.log('- 2 Prescriptions');
    console.log('\\nNow login as patient "John Doe" and visit /patient/viewMedRecordsPage to see data!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
}

seedTestData();
