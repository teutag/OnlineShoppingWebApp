import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trash2, Plus, X, Edit2, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { SCORE_LABELS, SUBJECTS, CLASSES } from '../types';
import './Students.css';

export default function Students() {
  const { students, addStudent, updateStudent, deleteStudent, updateGrade, deleteGrade, addGrade, selectedStudent, selectStudent } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [editingGrade, setEditingGrade] = useState<{ studentId: string; gradeId: string } | null>(null);
  const [formData, setFormData] = useState({ name: '', surname: '', class: '10/1', age: 15 });
  const [editFormData, setEditFormData] = useState({ name: '', surname: '', class: '', age: 15 });
  const [showGradeForm, setShowGradeForm] = useState(false);
  const [gradeFormData, setGradeFormData] = useState({ subject: SUBJECTS[0], score: 5 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addStudent(formData);
    setFormData({ name: '', surname: '', class: '10/1', age: 15 });
    setShowForm(false);
  };

  const handleAddGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudent) {
      addGrade({ studentId: selectedStudent.id, ...gradeFormData, date: new Date().toISOString() });
      setGradeFormData({ subject: SUBJECTS[0], score: 5 });
      setShowGradeForm(false);
    }
  };

  const startEditStudent = (student: typeof students[0]) => {
    setEditingStudent(student.id);
    setEditFormData({ name: student.name, surname: student.surname, class: student.class, age: student.age });
  };

  const saveEditStudent = (id: string) => {
    updateStudent(id, editFormData);
    setEditingStudent(null);
  };

  const getAverage = (grades: { score: number }[]) => {
    if (grades.length === 0) return 0;
    return Math.round((grades.reduce((sum, g) => sum + g.score, 0) / grades.length) * 10) / 10;
  };

  const getGradeColor = (score: number) => {
    if (score >= 4.5) return '#10b981';
    if (score >= 3.5) return '#3b82f6';
    if (score >= 2.5) return '#f59e0b';
    return '#ef4444';
  };

  const getGradeClass = (score: number) => {
    if (score >= 3.5) return 'badge-green';
    if (score >= 2.5) return 'badge-yellow';
    return 'badge-red';
  };

  const chartData = selectedStudent 
    ? selectedStudent.grades.map(g => ({ name: g.subject, nota: g.score }))
    : [];

  return (
    <div className="students-page">
      <div className="students-header">
        <h1>👥 Nxënësit</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={20} /> Shto Nxënës
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Shto Nxënës të Ri</h2>
              <button onClick={() => setShowForm(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Emri" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              <input type="text" placeholder="Mbiemri" value={formData.surname} onChange={e => setFormData({ ...formData, surname: e.target.value })} required />
              <select value={formData.class} onChange={e => setFormData({ ...formData, class: e.target.value })}>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" placeholder="Mosha" min="14" max="20" value={formData.age} onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) })} required />
              <button type="submit" className="btn-primary">Shto</button>
            </form>
          </div>
        </div>
      )}

      <div className="students-content">
        <div className="students-list">
          {students.map(student => (
            <div key={student.id} className={`student-card ${selectedStudent?.id === student.id ? 'selected' : ''}`} onClick={() => selectStudent(student.id)}>
              <div className="student-info">
                {editingStudent === student.id ? (
                  <div className="edit-row">
                    <input className="edit-input" value={editFormData.name} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} />
                    <input className="edit-input" value={editFormData.surname} onChange={e => setEditFormData({ ...editFormData, surname: e.target.value })} />
                    <button className="btn-save" onClick={(e) => { e.stopPropagation(); saveEditStudent(student.id); }}><Check size={16} /></button>
                  </div>
                ) : (
                  <>
                    <span className="student-name">{student.name} {student.surname}</span>
                    <span className="student-class">Klasa {student.class} • {student.age} vjeç</span>
                  </>
                )}
              </div>
              <div className="student-grade">
                <span style={{ color: getGradeColor(getAverage(student.grades)) }}>{getAverage(student.grades)}</span>
              </div>
              <div className="student-actions">
                <button className="btn-edit" onClick={e => { e.stopPropagation(); startEditStudent(student); }}><Edit2 size={16} /></button>
                <button className="btn-delete" onClick={e => { e.stopPropagation(); deleteStudent(student.id); }}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>

        {selectedStudent && (
          <div className="student-detail">
            <h2>{selectedStudent.name} {selectedStudent.surname}</h2>
            <p className="class-info">Klasa {selectedStudent.class} • {selectedStudent.age} vjeç • Mesatarja: <strong style={{ color: getGradeColor(getAverage(selectedStudent.grades)) }}>{getAverage(selectedStudent.grades)}</strong></p>
            
            <div className="detail-chart">
              <h3>📊 Notat e Nxënësit</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                  <Tooltip />
                  <Bar dataKey="nota" fill="#667eea" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grades-section">
              <div className="grades-header">
                <h3>📋 Notat</h3>
                <button className="btn-small" onClick={() => setShowGradeForm(!showGradeForm)}>
                  <Plus size={16} /> Shto Notë
                </button>
              </div>
              
              {showGradeForm && (
                <form className="grade-form" onSubmit={handleAddGrade}>
                  <select value={gradeFormData.subject} onChange={e => setGradeFormData({ ...gradeFormData, subject: e.target.value })}>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={gradeFormData.score} onChange={e => setGradeFormData({ ...gradeFormData, score: parseInt(e.target.value) })}>
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} - {SCORE_LABELS[n]}</option>)}
                  </select>
                  <button type="submit" className="btn-primary btn-small">Shto</button>
                </form>
              )}

              <table className="grades-table">
                <thead>
                  <tr><th>Lënda</th><th>Nota</th><th>Status</th><th>Veprime</th></tr>
                </thead>
                <tbody>
                  {selectedStudent.grades.map(grade => (
                    <tr key={grade.id}>
                      <td>{grade.subject}</td>
                      <td>
                        {editingGrade?.gradeId === grade.id ? (
                          <select 
                            value={grade.score} 
                            onChange={e => updateGrade(selectedStudent.id, grade.id, parseInt(e.target.value))}
                            onBlur={() => setEditingGrade(null)}
                            autoFocus
                          >
                            {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        ) : (
                          <strong 
                            style={{ color: getGradeColor(grade.score), cursor: 'pointer' }}
                            onClick={() => setEditingGrade({ studentId: selectedStudent.id, gradeId: grade.id })}
                          >
                            {grade.score}
                          </strong>
                        )}
                      </td>
                      <td><span className={getGradeClass(grade.score)}>{SCORE_LABELS[grade.score]}</span></td>
                      <td>
                        <button className="btn-icon" onClick={() => setEditingGrade({ studentId: selectedStudent.id, gradeId: grade.id })}><Edit2 size={14} /></button>
                        <button className="btn-icon btn-delete-icon" onClick={() => deleteGrade(selectedStudent.id, grade.id)}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
