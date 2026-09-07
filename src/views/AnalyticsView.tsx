import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  GraduationCap,
  TrendingUp,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const metrics = [
  {
    label: "Total Challenges Reported",
    value: "1,245",
    detail: "+12.4% from last month",
    icon: AlertTriangle,
    iconClass: "bg-indigo-100 text-indigo-700",
  },
  {
    label: "Active University Projects",
    value: "42",
    detail: "+5 projects this quarter",
    icon: GraduationCap,
    iconClass: "bg-sky-100 text-sky-700",
  },
  {
    label: "Resolved Issues",
    value: "890",
    detail: "113 resolved this month",
    icon: CheckCircle2,
    iconClass: "bg-emerald-100 text-emerald-700",
  },
  {
    label: "Resolution Rate",
    value: "71%",
    detail: "+4.8% from last quarter",
    icon: TrendingUp,
    iconClass: "bg-amber-100 text-amber-700",
  },
];

const domainBreakdown = [
  { domain: "Water Resources", issues: 286 },
  { domain: "Healthcare", issues: 238 },
  { domain: "Infrastructure", issues: 412 },
  { domain: "Education", issues: 309 },
];

const districtHotspots = [
  { district: "Ranchi", activeIssues: 186, severity: "High" },
  { district: "Dhanbad", activeIssues: 142, severity: "Medium" },
  { district: "Koderma", activeIssues: 98, severity: "Low" },
  { district: "Jamshedpur", activeIssues: 84, severity: "Medium" },
  { district: "Hazaribagh", activeIssues: 61, severity: "Low" },
] as const;

const severityStyles = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-emerald-100 text-emerald-700",
};

export default function AnalyticsView() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:py-10 lg:px-8">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Government analytics
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Civic impact overview
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Track community needs, institutional response, and resolution progress across the state.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground">
          <Activity className="size-3.5 text-primary" aria-hidden />
          Updated today at 09:42
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, detail, icon: Icon, iconClass }) => (
          <article key={label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <p className="max-w-[12rem] text-sm font-medium leading-5 text-muted-foreground">
                {label}
              </p>
              <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${iconClass}`}>
                <Icon className="size-5" strokeWidth={1.8} aria-hidden />
              </span>
            </div>
            <p className="mt-6 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
            <p className="mt-2 text-xs font-medium text-emerald-700">{detail}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Domain breakdown
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                Reported issues by domain
              </h2>
            </div>
            <CircleDot className="size-5 text-primary" strokeWidth={1.8} aria-hidden />
          </div>
          <div className="mt-6 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={domainBreakdown} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
                <CartesianGrid stroke="hsl(220 13% 91%)" vertical={false} />
                <XAxis
                  dataKey="domain"
                  tick={{ fill: "hsl(220 9% 46%)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={55}
                />
                <YAxis
                  tick={{ fill: "hsl(220 9% 46%)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "hsl(226 100% 97%)" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid hsl(220 13% 91%)",
                    boxShadow: "0 8px 24px rgb(15 23 42 / 0.08)",
                  }}
                />
                <Bar
                  dataKey="issues"
                  name="Issues"
                  fill="#4F46E5"
                  radius={[6, 6, 0, 0]}
                  barSize={42}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                District distribution
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                Problem hotspots
              </h2>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              5 districts
            </span>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[360px] border-collapse text-left">
              <caption className="sr-only">Active issue hotspots by district and severity</caption>
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  <th scope="col" className="pb-3 font-semibold">
                    District
                  </th>
                  <th scope="col" className="pb-3 text-right font-semibold">
                    Active issues
                  </th>
                  <th scope="col" className="pb-3 text-right font-semibold">
                    Severity
                  </th>
                </tr>
              </thead>
              <tbody>
                {districtHotspots.map(({ district, activeIssues, severity }) => (
                  <tr key={district} className="border-b border-border last:border-0">
                    <th scope="row" className="py-4 text-sm font-semibold text-foreground">
                      {district}
                    </th>
                    <td className="py-4 text-right text-sm font-medium text-foreground">
                      {activeIssues}
                    </td>
                    <td className="py-4 text-right">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${severityStyles[severity]}`}
                      >
                        {severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
}