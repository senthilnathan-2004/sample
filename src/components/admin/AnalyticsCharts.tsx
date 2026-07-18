"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { Analytics } from "@/lib/analytics";

const BRAND = "#D2388D";
// Single-hue tints for categorical slices (no other hues).
const TINTS = ["#D2388D", "#E888B9", "#B02A75", "#F3CFE4", "#8E1E5B"];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-hairline bg-white p-4 shadow-card">
      <p className="mb-3 font-heading font-bold">{title}</p>
      <div className="h-56 w-full">{children}</div>
    </div>
  );
}

export function AnalyticsCharts({ data }: { data: Analytics }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Revenue (last 14 days)">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.revenueByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ECE4DF" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke={BRAND} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Orders (last 14 days)">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.ordersByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ECE4DF" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="orders" fill={BRAND} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Top products">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.topProducts} layout="vertical" margin={{ left: 20 }}>
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="qty" fill={BRAND} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Sales by category">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data.salesByCategory} dataKey="revenue" nameKey="name" outerRadius={80} label>
              {data.salesByCategory.map((_, i) => (
                <Cell key={i} fill={TINTS[i % TINTS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Payment method">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data.paymentSplit} dataKey="count" nameKey="method" outerRadius={80} label>
              {data.paymentSplit.map((_, i) => (
                <Cell key={i} fill={TINTS[i % TINTS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card title="New vs returning customers">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.newVsReturning}>
            <XAxis dataKey="type" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill={BRAND} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
