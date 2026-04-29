import { useState } from 'react';
import { CheckCircle, AlertTriangle, Star, Target, Lightbulb, Edit2, Check } from 'lucide-react';
import { getPredictions } from '../services/data';
import { useApp } from '../context/AppContext';
import type { Prediction } from '../types';
import './Prediction.css';

const PREDICTION_OPTIONS: { value: Prediction['predictedSuccess']; label: string; color: string }[] = [
  { value: 'shkelqyeshem', label: 'Shkëlqyeshëm', color: '#10b981' },
  { value: 'i-mire', label: 'Shumë Mirë', color: '#3b82f6' },
  { value: 'mesatar', label: 'Mesatar', color: '#f59e0b' },
  { value: 'dobet', label: 'Dobët', color: '#ef4444' },
];

export default function Prediction() {
  const { students, updatePrediction } = useApp();
  const predictions = getPredictions(students);
  const [editingId, setEditingId] = useState<string | null>(null);

  const excellent = predictions.filter(p => p.predictedSuccess === 'shkelqyeshem');
  const good = predictions.filter(p => p.predictedSuccess === 'i-mire');
  const average = predictions.filter(p => p.predictedSuccess === 'mesatar');
  const needsHelp = predictions.filter(p => p.predictedSuccess === 'dobet');

  const overallProgress = students.length > 0
    ? Math.round((predictions.filter(p => p.predictedSuccess === 'shkelqyeshem' || p.predictedSuccess === 'i-mire').length / students.length) * 100)
    : 0;

  const handlePredictionChange = (studentId: string, prediction: Prediction['predictedSuccess']) => {
    updatePrediction(studentId, prediction);
    setEditingId(null);
  };

  const renderPredictionCard = (p: Prediction) => (
    <div key={p.studentId} className={`prediction-card ${p.predictedSuccess.replace('-', '')}`}>
      <div className="card-header">
        <div className="student-info">
          <span className="student-name">{p.studentName}</span>
          <span className="student-class">Mesatarja: {p.currentAverage}</span>
        </div>
        <div className="average-display">
          {editingId === p.studentId ? (
            <div className="edit-prediction">
              <select 
                defaultValue={p.predictedSuccess}
                onChange={(e) => handlePredictionChange(p.studentId, e.target.value as Prediction['predictedSuccess'])}
                autoFocus
              >
                {PREDICTION_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button className="btn-save-pred" onClick={() => setEditingId(null)}><Check size={14} /></button>
            </div>
          ) : (
            <>
              <span className="average-value" style={{ color: PREDICTION_OPTIONS.find(o => o.value === p.predictedSuccess)?.color }}>
                {PREDICTION_OPTIONS.find(o => o.value === p.predictedSuccess)?.label}
              </span>
              <button className="btn-edit-pred" onClick={() => setEditingId(p.studentId)}>
                <Edit2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>
      <div className={`recommendation-box ${p.predictedSuccess === 'mesatar' ? 'warning' : p.predictedSuccess === 'dobet' ? 'danger' : ''}`}>
        <Lightbulb size={16} />
        <p>{p.recommendation}</p>
      </div>
    </div>
  );

  return (
    <div className="prediction-page">
      <div className="prediction-header">
        <div>
          <h1>🔮 Parashikimi i Suksessit</h1>
          <p className="subtitle">Vendosni manualisht parashikimin për çdo nxënës</p>
        </div>
        <div className="overall-score">
          <div className="score-circle">
            <span className="score-value">{overallProgress}%</span>
            <span className="score-label">Sukses</span>
          </div>
        </div>
      </div>

      <div className="prediction-summary">
        <div className="summary-card excellent">
          <Star size={28} />
          <div>
            <span className="count">{excellent.length}</span>
            <span className="label">Shkëlqyeshëm</span>
          </div>
        </div>
        <div className="summary-card good">
          <CheckCircle size={28} />
          <div>
            <span className="count">{good.length}</span>
            <span className="label">Shumë Mirë</span>
          </div>
        </div>
        <div className="summary-card average">
          <Target size={28} />
          <div>
            <span className="count">{average.length}</span>
            <span className="label">Mesatar</span>
          </div>
        </div>
        <div className="summary-card needs-help">
          <AlertTriangle size={28} />
          <div>
            <span className="count">{needsHelp.length}</span>
            <span className="label">Nevojitet Ndihmë</span>
          </div>
        </div>
      </div>

      <div className="predictions-list">
        {excellent.length > 0 && (
          <div className="prediction-section">
            <h2 className="section-header excellent">
              <Star size={24} />
              Nxënësit Shkëlqyes
            </h2>
            <div className="prediction-cards">
              {excellent.map(renderPredictionCard)}
            </div>
          </div>
        )}

        {good.length > 0 && (
          <div className="prediction-section">
            <h2 className="section-header good">
              <CheckCircle size={24} />
              Nxënësit shumë të mirë
            </h2>
            <div className="prediction-cards">
              {good.map(renderPredictionCard)}
            </div>
          </div>
        )}

        {average.length > 0 && (
          <div className="prediction-section">
            <h2 className="section-header average">
              <Target size={24} />
              Nxënësit Mesatar
            </h2>
            <div className="prediction-cards">
              {average.map(renderPredictionCard)}
            </div>
          </div>
        )}

        {needsHelp.length > 0 && (
          <div className="prediction-section">
            <h2 className="section-header needs-help">
              <AlertTriangle size={24} />
              Nxënësit që kanë nevojë për ndihmë
            </h2>
            <div className="prediction-cards">
              {needsHelp.map(renderPredictionCard)}
            </div>
          </div>
        )}

        {predictions.length === 0 && (
          <div className="empty-state">
            <p>Nuk ka të dhëna për nxënësit. Shtoni nxënës dhe nota.</p>
          </div>
        )}
      </div>
    </div>
  );
}
