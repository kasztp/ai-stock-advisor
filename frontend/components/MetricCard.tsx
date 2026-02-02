
import React from 'react';
import { Metric } from '../types';

interface MetricCardProps {
  title: string;
  metric: Metric;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, metric, color }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-full flex flex-col">
      <h4 className="font-bold text-gray-300">{title}</h4>
      <p className={`text-3xl font-bold ${color}`}>{metric.value}</p>
      <p className={`text-sm font-semibold ${color} mb-2`}>{metric.rating}</p>
      <p className="text-gray-400 text-sm mt-auto">{metric.commentary}</p>
    </div>
  );
};

export default MetricCard;
