import React from 'react';

const StatCard = ({ icon, label, value, subtext, color = 'amber' }) => {
  const getBadgeStyle = () => {
    switch (color) {
      case 'emerald':
        return { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399' };
      case 'rose':
        return { bg: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' };
      case 'sky':
        return { bg: 'rgba(56, 189, 248, 0.15)', color: '#7dd3fc' };
      case 'purple':
        return { bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' };
      default:
        return { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' };
    }
  };

  const style = getBadgeStyle();

  return (
    <div className="stat-card">
      <div
        className="stat-icon-wrapper"
        style={{ background: style.bg, color: style.color }}
      >
        {icon}
      </div>
      <div className="stat-info">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
        {subtext && <span className="stat-sub">{subtext}</span>}
      </div>
    </div>
  );
};

export default StatCard;
