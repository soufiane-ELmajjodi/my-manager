import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Client, ClientFormData } from '@/types/client';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => void;
  client?: Client | null;
  mode: 'add' | 'edit';
}

const initialFormData: ClientFormData = {
  clientName: '',
  imei: '',
  gpsNumber: '',
  installationDate: format(new Date(), 'yyyy-MM-dd'),
  durationMonths: 12,
  phoneNumber: '',
};

export function ClientDialog({
  isOpen,
  onClose,
  onSubmit,
  client,
  mode,
}: ClientDialogProps) {
  const [formData, setFormData] = useState<ClientFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof ClientFormData, string>>>({});

  useEffect(() => {
    if (client && mode === 'edit') {
      setFormData({
        clientName: client.clientName,
        imei: client.imei,
        gpsNumber: client.gpsNumber,
        installationDate: client.installationDate,
        durationMonths: client.durationMonths,
        phoneNumber: client.phoneNumber,
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [client, mode, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ClientFormData, string>> = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }

    if (!formData.imei.trim()) {
      newErrors.imei = 'IMEI is required';
    } else if (!/^\d{15}$/.test(formData.imei.replace(/\s/g, ''))) {
      newErrors.imei = 'IMEI must be 15 digits';
    }

    if (!formData.gpsNumber.trim()) {
      newErrors.gpsNumber = 'GPS number is required';
    }

    if (!formData.installationDate) {
      newErrors.installationDate = 'Installation date is required';
    }

    if (formData.durationMonths < 1) {
      newErrors.durationMonths = 'Duration must be at least 1 month';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  const handleChange = (field: keyof ClientFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {mode === 'add' ? 'Add New Client' : 'Edit Client'}
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            {mode === 'add' 
              ? 'Enter the client details below. Expiration date will be calculated automatically.'
              : 'Update the client details. Changes will be reflected immediately.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="clientName" className="text-slate-700 dark:text-slate-300">
              Client Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => handleChange('clientName', e.target.value)}
              placeholder="Enter client name"
              className={cn(
                'transition-colors',
                errors.clientName && 'border-rose-500 focus-visible:ring-rose-500'
              )}
            />
            {errors.clientName && (
              <p className="text-xs text-rose-500">{errors.clientName}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="imei" className="text-slate-700 dark:text-slate-300">
                IMEI <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="imei"
                value={formData.imei}
                onChange={(e) => handleChange('imei', e.target.value.replace(/\D/g, '').slice(0, 15))}
                placeholder="15-digit IMEI"
                className={cn(
                  'font-mono text-sm transition-colors',
                  errors.imei && 'border-rose-500 focus-visible:ring-rose-500'
                )}
              />
              {errors.imei && (
                <p className="text-xs text-rose-500">{errors.imei}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gpsNumber" className="text-slate-700 dark:text-slate-300">
                GPS Number <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="gpsNumber"
                value={formData.gpsNumber}
                onChange={(e) => handleChange('gpsNumber', e.target.value)}
                placeholder="e.g., GPS-2024-001"
                className={cn(
                  'transition-colors',
                  errors.gpsNumber && 'border-rose-500 focus-visible:ring-rose-500'
                )}
              />
              {errors.gpsNumber && (
                <p className="text-xs text-rose-500">{errors.gpsNumber}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="installationDate" className="text-slate-700 dark:text-slate-300">
                Installation Date <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="installationDate"
                  type="date"
                  value={formData.installationDate}
                  onChange={(e) => handleChange('installationDate', e.target.value)}
                  className={cn(
                    'transition-colors',
                    errors.installationDate && 'border-rose-500 focus-visible:ring-rose-500'
                  )}
                />
              </div>
              {errors.installationDate && (
                <p className="text-xs text-rose-500">{errors.installationDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationMonths" className="text-slate-700 dark:text-slate-300">
                Duration (Months) <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="durationMonths"
                type="number"
                min={1}
                max={120}
                value={formData.durationMonths}
                onChange={(e) => handleChange('durationMonths', parseInt(e.target.value) || 1)}
                className={cn(
                  'transition-colors',
                  errors.durationMonths && 'border-rose-500 focus-visible:ring-rose-500'
                )}
              />
              {errors.durationMonths && (
                <p className="text-xs text-rose-500">{errors.durationMonths}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-slate-700 dark:text-slate-300">
              Phone Number <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              placeholder="e.g., +20 100 123 4567"
              className={cn(
                'transition-colors',
                errors.phoneNumber && 'border-rose-500 focus-visible:ring-rose-500'
              )}
            />
            {errors.phoneNumber && (
              <p className="text-xs text-rose-500">{errors.phoneNumber}</p>
            )}
          </div>

          <DialogFooter className="mt-6 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="transition-colors"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all"
            >
              {mode === 'add' ? 'Add Client' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
