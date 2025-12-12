/**
 * 360° Health Score Calculator
 *
 * Calculates a property's health score (0-100) based on:
 * - System ages vs expected lifespans (40%)
 * - System conditions (30%)
 * - Overdue maintenance tasks (20%)
 * - Inspection recency (10%)
 */

// Expected system lifespans in years
const SYSTEM_LIFESPANS = {
  'Roof': 25,
  'Roof System': 25,
  'HVAC': 15,
  'HVAC System': 15,
  'Water Heater': 12,
  'Electrical': 40,
  'Electrical System': 40,
  'Electrical Panel': 40,
  'Plumbing': 50,
  'Plumbing System': 50,
  'Foundation': 100,
  'Foundation & Structure': 100,
  'Windows': 25,
  'Furnace': 20,
  'Air Conditioner': 15,
  'Siding': 30,
  'Garage Door': 20,
  'Appliances': 15,
  'Landscaping': 10,
  'Deck/Patio': 20,
  'Fencing': 15,
  'Pool/Spa': 15,
};

// Condition score mapping
const CONDITION_SCORES = {
  'Excellent': 100,
  'Good': 80,
  'Fair': 60,
  'Poor': 40,
  'Critical': 20,
  'Unknown': 50,
};

/**
 * Calculate the 360° Health Score for a property
 *
 * @param {Object} params
 * @param {Object} params.property - Property object with year_built
 * @param {Array} params.systems - Array of system baseline objects
 * @param {Array} params.tasks - Array of maintenance task objects
 * @param {Array} params.inspections - Array of inspection objects
 * @returns {Object} { score, breakdown, recommendations }
 */
