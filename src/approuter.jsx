import React from "react";
// eslint-disable-next-line no-unused-vars

import { BrowserRouter, Routes, Route } from "react-router-dom";
//Students
import StudentList from "./pages/students/StudentList";
import AddStudent from "./pages/students/AddStudent";
import EditStudent from "./pages/students/EditStudent";
import StudentProfile from "./pages/students/StudentProfile";
import EnrollmentStats from "./pages/students/EnrollmentStats";
import NotEnrolledStudents from "./pages/students/NotEnrolledStudents";
import BulkUploadStudents from "./pages/students/BulkUploadStudents";
//Enrollments
import EnrollmentList from "./pages/enrollments/EnrollmentListNew";
import AddEnrollment from "./pages/enrollments/AddEnrollmentNew";
import EditEnrollment from "./pages/enrollments/EditEnrollment";
import BulkUploadEnrollments from "./pages/enrollments/BulkUploadEnrollments";
//Grades
import { GradeList, AddGrade, EditGrade } from "./pages/grade";
//Notifications
import { NotificationList, AddNotification, EditNotification, BulkNotification } from "./pages/notification";
// import { NotificationTemplates } from "./pages/notification"; // Temporarily commented
//Test Component
import TestAPIs from "./components/TestAPIs";
//For Settings...
// import Settings from "./components/settings/Settings";

import AppRoutes from "./components/approutes";
import Auth from "./pages/auth/auth";
import Admin from "./pages/admin/admin";
import Principal from "./pages/principal/principal";
import Teacher from "./pages/teacher/teacher";
import Directors from "./pages/directors/directors";
import InstitutionsAll from "./pages/admin/institutions/institutions";
import AddInstitution from "./pages/admin/institutions/addInstitution";
import EditInstitution from "./pages/admin/institutions/editInstitution";
import ViewInstitution from "./pages/admin/institutions/viewInstitution";
import DirectorsAll from "./pages/admin/institutions/directorsAll";
import AddDirector from "./pages/admin/institutions/addDirector";
import HeadquartersAll from "./pages/admin/institutions/headquartersAll";
import AddHeadquarters from "./pages/admin/institutions/addHeadquarters";
import EditHeadquarters from "./pages/admin/institutions/editHeadquarters";
import InstitutionHeadquartersReport from "./pages/admin/reports/InstitutionHeadquartersReport";
import Attendence from "./pages/teacher/attendance/Attendence";
import Justifications from "./pages/teacher/attendance/Justifications";

//Admin Director Users
import AdminDirectorUserList from "./pages/adminDirector/AdminDirectorUserList";
import AdminDirectorUserCreate from "./pages/adminDirector/AdminDirectorUserCreate";
import AdminDirectorUserEdit from "./pages/adminDirector/AdminDirectorUserEdit";
import AdminDirectorUserView from "./pages/adminDirector/AdminDirectorUserView";
//Director Personal Users
import DirectorPersonalList from "./pages/adminDirector/directorPersonal/DirectorPersonalList";
import DirectorPersonalCreate from "./pages/adminDirector/directorPersonal/DirectorPersonalCreate";
import DirectorPersonalEdit from "./pages/adminDirector/directorPersonal/DirectorPersonalEdit";
import DirectorPersonalView from "./pages/adminDirector/directorPersonal/DirectorPersonalView";
//User Institution Management
import UserInstitutionList from "./pages/adminDirector/userInstitution/UserInstitutionList";
import UserInstitutionCreate from "./pages/adminDirector/userInstitution/UserInstitutionCreate";
import UserInstitutionEdit from "./pages/adminDirector/userInstitution/UserInstitutionEdit";
import UserInstitutionView from "./pages/adminDirector/userInstitution/UserInstitutionView";

