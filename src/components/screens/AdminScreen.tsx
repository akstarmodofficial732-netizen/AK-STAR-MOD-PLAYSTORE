import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  PlusCircle, 
  Upload, 
  Trash2, 
  Eye, 
  EyeOff, 
  Edit3, 
  Check, 
  X, 
  FileCode, 
  Image as ImageIcon, 
  HardDrive, 
  Layers, 
  Sparkles, 
  Save, 
  QrCode, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  PackageCheck,
  FileCheck,
  Percent,
  Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { TopHeader } from '../navigation/TopHeader';
import { AppItem, KeyTier, PaymentSetting } from '../../types';
import { 
  uploadApkToFirebaseStorage, 
  uploadImageToFirebaseStorage 
} from '../../services/firebase';
import { uploadScreenshotToImageKit } from '../../services/imagekit';

export const AdminScreen: React.FC = () => {
  const { 
    allAdminApps, 
    saveApp, 
    deleteApp, 
    togglePublishApp, 
    paymentSettings, 
    savePaymentSettings,
    purchases,
    approveOrder,
    rejectOrder,
    goBack,
    setScreen,
    openAppDetails
  } = useApp();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'upload' | 'catalog' | 'payment' | 'orders'>('upload');
  
  // App Form state
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Tools');
  const [version, setVersion] = useState('1.0.0');
  const [size, setSize] = useState('25 MB');
  const [developer, setDeveloper] = useState('AK STAR MOD');
  const [description, setDescription] = useState('');
  const [changelog, setChangelog] = useState('');
  const [apkUrl, setApkUrl] = useState('');
  const [apkStoragePath, setApkStoragePath] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [iconStoragePath, setIconStoragePath] = useState('');
  const [screenshotsText, setScreenshotsText] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [badgeText, setBadgeText] = useState('MOD');
  
  // APK File & Progress state
  const [selectedApkFile, setSelectedApkFile] = useState<File | null>(null);
  const [apkProgress, setApkProgress] = useState<number>(0);
  const [apkTransferred, setApkTransferred] = useState<string>('');
  const [uploadStage, setUploadStage] = useState<string>('');
  const apkInputRef = useRef<HTMLInputElement>(null);

  // Icon upload progress
  const [iconProgress, setIconProgress] = useState<number>(0);

  // Free vs Paid Key Tier option
  const [isFreeApk, setIsFreeApk] = useState(true);
  const [keyPrice, setKeyPrice] = useState(49);
  
  // Upload status
  const [isUploading, setIsUploading] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Payment Form state
  const [upiId, setUpiId] = useState(paymentSettings.upiId || '');
  const [beneficiaryName, setBeneficiaryName] = useState(paymentSettings.beneficiaryName || '');
  const [qrCodeUrl, setQrCodeUrl] = useState(paymentSettings.qrCodeUrl || '');
  const [paymentSavedMsg, setPaymentSavedMsg] = useState(false);

  // Handle direct APK file selection
  const handleApkFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedApkFile(file);
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    setSize(sizeInMb);

    // If app title is empty, infer from file name
    if (!name) {
      const cleanName = file.name
        .replace(/\.apk$/i, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setName(cleanName);
    }
  };

  // Handle icon file selection & upload
  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setIconProgress(10);
    try {
      const res = await uploadImageToFirebaseStorage(file, 'icons', (p) => setIconProgress(p));
      setIconUrl(res.downloadUrl);
      setIconStoragePath(res.storagePath);
      setIconProgress(100);
    } catch (err) {
      console.warn('Fallback upload to ImageKit or ObjectURL:', err);
      try {
        const url = await uploadScreenshotToImageKit(file);
        setIconUrl(url);
      } catch {
        setIconUrl(URL.createObjectURL(file));
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Handle screenshot file selection & upload
  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        try {
          const res = await uploadImageToFirebaseStorage(files[i], 'screenshots');
          urls.push(res.downloadUrl);
        } catch {
          const url = await uploadScreenshotToImageKit(files[i]);
          urls.push(url);
        }
      }
      const existing = screenshotsText ? screenshotsText.split('\n').filter(s => s.trim()) : [];
      setScreenshotsText([...existing, ...urls].join('\n'));
    } catch (err) {
      console.warn('Screenshot upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Populate form for editing
  const startEdit = (app: AppItem) => {
    setEditingAppId(app.id);
    setName(app.name);
    setCategory(app.category);
    setVersion(app.version);
    setSize(app.size);
    setDeveloper(app.developer);
    setDescription(app.description);
    setChangelog(app.changelog || app.whatsNew?.join('\n') || '');
    setApkUrl(app.apkUrl || app.downloadUrl || app.goFileUrl || '');
    setApkStoragePath(app.apkStoragePath || '');
    setIconUrl(app.iconUrl);
    setIconStoragePath(app.iconStoragePath || '');
    setScreenshotsText((app.screenshots || []).join('\n'));
    setIsFeatured(Boolean(app.featured || app.isEditorChoice));
    setIsPublished(Boolean(app.published || app.status === 'approved'));
    setBadgeText(app.badgeText || 'MOD');
    setSelectedApkFile(null);
    setApkProgress(0);
    setUploadStage('');
    
    const freeTier = app.keyTiers?.some(k => k.isFree || k.price === 0);
    setIsFreeApk(Boolean(freeTier));
    const paidTier = app.keyTiers?.find(k => !k.isFree && k.price > 0);
    if (paidTier) {
      setKeyPrice(paidTier.price);
    }
    
    setActiveTab('upload');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingAppId(null);
    setName('');
    setCategory('Tools');
    setVersion('1.0.0');
    setSize('25 MB');
    setDeveloper('AK STAR MOD');
    setDescription('');
    setChangelog('');
    setApkUrl('');
    setApkStoragePath('');
    setSelectedApkFile(null);
    setApkProgress(0);
    setApkTransferred('');
    setUploadStage('');
    setIconUrl('');
    setIconStoragePath('');
    setScreenshotsText('');
    setIsFeatured(false);
    setIsPublished(true);
    setBadgeText('MOD');
    setIsFreeApk(true);
    setKeyPrice(49);
    setFormSuccess(null);
    setFormError(null);
    if (apkInputRef.current) {
      apkInputRef.current.value = '';
    }
  };

  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!name.trim()) {
      setFormError('Application name is required.');
      return;
    }
    if (!description.trim()) {
      setFormError('Application description is required.');
      return;
    }
    if (!selectedApkFile && !apkUrl.trim()) {
      setFormError('Please select an APK file to upload or enter a verified APK download URL.');
      return;
    }

    setIsUploading(true);

    try {
      let finalApkUrl = apkUrl.trim();
      let finalApkStoragePath = apkStoragePath;

      // 1. If an APK file is selected, upload directly to Firebase Storage with progress tracking
      if (selectedApkFile) {
        setUploadStage('Uploading APK file to Firebase Storage...');
        setApkProgress(5);

        const uploadResult = await uploadApkToFirebaseStorage(
          selectedApkFile,
          (progress, bytesTransferred, totalBytes) => {
            setApkProgress(progress);
            if (totalBytes > 0) {
              const transMb = (bytesTransferred / (1024 * 1024)).toFixed(1);
              const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);
              setApkTransferred(`${transMb} MB / ${totalMb} MB`);
            }
          }
        );

        finalApkUrl = uploadResult.downloadUrl;
        finalApkStoragePath = uploadResult.storagePath;
        setApkUrl(finalApkUrl);
        setApkStoragePath(finalApkStoragePath);
        setUploadStage('APK uploaded! Finalizing download URL & metadata...');
      }

      setUploadStage('Saving application document to Cloud Firestore (apps collection)...');

      const screenshots = screenshotsText
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const keyTiers: KeyTier[] = isFreeApk
        ? [
            {
              id: `key-free-${Date.now()}`,
              name: 'Free Access APK',
              type: 'free',
              durationText: 'Lifetime',
              price: 0,
              currency: 'Gold',
              isFree: true,
            },
          ]
        : [
            {
              id: `key-paid-${Date.now()}`,
              name: 'Premium Mod License Key',
              type: 'lifetime',
              durationText: 'Lifetime Access',
              price: Number(keyPrice) || 49,
              currency: 'Gold',
              isFree: false,
              isPopular: true,
            },
          ];

      const appPayload: Partial<AppItem> = {
        name: name.trim(),
        category: category.trim(),
        version: version.trim(),
        size: size.trim(),
        developer: developer.trim(),
        description: description.trim(),
        changelog: changelog.trim(),
        whatsNew: changelog ? changelog.split('\n').filter(l => l.trim().length > 0) : [],
        apkUrl: finalApkUrl,
        apkStoragePath: finalApkStoragePath,
        downloadUrl: finalApkUrl,
        goFileUrl: finalApkUrl,
        iconUrl: iconUrl.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
        iconStoragePath: iconStoragePath,
        screenshots,
        featured: isFeatured,
        isEditorChoice: isFeatured,
        published: isPublished,
        status: isPublished ? 'approved' : 'draft',
        badgeText: badgeText.trim() || (isPublished ? 'MOD' : 'DRAFT'),
        badgeType: isFreeApk ? 'free' : 'premium',
        keyTiers,
      };

      await saveApp(appPayload, editingAppId || undefined);
      setFormSuccess(
        editingAppId 
          ? `Application "${name}" updated successfully in Firestore!` 
          : `Application "${name}" successfully saved with status: 'approved' and published to website!`
      );
      resetForm();
    } catch (err: any) {
      console.error('Error in save app flow:', err);
      setFormError(err?.message || 'Failed to save application to Firebase.');
    } finally {
      setIsUploading(false);
      setUploadStage('');
    }
  };

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PaymentSetting = {
      upiId: upiId.trim(),
      beneficiaryName: beneficiaryName.trim(),
      qrCodeUrl: qrCodeUrl.trim() || `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=upi://pay?pa=${encodeURIComponent(upiId.trim())}%26pn=${encodeURIComponent(beneficiaryName.trim())}%26cu=INR`,
      instructions: paymentSettings.instructions || 'Scan QR Code or pay directly to the UPI ID.',
    };

    await savePaymentSettings(updated);
    setPaymentSavedMsg(true);
    setTimeout(() => setPaymentSavedMsg(false), 3000);
  };

  return (
    <div id="admin-screen" className="min-h-screen bg-[#0A0B0E] pb-24 text-white">
      <TopHeader title="Admin APK Console" showBack={true} onBack={goBack} />

      <main className="max-w-md mx-auto sm:max-w-2xl md:max-w-4xl lg:max-w-5xl px-4 pt-3 space-y-5">
        {/* Admin Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-[#14151D] border border-[#232533]">
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
              activeTab === 'upload'
                ? 'bg-[#F5B014] text-black shadow-md'
                : 'text-[#8C91A0] hover:text-white'
            }`}
          >
            {editingAppId ? 'Edit APK' : 'Upload APK'}
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
              activeTab === 'catalog'
                ? 'bg-[#F5B014] text-black shadow-md'
                : 'text-[#8C91A0] hover:text-white'
            }`}
          >
            Catalog ({allAdminApps.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-[#F5B014] text-black shadow-md'
                : 'text-[#8C91A0] hover:text-white'
            }`}
          >
            Orders ({purchases.length})
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
              activeTab === 'payment'
                ? 'bg-[#F5B014] text-black shadow-md'
                : 'text-[#8C91A0] hover:text-white'
            }`}
          >
            UPI Settings
          </button>
        </div>

        {/* ================= TAB 1: UPLOAD / PUBLISH APK FORM ================= */}
        {activeTab === 'upload' && (
          <form onSubmit={handleSaveApp} className="space-y-4">
            <div className="p-5 rounded-3xl bg-[#14151D] border border-[#232533] space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#232533] pb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-4 bg-[#F5B014] rounded-full" />
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                    {editingAppId ? 'Edit Application Details' : 'Upload & Publish Real APK'}
                  </h3>
                </div>
                {editingAppId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs text-[#F5B014] hover:underline"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              {formSuccess && (
                <div className="p-3.5 rounded-xl bg-[#10B981]/20 border border-[#10B981]/40 text-[#34D399] text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {formError && (
                <div className="p-3.5 rounded-xl bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#F87171] text-xs font-semibold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* APK FILE UPLOAD (FIREBASE STORAGE DIRECT) */}
              <div className="p-4 rounded-2xl bg-[#181A26] border border-[#2C2F44] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold text-[#F5B014] uppercase tracking-wider flex items-center space-x-1.5">
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>APK File (Direct Firebase Storage Upload)</span>
                  </label>
                  {selectedApkFile && (
                    <span className="text-[10px] font-mono text-[#34D399] font-bold">
                      {(selectedApkFile.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <label className="flex-1 min-h-[50px] p-3 rounded-xl bg-[#1B1D29] hover:bg-[#222534] border border-dashed border-[#363A50] hover:border-[#F5B014] flex items-center justify-center space-x-2 cursor-pointer transition-all">
                    <Upload className="w-4 h-4 text-[#F5B014]" />
                    <span className="text-xs font-bold text-white truncate">
                      {selectedApkFile ? selectedApkFile.name : 'Click to select .apk file to upload'}
                    </span>
                    <input
                      ref={apkInputRef}
                      type="file"
                      accept=".apk,application/vnd.android.package-archive"
                      onChange={handleApkFileSelect}
                      className="hidden"
                    />
                  </label>

                  {selectedApkFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedApkFile(null);
                        if (apkInputRef.current) apkInputRef.current.value = '';
                      }}
                      className="px-3 py-2 bg-[#EF4444]/15 hover:bg-[#EF4444] text-[#EF4444] hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Upload Progress Bar */}
                {isUploading && apkProgress > 0 && (
                  <div className="p-3 rounded-xl bg-[#12131C] border border-[#272A3C] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#F5B014] font-bold animate-pulse">
                        {uploadStage || 'Uploading to Firebase Storage...'}
                      </span>
                      <span className="font-mono text-white font-bold">{apkProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#1E202C] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#F5B014] to-[#34D399] transition-all duration-300 rounded-full"
                        style={{ width: `${apkProgress}%` }}
                      />
                    </div>
                    {apkTransferred && (
                      <p className="text-[10px] font-mono text-[#8C91A0] text-right">
                        {apkTransferred}
                      </p>
                    )}
                  </div>
                )}

                {/* Direct APK Download URL as alternative or fallback */}
                <div className="pt-2 border-t border-[#25283A]">
                  <label className="text-[10px] font-bold text-[#8C91A0] uppercase block mb-1">
                    Or Enter Direct APK Download URL / Storage Link:
                  </label>
                  <input
                    type="url"
                    value={apkUrl}
                    onChange={(e) => setApkUrl(e.target.value)}
                    placeholder="https://... direct APK download link"
                    className="w-full h-9 bg-[#12131C] border border-[#2B2E3E] focus:border-[#F5B014] rounded-xl px-3 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              {/* App Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-bold text-[#8C91A0] uppercase block mb-1">
                    Application Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Kinemaster Pro 4K"
                    className="w-full h-10 bg-[#1B1D27] border border-[#2B2E3E] focus:border-[#F5B014] rounded-xl px-3.5 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#8C91A0] uppercase block mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Video Editing, Tools, Social"
                    className="w-full h-10 bg-[#1B1D27] border border-[#2B2E3E] focus:border-[#F5B014] rounded-xl px-3.5 text-xs text-white outline-none"
                  />
                </div>
              </div>

              {/* Version, File Size, Developer */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#8C91A0] uppercase block mb-1">
                    Version
                  </label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="1.0.0"
                    className="w-full h-10 bg-[#1B1D27] border border-[#2B2E3E] focus:border-[#F5B014] rounded-xl px-3 text-xs text-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#8C91A0] uppercase block mb-1">
                    File Size
                  </label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="35 MB"
                    className="w-full h-10 bg-[#1B1D27] border border-[#2B2E3E] focus:border-[#F5B014] rounded-xl px-3 text-xs text-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#8C91A0] uppercase block mb-1">
                    Developer
                  </label>
                  <input
                    type="text"
                    value={developer}
                    onChange={(e) => setDeveloper(e.target.value)}
                    placeholder="AK STAR MOD"
                    className="w-full h-10 bg-[#1B1D27] border border-[#2B2E3E] focus:border-[#F5B014] rounded-xl px-3 text-xs text-white outline-none"
                  />
                </div>
              </div>

              {/* App Icon (Upload to Firebase Storage or URL) */}
              <div>
                <label className="text-[11px] font-bold text-[#8C91A0] uppercase block mb-1">
                  App Icon (Upload to Firebase Storage or URL)
                </label>
                <div className="flex items-center space-x-3">
                  {iconUrl ? (
                    <img
                      src={iconUrl}
                      alt="Icon preview"
                      className="w-12 h-12 rounded-xl object-cover border border-[#F5B014] bg-[#1A1C28]"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#1B1D27] border border-[#2B2E3E] flex items-center justify-center text-[#717684]">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}

                  <input
                    type="url"
                    value={iconUrl}
                    onChange={(e) => setIconUrl(e.target.value)}
                    placeholder="https://... icon image URL"
                    className="flex-1 h-10 bg-[#1B1D27] border border-[#2B2E3E] focus:border-[#F5B014] rounded-xl px-3.5 text-xs text-white outline-none"
                  />

                  <label className="px-3 h-10 bg-[#262938] hover:bg-[#32364A] text-white rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer flex-shrink-0 transition-colors">
                    <Upload className="w-3.5 h-3.5 mr-1" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIconUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-bold text-[#8C91A0] uppercase block mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the application features, unlocked mods, specifications..."
                  className="w-full bg-[#1B1D27] border border-[#2B2E3E] focus:border-[#F5B014] rounded-xl p-3 text-xs text-white outline-none leading-relaxed"
                />
              </div>

              {/* Changelog */}
              <div>
                <label className="text-[11px] font-bold text-[#8C91A0] uppercase block mb-1">
                  Changelog / What's New (One per line)
                </label>
                <textarea
                  rows={2}
                  value={changelog}
                  onChange={(e) => setChangelog(e.target.value)}
                  placeholder="• Unlocked Premium VIP features&#10;• Zero ads & 4K export support&#10;• Bug fixes and speed improvements"
                  className="w-full bg-[#1B1D27] border border-[#2B2E3E] focus:border-[#F5B014] rounded-xl p-3 text-xs text-white outline-none font-mono text-[11px]"
                />
              </div>

              {/* Screenshots URLs */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-[#8C91A0] uppercase block">
                    Screenshots (Image URLs, one per line)
                  </label>
                  <label className="text-[10px] text-[#F5B014] hover:underline cursor-pointer flex items-center space-x-1">
                    <Upload className="w-3 h-3" />
                    <span>Upload Images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleScreenshotUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <textarea
                  rows={2}
                  value={screenshotsText}
                  onChange={(e) => setScreenshotsText(e.target.value)}
                  placeholder="https://image1.png&#10;https://image2.png"
                  className="w-full bg-[#1B1D27] border border-[#2B2E3E] focus:border-[#F5B014] rounded-xl p-3 text-xs text-white outline-none font-mono text-[11px]"
                />
              </div>

              {/* Publication Status & Featured Toggles */}
              <div className="p-4 rounded-2xl bg-[#1B1D28] border border-[#2C2F42] space-y-3">
                <h4 className="text-xs font-extrabold text-[#F5B014] uppercase tracking-wider">
                  PUBLICATION CONTROL (status: 'approved')
                </h4>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Publicly Published (status: 'approved')</p>
                    <p className="text-[10px] text-[#8C91A0]">
                      When enabled, this APK document will be saved into Firestore with status: 'approved' and appear live immediately.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPublished(!isPublished)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                      isPublished ? 'bg-[#10B981]' : 'bg-[#2E3142]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        isPublished ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#252838]">
                  <div>
                    <p className="text-xs font-bold text-white">Featured Hero Carousel</p>
                    <p className="text-[10px] text-[#8C91A0]">
                      Highlight this application in the top hero banner.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFeatured(!isFeatured)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                      isFeatured ? 'bg-[#F5B014]' : 'bg-[#2E3142]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        isFeatured ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full h-12 bg-[#F5B014] hover:bg-[#FFD54F] active:scale-98 text-black font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(245,176,20,0.35)] transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-black" />
                  <span>
                    {isUploading
                      ? 'UPLOADING TO FIREBASE...'
                      : editingAppId
                      ? 'UPDATE APPLICATION IN FIRESTORE'
                      : isPublished
                      ? 'UPLOAD APK & PUBLISH TO LIVE WEBSITE'
                      : 'SAVE AS DRAFT'}
                  </span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ================= TAB 2: CATALOG MANAGEMENT ================= */}
        {activeTab === 'catalog' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8C91A0] uppercase tracking-wider">
                Total Uploaded Applications ({allAdminApps.length})
              </span>
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('upload');
                }}
                className="px-3 py-1.5 rounded-xl bg-[#F5B014] text-black font-extrabold text-xs flex items-center space-x-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Upload New</span>
              </button>
            </div>

            {allAdminApps.length === 0 ? (
              <div className="p-8 rounded-3xl bg-[#14151D] border border-[#232533] text-center space-y-3">
                <FileCode className="w-10 h-10 text-[#686D7F] mx-auto" />
                <h4 className="text-sm font-bold text-white uppercase">No applications in database</h4>
                <p className="text-xs text-[#8C91A0]">
                  Upload your first real APK using the "Upload APK" tab above.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {allAdminApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-2xl bg-[#14151D] border border-[#232533] flex items-center justify-between space-x-3 shadow-md"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={app.iconUrl}
                        alt={app.name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#2B2E3F] bg-[#191B26] flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-white truncate max-w-[140px] sm:max-w-xs">
                            {app.name}
                          </h4>
                          <span
                            className={`px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase ${
                              app.published || app.status === 'approved'
                                ? 'bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/30'
                                : 'bg-[#EF4444]/20 text-[#F87171] border border-[#EF4444]/30'
                            }`}
                          >
                            {app.published || app.status === 'approved' ? 'APPROVED / PUBLISHED' : 'DRAFT'}
                          </span>
                        </div>
                        <p className="text-xs text-[#8C91A0] truncate">
                          v{app.version} • {app.size} • {app.category}
                        </p>
                        {app.apkUrl && (
                          <p className="text-[10px] text-[#636879] font-mono truncate max-w-[200px] sm:max-w-xs">
                            {app.apkUrl}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      {/* Direct Test Download */}
                      {app.apkUrl && (
                        <a
                          href={app.apkUrl}
                          target="_blank"
                          rel="noreferrer"
                          download
                          title="Test Download APK"
                          className="w-8 h-8 rounded-lg bg-[#222533] hover:bg-[#F5B014] text-[#8C91A0] hover:text-black flex items-center justify-center transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {/* Toggle Publish / Unpublish */}
                      <button
                        title={app.published ? 'Unpublish from website' : 'Publish to website'}
                        onClick={() => togglePublishApp(app.id, !app.published)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          app.published
                            ? 'bg-[#10B981]/20 text-[#34D399] hover:bg-[#10B981]/40'
                            : 'bg-[#222533] text-[#8C91A0] hover:text-white'
                        }`}
                      >
                        {app.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      {/* Edit */}
                      <button
                        title="Edit Application"
                        onClick={() => startEdit(app)}
                        className="w-8 h-8 rounded-lg bg-[#222533] hover:bg-[#F5B014] text-[#8C91A0] hover:text-black flex items-center justify-center transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        title="Delete Application from Firestore & Storage"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${app.name}" and all associated files from Firebase?`)) {
                            deleteApp(app.id, app.apkStoragePath, app.iconStoragePath);
                          }
                        }}
                        className="w-8 h-8 rounded-lg bg-[#EF4444]/15 hover:bg-[#EF4444] text-[#EF4444] hover:text-white flex items-center justify-center transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: ORDER & KEY APPROVALS ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#8C91A0] uppercase tracking-wider block">
              User Purchase Orders ({purchases.length})
            </span>

            {purchases.length === 0 ? (
              <div className="p-8 rounded-3xl bg-[#14151D] border border-[#232533] text-center space-y-2">
                <Clock className="w-8 h-8 text-[#686D7F] mx-auto" />
                <h4 className="text-sm font-bold text-white uppercase">No purchase orders found</h4>
                <p className="text-xs text-[#8C91A0]">
                  User payment screenshot submissions will appear here for verification.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {purchases.map((pur) => (
                  <div
                    key={pur.id}
                    className="p-4 rounded-2xl bg-[#14151D] border border-[#232533] space-y-3 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#F5B014]">{pur.orderId}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          pur.status === 'approved'
                            ? 'bg-[#10B981]/20 text-[#34D399]'
                            : pur.status === 'rejected'
                            ? 'bg-[#EF4444]/20 text-[#F87171]'
                            : 'bg-[#F5B014]/20 text-[#F5B014]'
                        }`}
                      >
                        {pur.status}
                      </span>
                    </div>

                    <div className="text-xs text-[#9DA2B3] space-y-1">
                      <p>
                        <strong className="text-white">App:</strong> {pur.appName} ({pur.keyTierName})
                      </p>
                      <p>
                        <strong className="text-white">User:</strong> {pur.userName} ({pur.userEmail})
                      </p>
                      <p>
                        <strong className="text-white">Amount:</strong> {pur.finalAmount} {pur.currency}
                      </p>
                      {pur.licenseKey && (
                        <p className="font-mono text-[#34D399]">
                          <strong>Key:</strong> {pur.licenseKey}
                        </p>
                      )}
                    </div>

                    {pur.paymentScreenshotUrl && (
                      <a
                        href={pur.paymentScreenshotUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 text-xs text-[#F5B014] hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Payment Screenshot</span>
                      </a>
                    )}

                    {pur.status === 'pending' && (
                      <div className="flex items-center space-x-2 pt-2 border-t border-[#232533]">
                        <button
                          onClick={() => approveOrder(pur.id)}
                          className="flex-1 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs flex items-center justify-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Issue Key</span>
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Rejection reason:', 'Screenshot unverified');
                            if (reason) rejectOrder(pur.id, reason);
                          }}
                          className="px-4 py-2 rounded-xl bg-[#EF4444]/20 hover:bg-[#EF4444] text-[#F87171] hover:text-white font-extrabold text-xs flex items-center justify-center space-x-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: UPI & PAYMENT SETTINGS ================= */}
        {activeTab === 'payment' && (
          <form onSubmit={handleSavePaymentSettings} className="space-y-4">
            <div className="p-5 rounded-3xl bg-[#14151D] border border-[#232533] space-y-4 shadow-xl">
              <div className="flex items-center space-x-2 border-b border-[#232533] pb-3">
                <span className="w-1.5 h-4 bg-[#F5B014] rounded-full" />
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  UPI & Payment Configuration
                </h3>
              </div>

              {paymentSavedMsg && (
                <div className="p-3 rounded-xl bg-[#10B981]/20 border border-[#10B981]/40 text-[#34D399] text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Payment settings saved to Firebase!</span>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-[#8C91A0] uppercase block mb-1">
                  UPI ID (VPA) *
                </label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. akstarmodofficial@upi"
                  className="w-full h-10 bg-[#1B1D27] border border-[#2B2E3E] focus:border-[#F5B014] rounded-xl px-3.5 text-xs text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#8C91A0] uppercase block mb-1">
                  Beneficiary Name *
                </label>
                <input
                  type="text"
                  required
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  placeholder="e.g. AK STAR MOD Official"
                  className="w-full h-10 bg-[#1B1D27] border border-[#2B2E3E] focus:border-[#F5B014] rounded-xl px-3.5 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#8C91A0] uppercase block mb-1">
                  QR Code Image URL (Optional custom QR)
                </label>
                <input
                  type="url"
                  value={qrCodeUrl}
                  onChange={(e) => setQrCodeUrl(e.target.value)}
                  placeholder="https://... custom QR image or leave empty for auto-generation"
                  className="w-full h-10 bg-[#1B1D27] border border-[#2B2E3E] focus:border-[#F5B014] rounded-xl px-3.5 text-xs text-white outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-11 bg-[#F5B014] hover:bg-[#FFD54F] active:scale-98 text-black font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(245,176,20,0.35)] transition-all"
                >
                  <Save className="w-4 h-4 text-black" />
                  <span>SAVE PAYMENT SETTINGS</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

