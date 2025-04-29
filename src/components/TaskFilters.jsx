import React, { memo } from 'react';

const TaskFilters = memo(({
  filter,
  setFilter,
  priorityFilter,
  setPriorityFilter,
  dateFilter,
  setDateFilter,
  timeTrackingFilter,
  setTimeTrackingFilter,
  sortOption,
  setSortOption
}) => {
  return (
    <div className="ecommerce-filters">
      <div className="filters-header">
        <h2>Filter & Sort Tasks</h2>
        <div className="filters-summary">
          <span className="active-filters">
            {filter !== 'all' && <span className="filter-tag">{filter === 'active' ? '🎯 Active' : '✅ Completed'}</span>}
            {priorityFilter !== 'all' && <span className="filter-tag">{priorityFilter === 'high' ? '🔴 High' : priorityFilter === 'medium' ? '🟠 Medium' : '🟢 Low'}</span>}
            {dateFilter !== 'all' && <span className="filter-tag">{dateFilter === 'today' ? '📌 Today' : dateFilter === 'thisWeek' ? '📆 This Week' : '⚠️ Overdue'}</span>}
            {timeTrackingFilter !== 'all' && <span className="filter-tag">{timeTrackingFilter === 'inProgress' ? '▶️ In Progress' : timeTrackingFilter === 'paused' ? '⏸️ Paused' : '🔄 Not Started'}</span>}
          </span>
        </div>
      </div>

      <div className="filters-layout">
        <div className="filter-column">
          <div className="filter-header">
            <span className="filter-icon">🔍</span>
            <h3>Filter Tasks</h3>
          </div>

          <div className="filter-grid">
            <div className="filter-card">
              <div className="filter-card-header">
                <span className="filter-card-icon">📋</span>
                <label htmlFor="status-filter">Status</label>
              </div>
              <select
                id="status-filter"
                className="filter-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">📋 All</option>
                <option value="active">🎯 Active</option>
                <option value="completed">✅ Completed</option>
              </select>
            </div>

            <div className="filter-card">
              <div className="filter-card-header">
                <span className="filter-card-icon">🔝</span>
                <label htmlFor="priority-filter">Priority</label>
              </div>
              <select
                id="priority-filter"
                className="filter-select"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">🔍 All Priorities</option>
                <option value="high">🔴 High</option>
                <option value="medium">🟠 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>

            <div className="filter-card">
              <div className="filter-card-header">
                <span className="filter-card-icon">📅</span>
                <label htmlFor="date-filter">Date</label>
              </div>
              <select
                id="date-filter"
                className="filter-select"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">📅 All Dates</option>
                <option value="today">📌 Today</option>
                <option value="thisWeek">📆 This Week</option>
                <option value="overdue">⚠️ Overdue</option>
              </select>
            </div>

            <div className="filter-card">
              <div className="filter-card-header">
                <span className="filter-card-icon">⏱️</span>
                <label htmlFor="time-tracking-filter">Time Tracking</label>
              </div>
              <select
                id="time-tracking-filter"
                className="filter-select"
                value={timeTrackingFilter}
                onChange={(e) => setTimeTrackingFilter(e.target.value)}
              >
                <option value="all">⏱️ All</option>
                <option value="inProgress">▶️ In Progress</option>
                <option value="paused">⏸️ Paused</option>
                <option value="notStarted">🔄 Not Started</option>
              </select>
            </div>
          </div>
        </div>

        <div className="sort-column">
          <div className="filter-header">
            <span className="filter-icon">🔀</span>
            <h3>Sort Tasks</h3>
          </div>

          <div className="sort-options">
            <div className="sort-card">
              <div className="sort-card-header">
                <span className="sort-card-icon">📊</span>
                <label htmlFor="sort-option">Sort By</label>
              </div>
              <select
                id="sort-option"
                className="filter-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="default">📊 Default</option>
                <option value="priority">🔝 Priority</option>
                <option value="deadline">📅 Deadline</option>
                <option value="newest">🆕 Newest</option>
                <option value="oldest">🔙 Oldest</option>
                <option value="timeSpent">⏱️ Time Spent</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default TaskFilters;
