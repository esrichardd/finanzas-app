"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/core/components/ui/dialog";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import {
  createTransactionAction,
  updateTransactionAction,
  deleteTransactionAction,
} from "@/features/transactions/actions";
import type { Transaction } from "@/features/dashboard/types";
import type {
  FormAccount,
  FormCategory,
} from "@/features/transactions/lib/queries";

interface TxFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editTx?: Transaction | null;
  formAccounts: FormAccount[];
  formCategories: FormCategory[];
}

interface FormState {
  type: "income" | "expense";
  date: string;
  description: string;
  amount: string;
  currency: string;
  categoryId: string;
  accountId: string;
}

const DEFAULT_FORM: FormState = {
  type: "expense",
  date: new Date().toISOString().split("T")[0],
  description: "",
  amount: "",
  currency: "USD",
  categoryId: "",
  accountId: "",
};

export function TxFormModal({
  open,
  onClose,
  onSuccess,
  editTx,
  formAccounts,
  formCategories,
}: TxFormModalProps) {
  const t = useTranslations("transactions.form");
  const tTypes = useTranslations("transactions.types");
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (open) {
      setError("");
      setConfirmDelete(false);
      if (editTx) {
        setForm({
          type: editTx.type === "income" ? "income" : "expense",
          date: editTx.date,
          description: editTx.description,
          amount: String(Math.abs(editTx.amount)),
          currency: editTx.currency,
          categoryId: editTx.categoryId ?? "",
          accountId: editTx.accountId ?? "",
        });
      } else {
        setForm(DEFAULT_FORM);
      }
    }
  }, [open, editTx]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Filter categories by selected type
  const kindMap = { income: "income", expense: "expense" } as const;
  const visibleCategories = formCategories.filter(
    (c) => c.kind === kindMap[form.type],
  );

  const handleSubmit = async () => {
    if (!form.description || !form.amount || !form.accountId) {
      setError(t("errorRequired"));
      return;
    }
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      setError(t("errorRequired"));
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      type: form.type,
      date: form.date,
      description: form.description,
      amount,
      currency: form.currency,
      categoryId: form.categoryId,
      accountId: form.accountId,
    };

    const result = editTx
      ? await updateTransactionAction(editTx.id, payload)
      : await createTransactionAction(payload);

    setSaving(false);

    if (result.error) {
      setError(result.error);
    } else {
      onSuccess();
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!editTx) return;
    setSaving(true);
    const result = await deleteTransactionAction(editTx.id);
    setSaving(false);
    if (result.error) {
      setError(result.error);
    } else {
      onSuccess();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editTx ? t("titleEdit") : t("titleCreate")}
          </DialogTitle>
        </DialogHeader>

        {confirmDelete ? (
          /* ── Confirm delete view ── */
          <div className="flex flex-col gap-4 py-2">
            <p className="text-sm font-medium">{t("deleteConfirmTitle")}</p>
            <p className="text-sm text-muted-foreground">
              {t("deleteConfirmBody")}
            </p>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDelete(false)}
                disabled={saving}
              >
                {t("deleteCancel")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={saving}
              >
                {saving ? t("saving") : t("deleteConfirm")}
              </Button>
            </div>
          </div>
        ) : (
          /* ── Form view ── */
          <>
            <div className="flex flex-col gap-4 py-2">
              {/* Type */}
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    set("type", "expense");
                    set("categoryId", "");
                  }}
                  className={`py-1.5 text-sm border rounded-md transition-colors ${
                    form.type === "expense"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {tTypes("expense")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    set("type", "income");
                    set("categoryId", "");
                  }}
                  className={`py-1.5 text-sm border rounded-md transition-colors ${
                    form.type === "income"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {tTypes("income")}
                </button>
              </div>

              {/* Date + Amount row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">{t("date")}</Label>
                  <Input
                    type="date"
                    className="h-8 text-sm"
                    value={form.date}
                    onChange={(e) => set("date", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">{t("amount")}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    className="h-8 text-sm"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => set("amount", e.target.value)}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">{t("description")}</Label>
                <Input
                  className="h-8 text-sm"
                  placeholder={t("description")}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </div>

              {/* Currency + Account row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">{t("currency")}</Label>
                  <Select
                    value={form.currency}
                    onValueChange={(v) => set("currency", v)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["USD", "EUR", "ARS", "BRL", "COP", "CLP"].map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">{t("account")} *</Label>
                  <Select
                    value={form.accountId}
                    onValueChange={(v) => set("accountId", v)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder={t("selectAccount")} />
                    </SelectTrigger>
                    <SelectContent>
                      {formAccounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">{t("category")}</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => set("categoryId", v)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder={t("selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {visibleCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
              {editTx && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 mr-auto"
                  onClick={() => setConfirmDelete(true)}
                  disabled={saving}
                >
                  {t("delete")}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={saving}
              >
                {t("cancel")}
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={saving}>
                {saving ? t("saving") : t("save")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
