import { useState } from 'react';
import { SimulationBanner } from '../components/shared';
import { Settings as SettingsIcon, Bell, Shield, Database, Wifi, Globe, Save, ToggleLeft, ToggleRight } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    smsAlerts: true,
    emailAlerts: true,
    soundAlerts: true,
    autoAcknowledge: false,
    gpsPollingInterval: '5',
    alertThreshold: 'critical',
    dataRetention: '90',
    apiEndpoint: 'https://api.mdrrmo-puv.gov.ph/v1',
    simulationMode: true,
  });

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button onClick={onChange} className="flex items-center">
      {checked ? <ToggleRight className="w-8 h-8 text-accent" /> : <ToggleLeft className="w-8 h-8 text-text-muted" />}
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      <SimulationBanner />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="mb-6">
          <h1 className="text-lg font-bold text-text-primary">Settings</h1>
          <p className="text-xs text-text-muted mt-0.5">Configure system preferences, notification rules, and integration endpoints</p>
        </div>

        <div className="space-y-5 max-w-3xl">
          {/* Notifications */}
          <section className="bg-surface-raised border border-border-default rounded-xl p-4">
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-accent" />
              Notification Preferences
            </h2>
            <div className="space-y-3">
              <SettingRow label="SMS Alerts" description="Send SMS notifications for critical incidents" value={settings.smsAlerts} onChange={() => setSettings(s => ({ ...s, smsAlerts: !s.smsAlerts }))} />
              <SettingRow label="Email Alerts" description="Send email notifications for all incidents" value={settings.emailAlerts} onChange={() => setSettings(s => ({ ...s, emailAlerts: !s.emailAlerts }))} />
              <SettingRow label="Sound Alerts" description="Play audio alert for critical emergencies" value={settings.soundAlerts} onChange={() => setSettings(s => ({ ...s, soundAlerts: !s.soundAlerts }))} />
              <SettingRow label="Auto-Acknowledge" description="Automatically acknowledge alerts after 5 minutes" value={settings.autoAcknowledge} onChange={() => setSettings(s => ({ ...s, autoAcknowledge: !s.autoAcknowledge }))} />
            </div>
          </section>

          {/* System */}
          <section className="bg-surface-raised border border-border-default rounded-xl p-4">
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-4">
              <SettingsIcon className="w-4 h-4 text-accent" />
              System Configuration
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-primary">GPS Polling Interval</p>
                  <p className="text-xs text-text-muted">How often to request location updates from devices</p>
                </div>
                <select value={settings.gpsPollingInterval} onChange={(e) => setSettings(s => ({ ...s, gpsPollingInterval: e.target.value }))} className="bg-navy-800 border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent">
                  <option value="1">1 second</option>
                  <option value="5">5 seconds</option>
                  <option value="10">10 seconds</option>
                  <option value="30">30 seconds</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-primary">Alert Priority Threshold</p>
                  <p className="text-xs text-text-muted">Minimum priority level for dashboard notifications</p>
                </div>
                <select value={settings.alertThreshold} onChange={(e) => setSettings(s => ({ ...s, alertThreshold: e.target.value }))} className="bg-navy-800 border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent">
                  <option value="critical">Critical only</option>
                  <option value="high">High and above</option>
                  <option value="medium">Medium and above</option>
                  <option value="low">All alerts</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-primary">Data Retention</p>
                  <p className="text-xs text-text-muted">How long to keep incident records</p>
                </div>
                <select value={settings.dataRetention} onChange={(e) => setSettings(s => ({ ...s, dataRetention: e.target.value }))} className="bg-navy-800 border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent">
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365">1 year</option>
                </select>
              </div>
            </div>
          </section>

          {/* Integration */}
          <section className="bg-surface-raised border border-border-default rounded-xl p-4">
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4 text-accent" />
              API Integration
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-text-muted mb-1 block">Backend API Endpoint</label>
                <input type="text" value={settings.apiEndpoint} onChange={(e) => setSettings(s => ({ ...s, apiEndpoint: e.target.value }))} className="w-full bg-navy-800 border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary font-mono focus:outline-none focus:border-accent" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-primary">Simulation Mode</p>
                  <p className="text-xs text-text-muted">Use simulated data instead of live hardware</p>
                </div>
                <Toggle checked={settings.simulationMode} onChange={() => setSettings(s => ({ ...s, simulationMode: !s.simulationMode }))} />
              </div>
            </div>
          </section>

          {/* Save */}
          <div className="flex justify-end">
            <button className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors">
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ label, description, value, onChange }: { label: string; description: string; value: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-sm text-text-primary">{label}</p>
        <p className="text-xs text-text-muted">{description}</p>
      </div>
      <button onClick={onChange} className="flex items-center">
        {value ? <ToggleRight className="w-8 h-8 text-accent" /> : <ToggleLeft className="w-8 h-8 text-text-muted" />}
      </button>
    </div>
  );
}
