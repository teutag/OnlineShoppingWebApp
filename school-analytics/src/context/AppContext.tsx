import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Student, Grade } from '../types';
import { loadStudents, saveStudents, getStudentById, loadManualPredictions, saveManualPredictions } from '../services/data';
import type { Prediction } from '../types';

interface AppContextType {
  students: Student[];
  addStudent: (student: Omit<Student, 'id' | 'grades'>) => void;
  updateStudent: (id: string, updates: Partial<Omit<Student, 'id' | 'grades'>>) => void;
  deleteStudent: (id: string) => void;
  addGrade: (grade: Omit<Grade, 'id'>) => void;
  updateGrade: (studentId: string, gradeId: string, newScore: number) => void;
  deleteGrade: (studentId: string, gradeId: string) => void;
  updatePrediction: (studentId: string, prediction: Prediction['predictedSuccess'] | null) => void;
  selectedStudent: Student | null;
  selectStudent: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(() => loadStudents());
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [manualPredictions, setManualPredictions] = useState<Record<string, Prediction['predictedSuccess']>>(() => loadManualPredictions());

  useEffect(() => {
    saveStudents(students);
  }, [students]);

  useEffect(() => {
    saveManualPredictions(manualPredictions);
  }, [manualPredictions]);

  const addStudent = (student: Omit<Student, 'id' | 'grades'>) => {
    const newStudent: Student = {
      ...student,
      id: Math.random().toString(36).substr(2, 9),
      grades: []
    };
    setStudents(prev => [...prev, newStudent]);
  };

  const updateStudent = (id: string, updates: Partial<Omit<Student, 'id' | 'grades'>>) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, ...updates };
      }
      return s;
    }));
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    setManualPredictions(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    if (selectedStudentId === id) {
      setSelectedStudentId(null);
    }
  };

  const addGrade = (grade: Omit<Grade, 'id'>) => {
    const newGrade: Grade = { ...grade, id: Math.random().toString(36).substr(2, 9) };
    setStudents(prev => prev.map(s => {
      if (s.id === grade.studentId) {
        return { ...s, grades: [...s.grades, newGrade] };
      }
      return s;
    }));
  };

  const updateGrade = (studentId: string, gradeId: string, newScore: number) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          grades: s.grades.map(g => g.id === gradeId ? { ...g, score: newScore } : g)
        };
      }
      return s;
    }));
  };

  const deleteGrade = (studentId: string, gradeId: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return { ...s, grades: s.grades.filter(g => g.id !== gradeId) };
      }
      return s;
    }));
  };

  const updatePrediction = (studentId: string, prediction: Prediction['predictedSuccess'] | null) => {
    setManualPredictions(prev => {
      const updated = { ...prev };
      if (prediction === null) {
        delete updated[studentId];
      } else {
        updated[studentId] = prediction;
      }
      return updated;
    });
  };

  const selectStudent = (id: string | null) => {
    setSelectedStudentId(id);
  };

  const selectedStudent = selectedStudentId ? (getStudentById(students, selectedStudentId) ?? null) : null;

  return (
    <AppContext.Provider value={{
      students,
      addStudent,
      updateStudent,
      deleteStudent,
      addGrade,
      updateGrade,
      deleteGrade,
      updatePrediction,
      selectedStudent,
      selectStudent
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
