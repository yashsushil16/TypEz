import React from 'react';

const skeletons = {
  dashboard: (
    <>
      <div className="skel skel-title" />
      <div className="skel skel-subtitle" />
      <div className="skel-grid">
        <div className="skel skel-stat" />
        <div className="skel skel-stat" />
        <div className="skel skel-stat" />
        <div className="skel skel-stat" />
      </div>
      <div className="skel skel-section-title" style={{ marginTop: 14 }} />
      <div className="skel skel-card" />
    </>
  ),
  commands: (
    <>
      <div className="skel skel-title" />
      <div className="skel skel-subtitle" />
      <div className="skel skel-toolbar" />
      <div className="skel skel-row" />
      <div className="skel skel-row" />
      <div className="skel skel-row" />
      <div className="skel skel-row" />
    </>
  ),
  ai: (
    <>
      <div className="skel skel-title" />
      <div className="skel skel-subtitle" />
      <div className="skel skel-toggle-bar" />
      <div className="skel skel-section-title" />
      <div className="skel skel-field" />
      <div className="skel skel-field" />
      <div className="skel skel-section-title" />
      <div className="skel skel-row" />
      <div className="skel skel-row" />
    </>
  ),
  sync: (
    <>
      <div className="skel skel-title" />
      <div className="skel skel-subtitle" />
      <div className="skel skel-toggle-bar" />
      <div className="skel skel-field" />
      <div className="skel skel-field" />
    </>
  ),
};

export default function SkeletonLoader({ type }) {
  return (
    <div className="skeleton-container">{skeletons[type] || skeletons.dashboard}</div>
  );
}
