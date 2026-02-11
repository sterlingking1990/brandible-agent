'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EditBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: any; // Using 'any' for now, can be more specific with Brand type
  onSave: (updatedBrand: any) => Promise<void>;
  loading: boolean;
}

export default function EditBrandModal({ isOpen, onClose, brand, onSave, loading }: EditBrandModalProps) {
  const [isAgency, setIsAgency] = useState(false);
  const [agencyStatus, setAgencyStatus] = useState<string>('');
  const [salesHandler, setSalesHandler] = useState<string>('');
  const [businessPhoneNumber, setBusinessPhoneNumber] = useState<string>('');

  useEffect(() => {
    if (brand) {
      setIsAgency(brand.brands?.isAgency || false);
      setAgencyStatus(brand.brands?.agency_status || '');
      setSalesHandler(brand.brands?.sales_handler || '');
      setBusinessPhoneNumber(brand.brands?.business_phone_number || '');
    }
  }, [brand]);

  // Set default agencyStatus to 'live' when isAgency is toggled on and no status is set
  useEffect(() => {
    if (isAgency && (agencyStatus === null || agencyStatus === '')) {
      setAgencyStatus('live');
    }
  }, [isAgency, agencyStatus]);

  const handleSave = async () => {
    const updatedBrandData = {
      profile_id: brand.id, // profile_id for the brands table is the user id
      isAgency,
      agency_status: isAgency && agencyStatus !== '' ? agencyStatus : null,
      sales_handler: isAgency ? salesHandler : null,
      business_phone_number: isAgency && salesHandler ? salesHandler : businessPhoneNumber,
    };
    await onSave(updatedBrandData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Brand: {brand?.brands?.company_name}</DialogTitle>
          <DialogDescription>
            Make changes to brand agency details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between space-x-2 p-4 rounded-lg border-2 bg-slate-50">
            <Label htmlFor="isAgency" className="cursor-pointer font-medium text-base">
              Is Agency
            </Label>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${!isAgency ? 'text-slate-900' : 'text-slate-400'}`}>
                No
              </span>
              <Switch
                id="isAgency"
                checked={isAgency}
                onCheckedChange={setIsAgency}
                disabled={loading}
                className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-300"
              />
              <span className={`text-sm font-medium ${isAgency ? 'text-slate-900' : 'text-slate-400'}`}>
                Yes
              </span>
            </div>
          </div>

          {isAgency && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="agencyStatus" className="text-right">
                  Agency Status
                </Label>
                <Select
                  value={agencyStatus}
                  onValueChange={(value) => setAgencyStatus(value)}
                  disabled={loading}
                >
                  <SelectTrigger className="col-span-3" id="agencyStatus">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="salesHandler" className="text-right">
                  Sales Handler Phone
                </Label>
                <Input
                  id="salesHandler"
                  value={salesHandler}
                  onChange={(e) => setSalesHandler(e.target.value)}
                  className="col-span-3"
                  type="tel"
                  placeholder="+1234567890"
                  disabled={loading}
                />
              </div>
            </>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="businessPhone" className="text-right">
              Business Phone Number
            </Label>
            <Input
              id="businessPhone"
              value={businessPhoneNumber}
              onChange={(e) => setBusinessPhoneNumber(e.target.value)}
              className="col-span-3"
              type="tel"
              placeholder="+1234567890"
              disabled={loading || (isAgency && salesHandler !== '')} // Disable if sales handler is used
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}