export function calculateHealthScore({
  property = null,
  systems = [],
  tasks = [],
  inspections = []
}) {
  // If no property exists, return 0 score with appropriate messaging
  if (!property) {
    return {
      score: 0,
      breakdown: {
        systemAge: { score: 0, weight: 40, contribution: 0 },
        condition: { score: 0, weight: 30, contribution: 0 },
        tasks: { score: 0, weight: 20, contribution: 0 },
        inspections: { score: 0, weight: 10, contribution: 0 }
      },
      recommendations: [{
        priority: 'high',
        action: 'Add your first property',
        impact: 'Start tracking',
        description: 'Add a property to begin tracking its health and building your maintenance history.'
      }],
      metrics: {
        totalSystems: 0,
        overdueTasks: 0,
        criticalTasks: 0,
        totalInspections: 0
      }
    };
  }

  const currentYear = new Date().getFullYear();
  const now = new Date();

  // =========================================
  // COMPONENT 1: System Age Score (40%)
  // =========================================
  let systemAgeScore = 100;
  let systemAgePoints = 0;
  let systemAgeMax = 0;

  if (systems.length > 0) {
    systems.forEach(system => {
      const systemType = system.system_type || system.name || 'Unknown';
      const expectedLifespan = SYSTEM_LIFESPANS[systemType] || 20;

      // Calculate system age
      let systemAge = 0;
      if (system.install_date) {
        systemAge = currentYear - new Date(system.install_date).getFullYear();
      } else if (system.estimated_age) {
        systemAge = system.estimated_age;
      } else if (property.year_built) {
        // Assume original if no install date
        systemAge = currentYear - property.year_built;
      }

      // Calculate remaining life percentage
      const lifeUsedPercent = Math.min((systemAge / expectedLifespan) * 100, 150);

      // Score: 100 if new, decreases as it ages past lifespan
      let ageScore;
      if (lifeUsedPercent <= 50) {
        ageScore = 100; // New or well within lifespan
      } else if (lifeUsedPercent <= 75) {
        ageScore = 90; // Mid-life
      } else if (lifeUsedPercent <= 100) {
        ageScore = 70; // Approaching end of life
      } else if (lifeUsedPercent <= 125) {
        ageScore = 50; // Past expected life
      } else {
        ageScore = 30; // Well past expected life
      }

      systemAgePoints += ageScore;
      systemAgeMax += 100;
    });

    systemAgeScore = systemAgeMax > 0
      ? Math.round((systemAgePoints / systemAgeMax) * 100)
      : 50; // Default if no systems
  } else {
    // No systems documented - penalize but not too harshly
    systemAgeScore = 40;
  }

  // =========================================
  // COMPONENT 2: System Condition Score (30%)
  // =========================================
  let conditionScore = 100;
  let conditionPoints = 0;
  let conditionMax = 0;

  if (systems.length > 0) {
    systems.forEach(system => {
      const condition = system.condition || 'Unknown';
      const score = CONDITION_SCORES[condition] || 50;
      conditionPoints += score;
      conditionMax += 100;
    });

    conditionScore = conditionMax > 0
      ? Math.round((conditionPoints / conditionMax) * 100)
      : 50;
  } else {
    conditionScore = 40; // No systems documented
  }

  // =========================================
  // COMPONENT 3: Maintenance Task Score (20%)
  // =========================================
  let taskScore = 100;

  const overdueTasks = tasks.filter(t => {
    if (t.status === 'Completed') return false;
    if (!t.due_date) return false;
    return new Date(t.due_date) < now;
  });

  const criticalTasks = tasks.filter(t =>
    t.status !== 'Completed' && (t.priority === 'High' || t.priority === 'Critical')
  );

  const pendingTasks = tasks.filter(t =>
    t.status !== 'Completed'
  );

  // Deductions
  const overdueDeduction = Math.min(overdueTasks.length * 10, 40); // Max 40 points off for overdue
  const criticalDeduction = Math.min(criticalTasks.length * 5, 20); // Max 20 points off for critical
  const pendingPenalty = pendingTasks.length > 10 ? 10 : 0; // Penalty if too many pending

  taskScore = Math.max(100 - overdueDeduction - criticalDeduction - pendingPenalty, 20);

  // =========================================
  // COMPONENT 4: Inspection Recency Score (10%)
  // =========================================
  let inspectionScore = 100;

  if (inspections.length > 0) {
    // Find most recent inspection
    const sortedInspections = [...inspections].sort((a, b) =>
      new Date(b.completed_at || b.created_at) - new Date(a.completed_at || a.created_at)
    );
    const lastInspection = sortedInspections[0];
    const lastInspectionDate = new Date(lastInspection.completed_at || lastInspection.created_at);
    const daysSinceInspection = Math.floor((now - lastInspectionDate) / (1000 * 60 * 60 * 24));

    if (daysSinceInspection <= 90) {
      inspectionScore = 100; // Within 3 months
    } else if (daysSinceInspection <= 180) {
      inspectionScore = 80; // Within 6 months
    } else if (daysSinceInspection <= 365) {
      inspectionScore = 60; // Within 1 year
    } else {
      inspectionScore = 40; // Over a year
    }
  } else {
    inspectionScore = 30; // No inspections recorded
  }

  // =========================================
  // CALCULATE FINAL SCORE
  // =========================================
  const weightedScore =
    (systemAgeScore * 0.40) +
    (conditionScore * 0.30) +
    (taskScore * 0.20) +
    (inspectionScore * 0.10);

  const finalScore = Math.round(Math.max(Math.min(weightedScore, 100), 0));

  // =========================================
  // GENERATE RECOMMENDATIONS
  // =========================================
  const recommendations = [];

  if (systems.length === 0) {
    recommendations.push({
      priority: 'high',
      action: 'Document your home systems',
      impact: '+15-25 points',
      description: 'Add your major systems (HVAC, roof, water heater, etc.) to start tracking their health.'
    });
  }

  if (overdueTasks.length > 0) {
    recommendations.push({
      priority: 'high',
      action: `Complete ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`,
      impact: `+${Math.min(overdueTasks.length * 5, 20)} points`,
      description: 'Overdue maintenance increases risk of costly failures.'
    });
  }

  if (inspections.length === 0) {
    recommendations.push({
      priority: 'medium',
      action: 'Complete your first inspection',
      impact: '+5-10 points',
      description: 'Regular inspections catch problems early before they become expensive.'
    });
  }

  const poorSystems = systems.filter(s =>
    s.condition === 'Poor' || s.condition === 'Critical'
  );
  if (poorSystems.length > 0) {
    recommendations.push({
      priority: 'high',
      action: `Address ${poorSystems.length} system${poorSystems.length > 1 ? 's' : ''} in poor condition`,
      impact: `+${Math.min(poorSystems.length * 10, 25)} points`,
      description: 'Systems in poor condition need immediate attention.'
    });
  }

  return {
    score: finalScore,
    breakdown: {
      systemAge: { score: systemAgeScore, weight: 40, contribution: Math.round(systemAgeScore * 0.40) },
      condition: { score: conditionScore, weight: 30, contribution: Math.round(conditionScore * 0.30) },
      tasks: { score: taskScore, weight: 20, contribution: Math.round(taskScore * 0.20) },
      inspections: { score: inspectionScore, weight: 10, contribution: Math.round(inspectionScore * 0.10) }
    },
    recommendations,
    metrics: {
      totalSystems: systems.length,
      overdueTasks: overdueTasks.length,
      criticalTasks: criticalTasks.length,
      totalInspections: inspections.length
    }
  };
}

/**
 * Get the certification level based on score
 */
export function getCertification(score) {
  if (score >= 96) return { level: 'Platinum', stars: '👑', color: 'purple', text: 'Top 1%' };
  if (score >= 90) return { level: 'Gold', stars: '⭐⭐⭐', color: 'yellow', text: 'Top 5%' };
  if (score >= 85) return { level: 'Silver', stars: '⭐⭐', color: 'gray', text: 'Top 15%' };
  if (score >= 75) return { level: 'Bronze', stars: '⭐', color: 'amber', text: 'Top 35%' };
  return { level: 'Not Certified', stars: '', color: 'red', text: 'Below 75' };
}

/**
 * Get score color based on value
 */
export function getScoreColor(score) {
  if (score >= 90) return '#22c55e'; // green
  if (score >= 75) return '#eab308'; // yellow
  if (score >= 60) return '#f97316'; // orange
  return '#ef4444'; // red
}

/**
 * Get score label based on value
 */
export function getScoreLabel(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Needs Attention';
}

export default calculateHealthScore;
