import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function StatCard({ title, value, change, trend, bgColor, iconColor }) {
  return (
    <Card className="border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className={`text-xs flex items-center gap-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {change}
            </p>
          </div>
          <div className={`${bgColor} p-3 rounded-full`}>
            <div className={`w-6 h-6 ${iconColor}`}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
