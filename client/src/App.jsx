import { BrowserRouter, Routes, Route } from "react-router-dom";

// Home / Landing
import Home from "./pages/Home";

// Doctor Pages
import DoctorRegister from "./pages/Doctor/DoctorRegister";
import DoctorList from "./pages/Doctor/DoctorList";
import DoctorProfile from "./pages/Doctor/DoctorProfile";
import DoctorEdit from "./pages/Doctor/DoctorEdit";
import DoctorAvailability from "./pages/Doctor/DoctorAvailability";
import DoctorAppointment from "./pages/Doctor/DoctorAppointment";
import Notification from "./pages/Doctor/Notification";

// Patient Pages
import PatientRegister from "./pages/Patient/PatientRegister";
import PatientProfile from "./pages/Patient/PatientProfile";
import MyAppointments from "./pages/Patient/MyAppointments";
import PatientMedicine from "./pages/Patient/PatientMedicine";
import HealthRecords from "./pages/Patient/HealthRecords";

// Appointment Booking
import BookAppointment from "./pages/Appointment/BookAppointment";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Step 1: Initial Entry (Choice / Registration Gateway) */}
        <Route path="/" element={<Home />} />

        {/* Doctor Routes */}
        <Route path="/doctor/register" element={<DoctorRegister />} />
        <Route path="/doctors" element={<DoctorList />} />
        <Route path="/doctors/:doctorId" element={<DoctorProfile />} />
        <Route path="/doctors/:doctorId/edit" element={<DoctorEdit />} />
        <Route path="/doctors/:doctorId/availability" element={<DoctorAvailability />} />
        <Route path="/doctors/:doctorId/appointments" element={<DoctorAppointment />} />
        <Route path="/doctors/:doctorId/notifications" element={<Notification />} />

        {/* Patient Routes */}
        <Route path="/patients/register" element={<PatientRegister />} />
        <Route path="/patients/:patientId" element={<PatientProfile />} />
        <Route path="/patients/:patientId/appointments" element={<MyAppointments />} />
        <Route path="/patients/:patientId/medicines" element={<PatientMedicine />} />
        <Route path="/patients/:patientId/health-records" element={<HealthRecords />} />

        {/* Step 3: Appointment Booking */}
        <Route
          path="/book-appointment/:doctorId/:patientId"
          element={<BookAppointment />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;