//Accounts
const Approuter = () => {
  // eslint-disable-next-line no-unused-vars
  // const config = "/react/template"
  return (
    <>
      <BrowserRouter basename="/school">
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/principal" element={<Principal />} />
          <Route path="/teacher" element={<Teacher />} />
          <Route path="/directors/*" element={<Directors />} />


          <Route key="attendances" path="/attendances" element={<Attendence />} />
          <Route key="Justifications" path="/justifications" element={<Justifications />} />

          <Route path="/institution" element={<InstitutionsAll />} />
          <Route path="/add-institution" element={<AddInstitution />} />
          <Route path="/edit-institution/:id" element={<EditInstitution />} />
          <Route path="/institution/:id" element={<ViewInstitution />} />
          <Route path="/institution-directors/:id" element={<DirectorsAll />} />
          <Route path="/add-director/:id" element={<AddDirector />} />
          <Route path="/institution-headquarters/:id" element={<HeadquartersAll />} />
          <Route path="/add-headquarter/:id" element={<AddHeadquarters />} />
          <Route path="/edit-headquarter/:id" element={<EditHeadquarters />} />

          {/* Admin Director Users Routes */}
          <Route path="/admin-director/users" element={<AdminDirectorUserList />} />
          <Route path="/admin-director/users/create" element={<AdminDirectorUserCreate />} />
          <Route path="/admin-director/users/:keycloakId/view" element={<AdminDirectorUserView />} />
          <Route path="/admin-director/users/:keycloakId/edit" element={<AdminDirectorUserEdit />} />

          {/* Director Personal Users Routes */}
          <Route path="/admin-director/director-personal" element={<DirectorPersonalList />} />
          <Route path="/admin-director/director-personal/create" element={<DirectorPersonalCreate />} />
          <Route path="/admin-director/director-personal/:keycloakId/view" element={<DirectorPersonalView />} />
          <Route path="/admin-director/director-personal/:keycloakId/edit" element={<DirectorPersonalEdit />} />

          {/* User Institution Management Routes */}
          <Route path="/admin-director/user-institution" element={<UserInstitutionList />} />
          <Route path="/admin-director/user-institution/create" element={<UserInstitutionCreate />} />
          <Route path="/admin-director/user-institution/view/:userId" element={<UserInstitutionView />} />
          <Route path="/admin-director/user-institution/edit/:userId" element={<UserInstitutionEdit />} />



          {/* Reports Routes */}
          <Route path="/reports/institutions-headquarters" element={<InstitutionHeadquartersReport />} />

          {/* Student Routes */}
          <Route path="/students" element={<StudentList />} />
          <Route path="/studentlist" element={<StudentList />} />
          <Route path="/students/add" element={<AddStudent />} />
          <Route path="/add-student" element={<AddStudent />} />
          <Route path="/students/edit/:id" element={<EditStudent />} />
          <Route path="/editstudent/:id" element={<EditStudent />} />
          <Route path="/students/view/:id" element={<StudentProfile />} />
          <Route path="/studentprofile/:id" element={<StudentProfile />} />
          <Route path="/students/statistics" element={<EnrollmentStats />} />
          <Route path="/students/enrollment-stats" element={<EnrollmentStats />} />
          <Route path="/students/not-enrolled" element={<NotEnrolledStudents />} />
          <Route path="/students/bulk-upload" element={<BulkUploadStudents />} />

          {/* Enrollment Routes */}
          <Route path="/enrollments" element={<EnrollmentList />} />
          <Route path="/enrollmentlist" element={<EnrollmentList />} />
          <Route path="/enrollments/add" element={<AddEnrollment />} />
          <Route path="/add-enrollment" element={<AddEnrollment />} />
          <Route path="/enrollments/edit/:id" element={<EditEnrollment />} />
          <Route path="/editenrollment/:id" element={<EditEnrollment />} />
          <Route path="/enrollments/bulk-upload" element={<BulkUploadEnrollments />} />

          {/* Grade Routes */}
          <Route path="/grade" element={<GradeList />} />
          <Route path="/grade/add" element={<AddGrade />} />
          <Route path="/grade/edit/:id" element={<EditGrade />} />

          {/* Notification Routes */}
          <Route path="/notifications" element={<NotificationList />} />
          <Route path="/notifications/add" element={<AddNotification />} />
          <Route path="/notifications/edit/:id" element={<EditNotification />} />
          <Route path="/notifications/bulk" element={<BulkNotification />} />
          {/* <Route path="/notifications/templates" element={<NotificationTemplates />} /> */} {/* Temporarily commented */}

          {/* Test Route - Development Only */}
          <Route path="/test-students-api" element={<TestAPIs />} />
          <Route path="/test-apis" element={<TestAPIs />} />

          {AppRoutes.map((route) => route)}
        </Routes>
      </BrowserRouter>
      <div className="sidebar-overlay"></div>
    </>
  );
};

export default Approuter;
