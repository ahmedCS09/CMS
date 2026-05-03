import { dbConnect } from "./app/lib/mongodb.js";
import PreConsultation from "./app/models/preConsultationModel.js";

async function checkData() {
    await dbConnect();
    const count = await PreConsultation.countDocuments();
    console.log("Total PreConsultations:", count);
    const data = await PreConsultation.find().limit(5).lean();
    console.log("Sample Data:", JSON.stringify(data, null, 2));
    process.exit(0);
}

checkData();
