import { useState, useEffect, useMemo } from 'react';
import { articleAPI } from '../api/index.js';

const WEEKS = 52;
const DAYS = 7;
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

const ContributionHeatmap = () => {
  const [heatmap, setHeatmap] = useState({});
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await articleAPI.getHeatmap();
        console.log('[Heatmap] API response:', data);
        setHeatmap(data || {});
      } catch (err) {
        console.error('[Heatmap] Failed to fetch:', err);
      }
    };
    fetch();
  }, []);

  const { grid, monthLabels } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(today);
    start.setDate(start.getDate() - ((WEEKS * 7) + today.getDay()));

    const cells = [];
    const labels = [];
    let lastMonth = -1;
    let lastLabelCol = -10;

    for (let w = 0; w < WEEKS; w++) {
      const week = [];
      for (let d = 0; d < DAYS; d++) {
        const date = new Date(start);
        date.setDate(date.getDate() + (w * 7) + d);
        const dateStr = date.toISOString().slice(0, 10);
        const count = heatmap[dateStr] || 0;
        const isFuture = date > today;

        if (date.getMonth() !== lastMonth && d === 0 && w - lastLabelCol >= 4) {
          lastMonth = date.getMonth();
          lastLabelCol = w;
          labels.push({ month: date.toLocaleString('en', { month: 'short' }), col: w });
        }

        week.push({ dateStr, count, isFuture });
      }
      cells.push(week);
    }

    return { grid: cells, monthLabels: labels };
  }, [heatmap]);

  const getColor = (count, isFuture) => {
    if (isFuture) return 'rgba(0,0,0,0.04)';
    if (count === 0) return 'var(--heatmap-empty)';
    if (count === 1) return 'rgba(160,216,239,0.55)';
    if (count === 2) return 'rgba(160,216,239,0.7)';
    if (count <= 4) return 'rgba(160,216,239,0.85)';
    return 'rgba(160,216,239,1)';
  };

  const total = Object.values(heatmap).reduce((s, v) => s + v, 0);

  return (
    <div className="heatmap-container">
      <div className="heatmap-header">
        <span className="heatmap-total">{total}</span> articles in the last year
      </div>
      {total === 0 && (
        <div className="heatmap-empty-hint">No articles yet — publish one to start tracking!</div>
      )}
      <div className="heatmap-wrapper">
        <div className="heatmap-months">
          {monthLabels.map((m, i) => (
            <span key={i} style={{ left: `${m.col * 14}px` }}>{m.month}</span>
          ))}
        </div>
        <div className="heatmap-body">
          <div className="heatmap-days">
            {DAY_LABELS.map((label, i) => (
              <span key={i} className="heatmap-day-label">{label}</span>
            ))}
          </div>
          <div className="heatmap-grid">
            {grid.map((week, wi) => (
              <div key={wi} className="heatmap-col">
                {week.map((cell, di) => (
                  <div
                    key={di}
                    className="heatmap-cell"
                    style={{ backgroundColor: getColor(cell.count, cell.isFuture) }}
                    onMouseEnter={() => setTooltip(cell)}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      {tooltip && (
        <div className="heatmap-tooltip">
          {tooltip.dateStr} — {tooltip.isFuture ? '-' : tooltip.count} articles
        </div>
      )}
    </div>
  );
};

export default ContributionHeatmap;
