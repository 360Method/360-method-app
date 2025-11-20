import React from 'react';
import { useDemo } from '../components/shared/DemoContext';
import DashboardHomeowner from './DashboardHomeowner';
import DashboardInvestor from './DashboardInvestor';

export default function Dashboard() {
  const { isInvestor } = useDemo();

  return isInvestor ? <DashboardInvestor /> : <DashboardHomeowner />;
}