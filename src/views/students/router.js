import StudentForm from './StudentForm';
import StudentView from './StudentView';
import StudentShow from "@/views/students/StudentShow";

export const studentsRoutes = [
    {
        name: 'Students',
        path: '/students',
        component: StudentView
    },
    {
        name: 'StudentDetails',
        path: '/student-details',
        component: StudentShow
    },
    {
        name: 'NewStudent',
        path: '/student',
        component: StudentForm
    },
];

export const studentsRouter = studentsRoutes.filter(function (x) {
    return x !== null;
})