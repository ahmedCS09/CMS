import { Server } from "socket.io";
import http from "http";

const httpServer = http.createServer();

const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:3000", "http://your-production-domain.com"], // Add production URL later
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log("📍 Socket terminal connected:", socket.id);

    // Auto-join role-based rooms
    socket.on("join_role_room", (role) => {
        const room = `${role}_room`;
        socket.join(room);
        console.log(`👨‍⚕️ Doctor ${socket.id} joined ${room}`);
    });

    // 1. Join Room Logic
    socket.on("join_room", (room) => {
        if (!room) return;
        socket.join(String(room));
        console.log(`👤 User ${socket.id} joined room: ${room}`);
    });

    // 2. Chat Sync Logic
    socket.on("send_message", (data) => {
        console.log("💬 Message sync:", data);
        if (data.room) {
            socket.to(String(data.room)).emit("receive_message", data);
        } else {
            socket.broadcast.emit("receive_message", data);
        }
    });

    // 3. Admin Notification: New Patient Registration
    socket.on("newPatientRegistered", (user) => {
        console.log("📢 Broadcasting new patient registration:", user.fullName);
        // We broadcast this to everyone (Admins will filter this on the frontend)
        io.emit("newPatientRegistered", user); 
    });

    // 4. Patient Notification: Appointment Updates
    // FIXED: Moved outside of the newPatientRegistered block
    socket.on("appointmentStatusUpdated", (appointment) => {
        console.log("🔄 Appointment Update Event received for ID:", appointment?._id);
        
        if (appointment && appointment.patientId) {
            const patientRoom = String(appointment.patientId);
            console.log(`🎯 Targeting patient room: ${patientRoom}`);
            
            // Emit to the specific patient room
            io.to(patientRoom).emit("appointmentStatusUpdated", appointment);
            socket.broadcast.to('doctor_room').emit("appointmentStatusUpdated", appointment);
        } else {
            console.log("🌐 No patientId found, broadcasting to all");
            io.emit("appointmentStatusUpdated", appointment);
            socket.broadcast.to('doctor_room').emit("appointmentStatusUpdated", appointment);
        }

        // NEW: Check-in notification to doctors
        if (appointment?.appointmentStatus === 'checked-in') {
            const checkInData = {
                patientName: appointment.patientName,
                appointmentId: appointment._id,
                doctorName: appointment.doctorName,
                time: appointment.appointmentTime
            };
            console.log("🔔 Patient checked in! Notifying doctors:", checkInData);
            io.to('doctor_room').emit('patientCheckedIn', checkInData);
        }
    });

    socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
    });
});

const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`🚀 Socket.io server is running on port ${PORT}`);
});