'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface EditAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  ad: any;
  onSave: (id: string, campaignId: string, adGroupId: string, adId: string) => Promise<void>;
  loading: boolean;
}

export default function EditAdModal({ isOpen, onClose, ad, onSave, loading }: EditAdModalProps) {
  const [campaignId, setCampaignId] = useState('');
  const [adGroupId, setAdGroupId] = useState('');
  const [adId, setAdId] = useState('');

  useEffect(() => {
    if (ad) {
      setCampaignId(ad.campaign_id || '');
      setAdGroupId(ad.ad_group_id || '');
      setAdId(ad.ad_id || '');
    }
  }, [ad]);

  const handleSave = async () => {
    await onSave(ad.id, campaignId, adGroupId, adId);
  };

  const brandName = ad?.brands?.company_name || ad?.brands?.profiles?.full_name || 'N/A';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit YouTube Ad IDs</DialogTitle>
          <DialogDescription>
            Update Google Ads IDs for {brandName}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="campaignId" className="text-right">
              Campaign ID
            </Label>
            <Input
              id="campaignId"
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className="col-span-3"
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="adGroupId" className="text-right">
              Ad Group ID
            </Label>
            <Input
              id="adGroupId"
              value={adGroupId}
              onChange={(e) => setAdGroupId(e.target.value)}
              className="col-span-3"
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="adId" className="text-right">
              Ad ID
            </Label>
            <Input
              id="adId"
              value={adId}
              onChange={(e) => setAdId(e.target.value)}
              className="col-span-3"
              disabled={loading}
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
