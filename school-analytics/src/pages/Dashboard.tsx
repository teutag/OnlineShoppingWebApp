import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Award, TrendingUp, TrendingDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getOverallStats, getClasses, getSubjectStats, getPredictionDistribution } from '../services/data';
import { GRADES, SUBJECTS } from '../types';
import './Dashboard.css';

export default function Dashboard() {
  const { students } = useApp();
  const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
  const [selectedClass, setSelectedClass] = useState<string | 'all'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>(SUBJECTS[0]);

  const filteredStudents = useMemo(() => {
    if (selectedGrade === 'all' && selectedClass === 'all') return students;
    return students.filter(s => {
      const parts = s.class.split('/');
      const studentGrade = parseInt(parts[0]);
      if (selectedGrade !== 'all' && studentGrade !== selectedGrade) return false;
      if (selectedClass !== 'all' && s.class !== selectedClass) return false;
      return true;
    });
  }, [students, selectedGrade, selectedClass]);

  const availableClasses = useMemo(() => {
    const classes = new Set<string>();
    students.forEach(s => {
      const parts = s.class.split('/');
      const studentGrade = parseInt(parts[0]);
      if (selectedGrade === 'all' || studentGrade === selectedGrade) {
        classes.add(s.class);
      }
    });
    return Array.from(classes).sort((a, b) => {
      const [gradeA, paralA] = a.split('/').map(Number);
      const [gradeB, paralB] = b.split('/').map(Number);
      return gradeA !== gradeB ? gradeA - gradeB : paralA - paralB;
    });
  }, [students, selectedGrade]);

  const stats = getOverallStats(filteredStudents);
  const classData = getClasses(filteredStudents, selectedGrade === 'all' ? undefined : selectedGrade);
  const subjectData = getSubjectStats(filteredStudents, selectedClass === 'all' ? undefined : selectedClass);
  const predictionData = getPredictionDistribution(filteredStudents, selectedClass === 'all' ? undefined : selectedClass);

  const subjectStats = useMemo(() => {
    const subjectGrades = filteredStudents.flatMap(s => 
      s.grades.filter(g => g.subject === selectedSubject).map(g => ({
        studentName: `${s.name} ${s.surname}`,
        class: s.class,
        score: g.score
      }))
    );
    
    if (subjectGrades.length === 0) return { highest: null, lowest: null };
    
    const highest = subjectGrades.reduce((max, g) => g.score > max.score ? g : max, subjectGrades[0]);
    const lowest = subjectGrades.reduce((min, g) => g.score < min.score ? g : min, subjectGrades[0]);
    
    return { highest, lowest };
  }, [filteredStudents, selectedSubject]);

  const topStudents = useMemo(() => {
    return [...filteredStudents]
      .map(s => ({
        name: `${s.name} ${s.surname}`,
        class: s.class,
        average: s.grades.length > 0 
          ? Math.round((s.grades.reduce((sum, g) => sum + g.score, 0) / s.grades.length) * 10) / 10
          : 0
      }))
      .filter(s => s.average > 0)
      .sort((a, b) => b.average - a.average)
      .slice(0, 5);
  }, [filteredStudents]);

  return (
    <div className="dashboard">
      <h1>📊 Dashboard</h1>
      
      <div className="filters-bar">
        <div className="filter-group">
          <label>Klasa:</label>
          <select value={selectedGrade} onChange={(e) => {
            setSelectedGrade(e.target.value === 'all' ? 'all' : parseInt(e.target.value));
            setSelectedClass('all');
          }}>
            <option value="all">Të Gjitha</option>
            {GRADES.map(g => (
              <option key={g} value={g}>Klasa {g}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Paralelja:</label>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="all">Të Gjitha</option>
            {availableClasses.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Users size={28} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.totalStudents}</span>
            <span className="stat-label">Nxënësit</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon purple">
            <Award size={28} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.average}</span>
            <span className="stat-label">Mesatarja</span>
          </div>
        </div>
        
        <div className="stat-card grade-stat">
          <div className="stat-icon green">
            <TrendingUp size={28} />
          </div>
          <div className="stat-info">
            <select 
              className="subject-select"
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="grade-info">
              {subjectStats.highest ? (
                <div className="highest-grade">
                  <span className="grade-value">{subjectStats.highest.score}</span>
                  <span className="grade-student">{subjectStats.highest.studentName}</span>
                </div>
              ) : (
                <span className="no-data">-</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="stat-card grade-stat">
          <div className="stat-icon red">
            <TrendingDown size={28} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Nota më e ulët</span>
            <div className="grade-info">
              {subjectStats.lowest ? (
                <div className="lowest-grade">
                  <span className="grade-value">{subjectStats.lowest.score}</span>
                  <span className="grade-student">{subjectStats.lowest.studentName}</span>
                </div>
              ) : (
                <span className="no-data">-</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>📈 Nota Mesatare sipas Paraleleve</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={classData}>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
              <Tooltip />
              <Bar dataKey="averageGrade" fill="#667eea" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>📚 Nota Mesatare sipas Lëndëve</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={subjectData} layout="vertical">
              <XAxis type="number" domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
              <YAxis type="category" dataKey="subject" width={100} />
              <Tooltip />
              <Bar dataKey="average" fill="#764ba2" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>🎯 Shpërndarja e Notave</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={predictionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {predictionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="legend">
            {predictionData.map((item, index) => (
              <div key={index} className="legend-item">
                <span className="legend-color" style={{ background: item.color }}></span>
                {item.name}: {item.value}
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>🏆 Top 5 Nxënësit</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topStudents} layout="vertical">
              <XAxis type="number" domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip />
              <Bar dataKey="average" fill="#10b981" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
