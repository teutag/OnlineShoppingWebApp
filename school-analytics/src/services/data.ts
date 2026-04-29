import type { Student, Grade, Class, SubjectStats, Prediction } from '../types';
import { SUBJECTS, generateClasses } from '../types';

const STORAGE_KEY = 'school_analytics_data';
const PREDICTION_KEY = 'school_analytics_predictions';

const defaultNames = ['Alban', 'Blerina', 'Arben', 'Diana', 'Ermir', 'Fatime', 'Gentian', 'Hana', 'Ilir', 'Jona', 'Kujtim', 'Learta', 'Martini', 'Nora', 'Orion', 'Qefsere', 'Rinor', 'Sara', 'Teuta', 'Urim', 'Vilson', 'Yllka', 'Zeqir', 'Valentina'];
const defaultSurnames = ['Hoxha', 'Kastrati', 'Rexhepi', 'Kryeziu', 'Berisha', 'Rama', 'Thaçi', 'Kurteshi', 'Deda', 'Hajdari', 'Gashi', 'Shala'];

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function randomScore(): number {
  return Math.floor(Math.random() * 5) + 1;
}

function generateDefaultStudents(): Student[] {
  const classes = generateClasses();
  const students: Student[] = [];
  
  for (let i = 0; i < 24; i++) {
    const studentId = generateId();
    const studentGrades: Grade[] = SUBJECTS.map(subject => ({
      id: generateId(),
      studentId,
      subject,
      score: randomScore(),
      date: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString()
    }));

    students.push({
      id: studentId,
      name: defaultNames[i % defaultNames.length],
      surname: defaultSurnames[i % defaultSurnames.length],
      class: classes[Math.floor(Math.random() * classes.length)],
      age: Math.floor(Math.random() * 3) + 15,
      grades: studentGrades
    });
  }
  
  return students;
}

export function loadStudents(): Student[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const students: Student[] = JSON.parse(stored);
      const needsMigration = students.some(s => s.class.includes('-'));
      
      if (needsMigration) {
        const allClasses = generateClasses();
        const migratedStudents = students.map(s => {
          const oldClass = s.class;
          if (oldClass.includes('-')) {
            const [grade] = oldClass.split('-');
            const randomClass = allClasses.filter(c => c.startsWith(`${grade}/`));
            s.class = randomClass[Math.floor(Math.random() * randomClass.length)] || allClasses[0];
          }
          return s;
        });
        saveStudents(migratedStudents);
        return migratedStudents;
      }
      return students;
    } catch {
      return generateDefaultStudents();
    }
  }
  const defaults = generateDefaultStudents();
  saveStudents(defaults);
  return defaults;
}

