import { useState, useEffect, useMemo } from 'react';
import { articleAPI } from '../api/index.js';

const WEEKS = 52;
const DAYS = 7;
const DAY_LABELS = ['', '周一', '', '周三', '', '周五', ''];

const ContributionHeatmap = () => {
  const [heatmap, setHeatmap] = useState({});
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await articleAPI.getHeatmap();
        setHeatmap(data || {});
      } catch { /* ignore */ }
    };
    fetch();
  }, []);

  const { grid, monthLabels } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 找到最近的周日
    const start = new Date(today);
    start.setDate(start.getDate() - ((WEEKS * 7) + today.getDay()));

    const cells = [];
    const labels = [];
    let lastMonth = -1;

    for (let w = 0; w < WEEKS; w++) {
      const week = [];
      for (let d = 0; d < DAYS; d++) {
        const date = new Date(start);
        date.setDate(date.getDate() + (w * 7) + d);
        const dateStr = date.toISOString().slice(0, 10);
        const count = heatmap[dateStr] || 0;
        const isFuture = date > today;

        // 月份标签
        if (date.getMonth() !== lastMonth && d === 0) {
          lastMonth = date.getMonth();
          labels.push({ month: date.toLocaleString('zh-CN', { month: 'short' }), col: w });
        }

        week.push({ dateStr, count, isFuture, month: date.getMonth() });
      }
      cells.push(week);
    }

    return { grid: cells, monthLabels: labels };
  }, [heatmap]);

  const getColor = (count, isFuture) => {
    if (isFuture) return 'var(--heatmap-empty, rgba(0,0,0,0.04))';
    if (count === 0) return 'var(--heatmap-0, rgba(0,0,0,0.06))';
    if (count === 1) return 'var(--heatmap-1, rgba(160,216,239,0.4))';
    if (count === 2) return 'var(--heatmap-2, rgba(160,216,239,0.6))';
    if (count <= 4) return 'var(--heatmap-3, rgba(160,216,239,0.8))';
    return 'var(--heatmap-4, rgba(160,216,239,1))';
  };

  const total = Object.values(heatmap).reduce((s, v) => s + v, 0);

  return (
    <div className="heatmap-container">
      <div className="heatmap-title">
        <span>{total}</span> 篇文章
      </div>
      <div className="heatmap-scroll">
        <div className="heatmap-months">
          {monthLabels.map((m, i) => (
            <span key={i} style={{ left: `${m.col * 16}px` }}>{m.month}</span>
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
        <div className="heatmap-days">
          {DAY_LABELS.map((label, i) => (
            <span key={i} className="heatmap-day-label">{label}</span>
          ))}
        </div>
      </div>
      {tooltip && (
        <div className="heatmap-tooltip">
          {tooltip.dateStr}：{tooltip.isFuture ? '-' : tooltip.count} 篇文章
        </div>
      )}
    </div>
  );
};

export default ContributionHeatmap;
