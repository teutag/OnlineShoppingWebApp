import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { getSubjectStats, getClasses } from '../services/data';
import { useApp } from '../context/AppContext';
import { SCORE_LABELS } from '../types';
import './Analytics.css';

export default function Analytics() {
  const { students } = useApp();
  const subjectStats = getSubjectStats(students);
  const classData = getClasses(students);

  const radarData = subjectStats.map(s => ({
    subject: s.subject.substring(0, 8),
    average: s.average,
    highest: s.highest
  }));

  const studentComparison = students
    .map(s => ({
      name: `${s.name} ${s.surname}`,
      average: s.grades.length > 0 
        ? Math.round((s.grades.reduce((sum, g) => sum + g.score, 0) / s.grades.length) * 10) / 10
        : 0
    }))
    .filter(s => s.average > 0)
    .sort((a, b) => b.average - a.average)
    .slice(0, 10);

  const getGradeLabel = (score: number) => SCORE_LABELS[score] || '';

  return (
    <div className="analytics-page">
      <h1>📊 Analiza e Detajuar</h1>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>📈 Krahasimi i Klasave</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={classData}>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
              <Tooltip />
              <Bar dataKey="averageGrade" fill="#667eea" name="Mesatarja" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics-card">
          <h3>🎯 Performanca sipas Lëndëve</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 5]} />
              <Radar name="Mesatarja" dataKey="average" stroke="#667eea" fill="#667eea" fillOpacity={0.5} />
              <Radar name="Më e Larta" dataKey="highest" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics-card full-width">
          <h3>🏆 Top 10 Nxënësit sipas Mesatares</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={studentComparison} layout="vertical">
              <XAxis type="number" domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip />
              <Bar dataKey="average" fill="#764ba2" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics-card full-width">
          <h3>📋 Statistikat sipas Lëndëve</h3>
          <table className="stats-table">
            <thead>
              <tr>
                <th>Lënda</th>
                <th>Mesatarja</th>
                <th>Më e Larta</th>
                <th>Më e Ulëta</th>
                <th>Statusi</th>
              </tr>
            </thead>
            <tbody>
              {subjectStats.map(s => (
                <tr key={s.subject}>
                  <td><strong>{s.subject}</strong></td>
                  <td style={{ color: s.average >= 3.5 ? '#10b981' : s.average >= 2.5 ? '#f59e0b' : '#ef4444' }}>
                    <strong>{s.average}</strong>
                  </td>
                  <td style={{ color: '#10b981' }}>{s.highest} ({getGradeLabel(s.highest)})</td>
                  <td style={{ color: '#ef4444' }}>{s.lowest} ({getGradeLabel(s.lowest)})</td>
                  <td>
                    <span className={s.average >= 3.5 ? 'badge-green' : s.average >= 2.5 ? 'badge-yellow' : 'badge-red'}>
                      {s.average >= 3.5 ? 'Mirë' : s.average >= 2.5 ? 'Mesatar' : 'Dobët'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
