export interface Student {
  id: string;
  name: string;
  surname: string;
  class: string;
  age: number;
  grades: Grade[];
}

export interface Grade {
  id: string;
  studentId: string;
  subject: string;
  score: number;
  date: string;
}

export interface Class {
  name: string;
  studentCount: number;
  averageGrade: number;
  grade: string;
}

export interface SubjectStats {
  subject: string;
  average: number;
  highest: number;
  lowest: number;
  className: string;
}

export interface Prediction {
  studentId: string;
  studentName: string;
  currentAverage: number;
  predictedSuccess: 'shkelqyeshem' | 'i-mire' | 'mesatar' | 'dobet';
  recommendation: string;
  trend: 'up' | 'stable' | 'down';
  manualPrediction?: 'shkelqyeshem' | 'i-mire' | 'mesatar' | 'dobet' | null;
}

export const SUBJECTS = ['Matematikë', 'Gjuhë Shqipe', 'Anglisht', 'Shkenca', 'Histori', 'Gjeografi'];

export function generateClasses(): string[] {
  const classes: string[] = [];
  for (let grade = 10; grade <= 12; grade++) {
    for (let parallel = 1; parallel <= 6; parallel++) {
      classes.push(`${grade}/${parallel}`);
    }
  }
  return classes;
}

export const CLASSES = generateClasses();

export const GRADES = [10, 11, 12];

export const SCORE_LABELS: Record<number, string> = {
  5: 'Shkëlqyeshëm',
  4: 'Shumë Mirë',
  3: 'Mirë',
  2: 'Kënaqshëm',
  1: 'Mospasqyruar'
};
