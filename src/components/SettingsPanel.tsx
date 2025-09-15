import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Trash2, Save, Image, Globe } from 'lucide-react';
import { toast } from 'sonner';
import settingsService from '@/services/settingsService';
import { useSettings } from '@/contexts/SettingsContext';

interface Settings {
  logo?: string;
  favicon?: string;
  mentorPhoto?: string;
  siteName?: string;
  siteDescription?: string;
}

const SettingsPanel: React.FC = () => {
  const { settings, refreshSettings } = useSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingMentorPhoto, setUploadingMentorPhoto] = useState(false);
  const [selectedLogoFile, setSelectedLogoFile] = useState<string>('');
  const [selectedFaviconFile, setSelectedFaviconFile] = useState<string>('');
  const [selectedMentorPhotoFile, setSelectedMentorPhotoFile] = useState<string>('');

  // Form states
  const [siteName, setSiteName] = useState('');
  const [siteDescription, setSiteDescription] = useState('');

  useEffect(() => {
    if (settings.siteName !== undefined) {
      setSiteName(settings.siteName || '');
      setSiteDescription(settings.siteDescription || '');
      setLoading(false);
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const response = await settingsService.updateSettings({
        siteName,
        siteDescription
      });
      
      if (response.success) {
        await refreshSettings();
        toast.success('Settings saved successfully');
      }
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Set selected file name
    setSelectedLogoFile(file.name);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      setSelectedLogoFile('');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      setSelectedLogoFile('');
      return;
    }

    try {
      setUploadingLogo(true);
      const response = await settingsService.uploadLogo(file);
      
      if (response.success) {
        await refreshSettings();
        toast.success('Logo uploaded successfully');
        setSelectedLogoFile('');
      }
    } catch (error) {
      toast.error('Failed to upload logo');
      setSelectedLogoFile('');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFaviconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Set selected file name
    setSelectedFaviconFile(file.name);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      setSelectedFaviconFile('');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      setSelectedFaviconFile('');
      return;
    }

    try {
      setUploadingFavicon(true);
      const response = await settingsService.uploadFavicon(file);
      
      if (response.success) {
        await refreshSettings();
        toast.success('Favicon uploaded successfully');
        setSelectedFaviconFile('');
      }
    } catch (error) {
      toast.error('Failed to upload favicon');
      setSelectedFaviconFile('');
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleDeleteLogo = async () => {
    try {
      const response = await settingsService.deleteLogo();
      
      if (response.success) {
        await refreshSettings();
        toast.success('Logo deleted successfully');
      }
    } catch (error) {
      toast.error('Failed to delete logo');
    }
  };

  const handleDeleteFavicon = async () => {
    try {
      const response = await settingsService.deleteFavicon();
      
      if (response.success) {
        await refreshSettings();
        toast.success('Favicon deleted successfully');
      }
    } catch (error) {
      toast.error('Failed to delete favicon');
    }
  };

  const handleMentorPhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Set selected file name
    setSelectedMentorPhotoFile(file.name);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      setSelectedMentorPhotoFile('');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      setSelectedMentorPhotoFile('');
      return;
    }

    try {
      setUploadingMentorPhoto(true);
      const response = await settingsService.uploadMentorPhoto(file);
      
      if (response.success) {
        await refreshSettings();
        toast.success('Mentor photo uploaded successfully');
        setSelectedMentorPhotoFile('');
      }
    } catch (error) {
      toast.error('Failed to upload mentor photo');
      setSelectedMentorPhotoFile('');
    } finally {
      setUploadingMentorPhoto(false);
    }
  };

  const handleDeleteMentorPhoto = async () => {
    try {
      const response = await settingsService.deleteMentorPhoto();
      
      if (response.success) {
        await refreshSettings();
        toast.success('Mentor photo deleted successfully');
      }
    } catch (error) {
      toast.error('Failed to delete mentor photo');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
          <p className="text-gray-300">Configure platform settings and preferences</p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
        <p className="text-gray-300">Configure platform settings and preferences</p>
      </div>

      {/* General Settings */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription className="text-gray-300">
            Configure basic site information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName" className="text-white">Site Name</Label>
            <Input
              id="siteName"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Enter site name"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="siteDescription" className="text-white">Site Description</Label>
            <Textarea
              id="siteDescription"
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              placeholder="Enter site description"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              rows={3}
            />
          </div>
          
          <Button 
            onClick={handleSaveSettings} 
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Logo Settings */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Image className="h-5 w-5" />
            Logo Settings
          </CardTitle>
          <CardDescription className="text-gray-300">
            Upload and manage your site logo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.logo && (
            <div className="space-y-2">
              <Label className="text-white">Current Logo</Label>
              <div className="flex items-center gap-4 p-4 bg-white/10 rounded-lg">
                <img 
                  src={settings.logo} 
                  alt="Current Logo" 
                  className="h-16 w-auto object-contain"
                />
                <Button
                  onClick={handleDeleteLogo}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="logoUpload" className="text-white">
              {settings.logo ? 'Replace Logo' : 'Upload Logo'}
            </Label>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <div className="relative">
                  <Input
                    id="logoUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex items-center justify-between bg-white/10 border border-white/20 rounded-md px-4 py-2 text-white min-h-[40px]">
                    <span className="text-gray-400 truncate">
                      {selectedLogoFile || 'No file chosen'}
                    </span>
                    <Button
                      type="button"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 text-sm"
                      disabled={uploadingLogo}
                    >
                      Choose file
                    </Button>
                  </div>
                </div>
              </div>
              {uploadingLogo && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
            </div>
            <p className="text-sm text-gray-400">
              Recommended size: 200x60px. Max file size: 5MB. Supported formats: JPG, PNG, GIF, SVG
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Favicon Settings */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Favicon Settings
          </CardTitle>
          <CardDescription className="text-gray-300">
            Upload and manage your site favicon
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.favicon && (
            <div className="space-y-2">
              <Label className="text-white">Current Favicon</Label>
              <div className="flex items-center gap-4 p-4 bg-white/10 rounded-lg">
                <img 
                  src={settings.favicon} 
                  alt="Current Favicon" 
                  className="h-8 w-8 object-contain"
                />
                <Button
                  onClick={handleDeleteFavicon}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="faviconUpload" className="text-white">
              {settings.favicon ? 'Replace Favicon' : 'Upload Favicon'}
            </Label>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <div className="relative">
                  <Input
                    id="faviconUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleFaviconUpload}
                    disabled={uploadingFavicon}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex items-center justify-between bg-white/10 border border-white/20 rounded-md px-4 py-2 text-white min-h-[40px]">
                    <span className="text-gray-400 truncate">
                      {selectedFaviconFile || 'No file chosen'}
                    </span>
                    <Button
                      type="button"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 text-sm"
                      disabled={uploadingFavicon}
                    >
                      Choose file
                    </Button>
                  </div>
                </div>
              </div>
              {uploadingFavicon && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
            </div>
            <p className="text-sm text-gray-400">
              Recommended size: 32x32px or 16x16px. Max file size: 5MB. Supported formats: ICO, PNG, JPG, GIF, SVG
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Mentor Photo Settings */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Image className="h-5 w-5" />
            Mentor Photo Settings
          </CardTitle>
          <CardDescription className="text-gray-300">
            Upload and manage the mentor photo for the homepage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.mentorPhoto && (
            <div className="space-y-2">
              <Label className="text-white">Current Mentor Photo</Label>
              <div className="flex items-center gap-4">
                <img 
                  src={settings.mentorPhoto} 
                  alt="Current Mentor Photo" 
                  className="h-20 w-20 object-cover rounded-lg"
                />
                <Button
                  onClick={handleDeleteMentorPhoto}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="mentorPhotoUpload" className="text-white">
              {settings.mentorPhoto ? 'Replace Mentor Photo' : 'Upload Mentor Photo'}
            </Label>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <div className="relative">
                  <Input
                    id="mentorPhotoUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleMentorPhotoUpload}
                    disabled={uploadingMentorPhoto}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex items-center justify-between bg-white/10 border border-white/20 rounded-md px-4 py-2 text-white min-h-[40px]">
                    <span className="text-gray-400 truncate">
                      {selectedMentorPhotoFile || 'No file chosen'}
                    </span>
                    <Button
                      type="button"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 text-sm"
                      disabled={uploadingMentorPhoto}
                    >
                      Choose file
                    </Button>
                  </div>
                </div>
              </div>
              {uploadingMentorPhoto && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
            </div>
            <p className="text-sm text-gray-400">
              Recommended size: 800x500px or similar aspect ratio. Max file size: 5MB. Supported formats: JPG, PNG, GIF, SVG
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPanel;
