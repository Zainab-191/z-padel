import { useEffect, useState } from "react";
import { createCourt, deleteCourt, getCourts, setPricingTiers, updateCourt } from "../api/courts";
import { extractApiError } from "../api/client";
import CourtForm from "../components/CourtForm";
import PricingTiersEditor from "../components/PricingTiersEditor";
import ConfirmDialog from "../components/ConfirmDialog";
import { formatOMR, formatTime } from "../utils/format";
import { useLanguage } from "../i18n/LanguageContext";

export default function CourtsPage() {
  const { t, language } = useLanguage();
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  function load() {
    setLoading(true);
    getCourts()
      .then(setCourts)
      .catch((err) => setError(extractApiError(err).message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreate(dto) {
    setSavingId("new");
    try {
      await createCourt(dto);
      setCreating(false);
      load();
    } catch (err) {
      setError(extractApiError(err).message);
    } finally {
      setSavingId(null);
    }
  }

  async function handleUpdate(id, dto) {
    setSavingId(id);
    try {
      await updateCourt(id, dto);
      setEditingId(null);
      load();
    } catch (err) {
      setError(extractApiError(err).message);
    } finally {
      setSavingId(null);
    }
  }

  async function handleSaveTiers(id, tiers) {
    setSavingId(`${id}-tiers`);
    try {
      await setPricingTiers(id, tiers);
      load();
    } catch (err) {
      setError(extractApiError(err).message);
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete() {
    try {
      await deleteCourt(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setDeleteError(extractApiError(err).message);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-court-900">{t("courts.title")}</h1>
        <button
          onClick={() => setCreating((c) => !c)}
          className="rounded-full bg-court-600 px-4 py-2 text-sm font-bold text-white hover:bg-court-700"
        >
          {creating ? t("courts.closeForm") : t("courts.addCourt")}
        </button>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      {creating && (
        <div className="mb-6">
          <CourtForm onSubmit={handleCreate} onCancel={() => setCreating(false)} submitting={savingId === "new"} />
        </div>
      )}

      {loading ? (
        <p className="text-gray-400">{t("common.loading")}</p>
      ) : (
        <div className="space-y-4">
          {courts.map((court) => (
            <div key={court.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              {editingId === court.id ? (
                <CourtForm
                  initial={{
                    name: court.name,
                    description: court.description,
                    openingTime: court.openingTime.slice(0, 5),
                    closingTime: court.closingTime.slice(0, 5),
                    basePricePerHour: court.basePricePerHour,
                    isActive: court.isActive,
                  }}
                  onSubmit={(dto) => handleUpdate(court.id, dto)}
                  onCancel={() => setEditingId(null)}
                  submitting={savingId === court.id}
                />
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-court-900">{court.name}</h2>
                        {!court.isActive && (
                          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
                            {t("courts.disabled")}
                          </span>
                        )}
                      </div>
                      {court.description && <p className="text-sm text-gray-500">{court.description}</p>}
                      <p className="mt-1 text-sm text-gray-600">
                        {formatTime(court.openingTime, language)} - {formatTime(court.closingTime, language)} ·{" "}
                        {formatOMR(court.basePricePerHour, language)}/{t("courts.perHour")}
                      </p>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <button onClick={() => setEditingId(court.id)} className="text-court-700 underline">
                        {t("common.edit")}
                      </button>
                      <button
                        onClick={() => {
                          setDeleteError(null);
                          setDeleteTarget(court);
                        }}
                        className="text-red-600 underline"
                      >
                        {t("common.delete")}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-dashed border-gray-200 pt-3">
                    <p className="mb-2 text-xs font-semibold text-gray-500">{t("courts.tiersTitle")}</p>
                    <PricingTiersEditor
                      tiers={court.pricingTiers}
                      saving={savingId === `${court.id}-tiers`}
                      onSave={(tiers) => handleSaveTiers(court.id, tiers)}
                    />
                  </div>
                </>
              )}
            </div>
          ))}
          {courts.length === 0 && <p className="text-gray-400">{t("courts.noCourtsYet")}</p>}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t("courts.deleteTitle")}
        message={deleteError || t("courts.deleteMessage", { name: deleteTarget?.name })}
        confirmLabel={t("common.delete")}
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
