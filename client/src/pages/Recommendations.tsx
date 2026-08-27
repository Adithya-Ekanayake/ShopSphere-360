import { useCallback, useEffect, useState } from "react";
import { RefreshCw, ClipboardCheck, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useFilters } from "../context/FilterContext";
import recommendationsService, { type RecommendationQuery } from "../services/recommendationsService";
import RecommendationCard from "../components/RecommendationCard";
import Pagination from "../components/Pagination";
import type { Recommendation, RecommendationStatus } from "../types/recommendation";
import "../styles/dashboard.css";
import "../styles/recommendations.css";

const Recommendations = () => {
  const { filters } = useFilters();
  const { user } = useAuth();
  const canManage = user?.Role === "Admin" || user?.Role === "Manager";
  const [status, setStatus] = useState<RecommendationStatus | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [items, setItems] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { status: dashboardStatus, ...filterQuery } = filters;
      const query: RecommendationQuery = { ...filterQuery, page, limit: 10, search, ...(status ? { status } : { status: dashboardStatus as RecommendationStatus }) };
      const result = await recommendationsService.getRecommendations(query);
      setItems(result.data);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error("Failed to load recommendations:", err);
      setError("Unable to load recommendations.");
    } finally {
      setLoading(false);
    }
  }, [filters, status, page, search]);

  useEffect(() => { load(); }, [load]);

  const sync = async () => {
    setMessage("");
    setError("");
    try {
      const response = await recommendationsService.syncRecommendations(filters);
      setMessage(response.message);
      await load();
    } catch (err) {
      console.error("Failed to sync recommendations:", err);
      setError("Unable to sync recommendations.");
    }
  };

  const updateStatus = async (item: Recommendation, nextStatus: RecommendationStatus) => {
    try {
      await recommendationsService.updateRecommendation(item.RecommendationKey, { status: nextStatus });
      await load();
    } catch (err) {
      console.error("Failed to update status:", err);
      setError("Unable to update recommendation status.");
    }
  };

  const updateAssignee = async (item: Recommendation, value: string) => {
    if (!value) return;
    try {
      await recommendationsService.updateRecommendation(item.RecommendationKey, { assignedToUserKey: Number(value) });
      await load();
    } catch (err) {
      console.error("Failed to update assignee:", err);
      setError("Unable to update recommendation assignee.");
    }
  };

  return <>
    <header className="topbar"><div className="page-title"><p className="breadcrumb">WORK QUEUE</p><h1>Recommendations</h1></div><div className="topbar-actions">{canManage ? <button className="admin-btn admin-btn-primary" onClick={sync}><RefreshCw size={15} /> Sync insights</button> : null}</div></header>
    <section className="recommendations-toolbar panel"><div><span className="panel-kicker">TRACKABLE ACTIONS</span><p>Persisted recommendations from explainable business insights.</p></div><label>Status<select value={status} onChange={(event) => setStatus(event.target.value as RecommendationStatus | "")}><option value="">All statuses</option><option value="New">New</option><option value="InProgress">In Progress</option><option value="Done">Done</option><option value="Dismissed">Dismissed</option></select></label></section>
    {message ? <div className="recommendations-message">{message}</div> : null}
    {error ? <div className="recommendations-error">{error}</div> : null}
    <div className="recommendations-search"><Search size={16} /><input value={search} placeholder="Search recommendations..." onChange={(event) => { setPage(1); setSearch(event.target.value); }} /></div>
    {loading ? <div className="panel recommendation-empty">Loading recommendations...</div> : null}
    {!loading && !items.length ? <div className="panel recommendation-empty"><ClipboardCheck size={30} /><h2>{search || status ? "No recommendations match these filters" : "No recommendations synced"}</h2><p>{search || status ? "Try adjusting your search or status filter." : canManage ? "Sync the current insights to create a trackable work queue." : "No recommendations are currently available."}</p></div> : null}
    {!loading && items.length ? <div className="recommendation-list">{items.map((item) => <RecommendationCard key={item.RecommendationKey} recommendation={item} canManage={!!canManage} onStatusChange={(next) => updateStatus(item, next)} onAssigneeChange={(value) => updateAssignee(item, value)} />)}</div> : null}
    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
  </>;
};

export default Recommendations;
