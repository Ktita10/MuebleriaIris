/**
 * OrdenStatsCards Component
 * Displays statistics cards for order counts and total sales
 */
import React, { memo } from 'react';
import { formatPrice } from '../../../lib/formatters';
import { STAT_CARDS_CONFIG, ICONS, type EstadoOrden } from './constants';
import type { OrdenStats } from '../../../hooks/useOrdenes';

// =============================================================================
// Types
// =============================================================================

interface OrdenStatsCardsProps {
  stats: OrdenStats;
}

interface StatCardProps {
  label: string;
  value: string | number;
  bgColor: string;
  iconColor: string;
  iconPath: string;
}

// =============================================================================
// Subcomponents (Memoized)
// =============================================================================

const StatCard = memo(function StatCard({
  label,
  value,
  bgColor,
  iconColor,
  iconPath,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}>
          <svg 
            className={`w-5 h-5 ${iconColor}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            dangerouslySetInnerHTML={{ __html: iconPath }}
          />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
});

// =============================================================================
// Main Component
// =============================================================================

export const OrdenStatsCards = memo(function OrdenStatsCards({ stats }: OrdenStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {STAT_CARDS_CONFIG.map((config) => {
        const value = config.isTotal
          ? formatPrice(stats.totalVentas)
          : stats[config.estado as EstadoOrden];

        return (
          <StatCard
            key={config.estado}
            label={config.label}
            value={value}
            bgColor={config.bgColor}
            iconColor={config.iconColor}
            iconPath={ICONS[config.icon]}
          />
        );
      })}
    </div>
  );
});
