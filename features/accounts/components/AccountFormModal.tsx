"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
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
  createAccountAction,
  updateAccountAction,
  deleteAccountAction,
} from "@/features/accounts/actions";
import type { Account, AccountType } from "@/features/accounts/types";

const CURRENCIES = ["USD", "EUR", "ARS", "BRL", "COP", "CLP"];

interface AccountFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editAccount?: Account | null;
  accountTypes: AccountType[];
}

interface FormState {
  name: string;
  typeCode: string;
  currency: string;
  initialBalance: string;
  notes: string;
}

const DEFAULT_FORM: FormState = {
  name: "",
  typeCode: "",
  currency: "USD",
  initialBalance: "0",
  notes: "",
};

export function AccountFormModal({
  open,
  onClose,
  onSuccess,
  editAccount,
  accountTypes,
}: AccountFormModalProps) {
  const t = useTranslations("accounts.form");
  const locale = useLocale();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (open) {
      setError("");
      setConfirmDelete(false);
      if (editAccount) {
        setForm({
          name: editAccount.name,
          typeCode: editAccount.typeCode,
          currency: editAccount.currency,
          initialBalance: String(editAccount.initialBalance),
          notes: editAccount.notes ?? "",
        });
      } else {
        setForm(DEFAULT_FORM);
      }
    }
  }, [open, editAccount]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.typeCode || !form.currency) {
      setError(t("errorRequired"));
      return;
    }
    setSaving(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      typeCode: form.typeCode,
      currency: form.currency,
      initialBalance: parseFloat(form.initialBalance) || 0,
      notes: form.notes,
    };

    const result = editAccount
      ? await updateAccountAction(editAccount.id, payload)
      : await createAccountAction(payload);

    setSaving(false);
    if (result.error) {
      setError(result.error);
    } else {
      onSuccess();
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!editAccount) return;
    setSaving(true);
    const result = await deleteAccountAction(editAccount.id);
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
            {editAccount ? t("titleEdit") : t("titleCreate")}
          </DialogTitle>
        </DialogHeader>

        {confirmDelete ? (
          <div className="flex flex-col gap-4 py-2">
            <p className="text-sm font-medium">{t("deleteConfirmTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("deleteConfirmBody")}</p>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)} disabled={saving}>
                {t("deleteCancel")}
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={saving}>
                {saving ? t("saving") : t("deleteConfirm")}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 py-2">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">{t("name")} *</Label>
                <Input
                  className="h-8 text-sm"
                  placeholder={t("namePlaceholder")}
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>

              {/* Type + Currency */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">{t("type")} *</Label>
                  <Select value={form.typeCode} onValueChange={(v) => set("typeCode", v)}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder={t("selectType")} />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypes.map((at) => (
                        <SelectItem key={at.code} value={at.code}>
                          {locale === "es" ? at.nameEs : at.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">{t("currency")} *</Label>
                  <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Initial balance */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">{t("initialBalance")}</Label>
                <Input
                  type="number"
                  step="0.01"
                  className="h-8 text-sm"
                  placeholder="0.00"
                  value={form.initialBalance}
                  onChange={(e) => set("initialBalance", e.target.value)}
                />
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">{t("notes")}</Label>
                <Input
                  className="h-8 text-sm"
                  placeholder={t("notesPlaceholder")}
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                />
              </div>

              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
              {editAccount && (
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
              <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
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