export function saveStudents(students: Student[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

export function loadManualPredictions(): Record<string, Prediction['predictedSuccess']> {
  const stored = localStorage.getItem(PREDICTION_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return {};
    }
  }
  return {};
}

export function saveManualPredictions(predictions: Record<string, Prediction['predictedSuccess']>): void {
  localStorage.setItem(PREDICTION_KEY, JSON.stringify(predictions));
}

export function getStudentById(students: Student[], id: string): Student | undefined {
  return students.find(s => s.id === id);
}

export function getClasses(students: Student[], grade?: number): Class[] {
  const classMap = new Map<string, { count: number; totalScore: number; gradeCount: number; grade: string }>();
  
  students.forEach(student => {
    const studentGrade = parseInt(student.class.split('/')[0]);
    if (grade && studentGrade !== grade) return;
    
    const existing = classMap.get(student.class) || { count: 0, totalScore: 0, gradeCount: 0, grade: studentGrade.toString() };
    const avgGrade = student.grades.length > 0 
      ? student.grades.reduce((sum, g) => sum + g.score, 0) / student.grades.length
      : 0;
    existing.count++;
    existing.totalScore += avgGrade;
    existing.gradeCount += student.grades.length;
    classMap.set(student.class, existing);
  });

  return Array.from(classMap.entries()).map(([name, data]) => ({
    name,
    grade: data.grade,
    studentCount: data.count,
    averageGrade: data.count > 0 ? Math.round((data.totalScore / data.count) * 10) / 10 : 0
  }));
}

export function getSubjectStats(students: Student[], className?: string): SubjectStats[] {
  return SUBJECTS.map(subject => {
    const filteredStudents = className 
      ? students.filter(s => s.class === className)
      : students;
    const scores = filteredStudents.flatMap(s => s.grades.filter(g => g.subject === subject).map(g => g.score));
    if (scores.length === 0) {
      return { subject, average: 0, highest: 0, lowest: 0, className: className || 'all' };
    }
    return {
      subject,
      average: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
      highest: Math.max(...scores),
      lowest: Math.min(...scores),
      className: className || 'all'
    };
  });
}

export function getPredictionDistribution(students: Student[], className?: string) {
  const filteredStudents = className 
    ? students.filter(s => s.class === className)
    : students;
  
  return [
    { name: 'Shkëlqyeshëm (4.5+)', value: filteredStudents.filter(s => {
      const avg = s.grades.length > 0 ? s.grades.reduce((sum, g) => sum + g.score, 0) / s.grades.length : 0;
      return avg >= 4.5;
    }).length, color: '#10b981' },
    { name: 'Shumë Mirë (3.5+)', value: filteredStudents.filter(s => {
      const avg = s.grades.length > 0 ? s.grades.reduce((sum, g) => sum + g.score, 0) / s.grades.length : 0;
      return avg >= 3.5 && avg < 4.5;
    }).length, color: '#3b82f6' },
    { name: 'Mirë (2.5+)', value: filteredStudents.filter(s => {
      const avg = s.grades.length > 0 ? s.grades.reduce((sum, g) => sum + g.score, 0) / s.grades.length : 0;
      return avg >= 2.5 && avg < 3.5;
    }).length, color: '#f59e0b' },
    { name: 'Dobët (<2.5)', value: filteredStudents.filter(s => {
      const avg = s.grades.length > 0 ? s.grades.reduce((sum, g) => sum + g.score, 0) / s.grades.length : 0;
      return avg < 2.5;
    }).length, color: '#ef4444' },
  ];
}

export function getPredictions(students: Student[]): Prediction[] {
  const manualPredictions = loadManualPredictions();
  
  return students.map(student => {
    const currentAverage = student.grades.length > 0
      ? Math.round((student.grades.reduce((sum, g) => sum + g.score, 0) / student.grades.length) * 10) / 10
      : 0;
    
    let autoPredictedSuccess: 'shkelqyeshem' | 'i-mire' | 'mesatar' | 'dobet';
    let recommendation: string;
    let trend: 'up' | 'stable' | 'down';

    if (currentAverage >= 4.5) {
      autoPredictedSuccess = 'shkelqyeshem';
      recommendation = 'Nxënës shkëlqyeshëm! Vazhdoni me punën e mirë. Shfrytëzoni potencialin tuaj të plotë.';
      trend = 'stable';
    } else if (currentAverage >= 3.5) {
      autoPredictedSuccess = 'i-mire';
      recommendation = 'Nxënës shumë i mirë. Pak përpjekje më shumë për të arritur shkëlqyeshëm.';
      trend = 'up';
    } else if (currentAverage >= 2.5) {
      autoPredictedSuccess = 'mesatar';
      recommendation = 'Duhet përmirësim. Fokusohuni në lëndët me nota më të ulëta.';
      trend = Math.random() > 0.5 ? 'up' : 'stable';
    } else {
      autoPredictedSuccess = 'dobet';
      recommendation = 'Nevojitet ndihmë e madhe. Kontaktoni mësuesit për konsultime shtesë.';
      trend = 'down';
    }

    const manualPred = manualPredictions[student.id];

    return {
      studentId: student.id,
      studentName: `${student.name} ${student.surname}`,
      currentAverage,
      predictedSuccess: manualPred || autoPredictedSuccess,
      recommendation,
      trend,
      manualPrediction: manualPred || null
    };
  });
}

export function getOverallStats(students: Student[]) {
  const allGrades = students.flatMap(s => s.grades.map(g => g.score));
  const average = allGrades.length > 0 
    ? Math.round((allGrades.reduce((a, b) => a + b, 0) / allGrades.length) * 10) / 10
    : 0;
  const highest = allGrades.length > 0 ? Math.max(...allGrades) : 0;
  const lowest = allGrades.length > 0 ? Math.min(...allGrades) : 0;

  return {
    totalStudents: students.length,
    average,
    highest,
    lowest,
    totalGrades: allGrades.length
  };
}
