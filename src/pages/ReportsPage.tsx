import { useState } from 'react';
import { SimulationBanner } from '../components/shared';
import { incidentsByTypeData, incidentsByVehicleType, dailyIncidentsData, alertDeliveryTimeData } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { Download, Calendar, BarChart3, TrendingUp, PieChartIcon, Clock } from 'lucide-react';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('7d');

  return (
    <div className="flex flex-col h-full">
      <SimulationBanner />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-text-primary">Reports & Analytics</h1>
            <p className="text-xs text-text-muted mt-0.5">Vehicle accident trends, driver threat incidents, response metrics, and system performance data</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="bg-navy-800 border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-navy-800 border border-border-subtle rounded-lg text-xs text-text-secondary hover:text-text-primary transition-colors">
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Total Incidents" value="37" change="+12%" icon={BarChart3} />
          <MetricCard label="Avg Response Time" value="4m 32s" change="-8%" icon={Clock} />
          <MetricCard label="False Alarm Rate" value="14.2%" change="-3%" icon={TrendingUp} />
          <MetricCard label="Device Availability" value="94.5%" change="+2%" icon={PieChartIcon} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Daily Incidents */}
          <div className="bg-surface-raised border border-border-default rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Daily Incident Count</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyIncidentsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1a2236', border: '1px solid #2a3654', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="incidents" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Incidents" />
                <Bar dataKey="resolved" fill="#10b981" radius={[4, 4, 0, 0]} name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Incidents by Type */}
          <div className="bg-surface-raised border border-border-default rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Incidents by Type</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={incidentsByTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="count" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {incidentsByTypeData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a2236', border: '1px solid #2a3654', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Alert Delivery Time */}
          <div className="bg-surface-raised border border-border-default rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Average Alert Delivery Time (ms)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={alertDeliveryTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} domain={[800, 1600]} />
                <Tooltip contentStyle={{ background: '#1a2236', border: '1px solid #2a3654', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="avgMs" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} name="Avg Delivery (ms)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* By Vehicle Type */}
          <div className="bg-surface-raised border border-border-default rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Incidents by Vehicle Type</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={incidentsByVehicleType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#64748b', fontSize: 11 }} width={80} />
                <Tooltip contentStyle={{ background: '#1a2236', border: '1px solid #2a3654', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Count">
                  {incidentsByVehicleType.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data note */}
        <div className="bg-amber-900/10 border border-amber-800/30 rounded-lg p-3 flex items-center gap-2">
          <span className="text-amber-400 text-xs">⚠</span>
          <p className="text-xs text-amber-300/80">All analytics data shown is simulated for demonstration purposes. Connect to a real backend database for production analytics.</p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, change, icon: Icon }: { label: string; value: string; change: string; icon: any }) {
  const isPositive = change.startsWith('+');
  return (
    <div className="bg-surface-raised border border-border-default rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-4 h-4 text-text-muted" />
        <span className={`text-[11px] font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>{change}</span>
      </div>
      <p className="text-xl font-bold text-text-primary">{value}</p>
      <p className="text-[11px] text-text-muted mt-0.5">{label}</p>
    </div>
  );
}
