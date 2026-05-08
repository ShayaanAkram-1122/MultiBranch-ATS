import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiMapPin, FiSearch, FiUsers, FiClock } from "react-icons/fi";
import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";
import Loader from "../../components/shared/Loader";
import { jobService } from "../../services/job.service";

const BRANCHES = ["All", "Karachi", "Islamabad", "Lahore"];

export default function Jobs() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState("All");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const params = {};
        if (branch !== "All") params.branch = branch;
        const { data } = await jobService.getAll(params);
        const list = data?.jobs || data;
        if (alive) setJobs(Array.isArray(list) ? list : []);
      } catch {
        if (alive) setJobs([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [branch]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((j) => {
      const title = (j.title || "").toLowerCase();
      const dept = (j.department || "").toLowerCase();
      const b = (j.branch?.name || j.branch || "").toLowerCase();
      const company = (j.company || "").toLowerCase();
      const skills = (j.requirements || "").toLowerCase();
      return (
        title.includes(q) ||
        dept.includes(q) ||
        b.includes(q) ||
        company.includes(q) ||
        skills.includes(q)
      );
    });
  }, [jobs, search]);

  const onSearch = (e) => {
    e.preventDefault();
    setJobs((prev) => prev);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <section style={{ padding: "36px 20px 12px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
              Browse Jobs
            </h1>
            <p style={{ color: "var(--text-muted)", marginBottom: 18 }}>
              Live listings from Pakistani companies (PKR ranges). Filter by city or search.
            </p>

            <form
              onSubmit={onSearch}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: 12,
              }}
            >
              <FiSearch style={{ color: "var(--text-muted)" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, company, industry, city, or skills…"
                style={{
                  border: "none",
                  outline: "none",
                  flex: 1,
                  background: "transparent",
                  color: "var(--text-primary)",
                  fontSize: 14,
                }}
              />
              <button className="btn btn-primary" type="submit">
                Search
              </button>
            </form>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
              {BRANCHES.map((b) => (
                <button
                  key={b}
                  className={`btn btn-outline btn-sm${branch === b ? " btn-primary" : ""}`}
                  onClick={() => setBranch(b)}
                  type="button"
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: "10px 20px 40px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            {loading ? (
              <Loader />
            ) : filtered.length === 0 ? (
              <div className="card">
                <div className="card-body" style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
                  No jobs found. Try a different search or branch.
                </div>
              </div>
            ) : (
              <div className="grid grid-3">
                {filtered.map((job) => (
                  <Link to={`/jobs/${job._id}`} className="card" key={job._id} style={{ textDecoration: "none" }}>
                    <div className="card-body">
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            letterSpacing: 0.6,
                          }}
                        >
                          {job.company || job.department || "—"}
                        </div>
                        <span className="badge badge-submitted">{job.type || "Full-time"}</span>
                      </div>

                      <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", marginBottom: 10 }}>
                        {job.title}
                      </h3>

                      <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 10 }}>
                        {job.department}
                        {job.workMode ? ` · ${job.workMode}` : ""}
                        {job.experienceLevel ? ` · ${job.experienceLevel}` : ""}
                      </p>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8, color: "var(--text-secondary)", fontSize: 13 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <FiMapPin /> {job.branch?.name || job.branch || "—"}
                        </span>
                        {job.salaryRange && (
                          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                            PKR {job.salaryRange}
                          </span>
                        )}
                        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <FiUsers /> {job.seatsAvailable ?? job.seats ?? 1} seat(s)
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <FiClock /> {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "New"}
                        </span>
                      </div>

                      <p style={{ marginTop: 12, color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6 }}>
                        {(job.description || "").slice(0, 120)}
                        {(job.description || "").length > 120 ? "…" : ""}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

