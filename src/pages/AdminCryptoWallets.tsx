import React, { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Copy,
  QrCode,
  Save,
  X,
  AlertCircle,
  Upload,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface CryptoWallet {
  _id: string;
  name: string;
  symbol: string;
  network: string;
  address: string;
  qrCode?: string;
  isActive: boolean;
  sortOrder: number;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

const AdminCryptoWallets = () => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWallet, setEditingWallet] = useState<CryptoWallet | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    network: '',
    address: '',
    qrCode: '',
    sortOrder: 0,
    metadata: {}
  });
  
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [uploadingQR, setUploadingQR] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const response = await fetch(`${API_URL}/crypto-wallets`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setWallets(data.data);
      } else {
        toast.error('Failed to fetch crypto wallets');
      }
    } catch (error) {
      // Error handling:'Error fetching crypto wallets:', error);
      toast.error('Failed to fetch crypto wallets');
    } finally {
      setLoading(false);
    }
  };

  const handleQRCodeUpload = async (file: File) => {
    setUploadingQR(true);
    try {
      const formData = new FormData();
      formData.append('qrCode', file);
      
      const response = await fetch(`${API_URL}/upload/qr-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFormData(prev => ({ ...prev, qrCode: data.data.url }));
        toast.success('QR code uploaded successfully');
      } else {
        throw new Error(data.message || 'Failed to upload QR code');
      }
    } catch (error) {
      // Error handling:'Error uploading QR code:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload QR code');
    } finally {
      setUploadingQR(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setQrCodeFile(file);
      handleQRCodeUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.symbol || !formData.network || !formData.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    setProcessing(editingWallet ? 'update' : 'create');

    try {
      const url = editingWallet 
        ? `${API_URL}/crypto-wallets/${editingWallet._id}`
        : `${API_URL}/crypto-wallets`;
      
      const method = editingWallet ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(editingWallet ? 'Wallet updated successfully' : 'Wallet created successfully');
        setShowForm(false);
        setEditingWallet(null);
        resetForm();
        fetchWallets();
      } else {
        throw new Error(data.message || 'Failed to save wallet');
      }
    } catch (error) {
      // Error handling:'Error saving wallet:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save wallet');
    } finally {
      setProcessing(null);
    }
  };

  const handleEdit = (wallet: CryptoWallet) => {
    setEditingWallet(wallet);
    setFormData({
      name: wallet.name,
      symbol: wallet.symbol,
      network: wallet.network,
      address: wallet.address,
      qrCode: wallet.qrCode || '',
      sortOrder: wallet.sortOrder,
      metadata: wallet.metadata
    });
    setShowForm(true);
  };

  const handleDelete = async (walletId: string) => {
    if (!confirm('Are you sure you want to delete this wallet?')) {
      return;
    }

    setProcessing(walletId);

    try {
      const response = await fetch(`${API_URL}/crypto-wallets/${walletId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Wallet deleted successfully');
        fetchWallets();
      } else {
        throw new Error(data.message || 'Failed to delete wallet');
      }
    } catch (error) {
      // Error handling:'Error deleting wallet:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete wallet');
    } finally {
      setProcessing(null);
    }
  };

  const handleToggleStatus = async (walletId: string) => {
    setProcessing(walletId);

    try {
      const response = await fetch(`${API_URL}/crypto-wallets/${walletId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Wallet ${data.data.isActive ? 'activated' : 'deactivated'} successfully`);
        fetchWallets();
      } else {
        throw new Error(data.message || 'Failed to toggle wallet status');
      }
    } catch (error) {
      // Error handling:'Error toggling wallet status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to toggle wallet status');
    } finally {
      setProcessing(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      symbol: '',
      network: '',
      address: '',
      qrCode: '',
      sortOrder: 0,
      metadata: {}
    });
    setQrCodeFile(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Address copied to clipboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading crypto wallets...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Crypto Wallets Management</h1>
            <p className="text-gray-300">Manage your cryptocurrency wallet addresses</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(true);
              setEditingWallet(null);
              resetForm();
            }}
            className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="bg-white/5 backdrop-blur-md mb-6 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">
                  {editingWallet ? 'Edit Wallet' : 'Add New Wallet'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowForm(false);
                    setEditingWallet(null);
                    resetForm();
                  }}
                  className="text-white hover:text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">Wallet Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Bitcoin Main Wallet"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="symbol" className="text-white">Symbol *</Label>
                    <Input
                      id="symbol"
                      value={formData.symbol}
                      onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                      placeholder="e.g., BTC"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="network" className="text-white">Network *</Label>
                    <Input
                      id="network"
                      value={formData.network}
                      onChange={(e) => setFormData(prev => ({ ...prev, network: e.target.value }))}
                      placeholder="e.g., Bitcoin, Ethereum, BSC"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sortOrder" className="text-white">Sort Order</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-white">Wallet Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter the wallet address"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="qrCode" className="text-white">QR Code (Optional)</Label>
                  <div className="space-y-2">
                    <Input
                      id="qrCode"
                      value={formData.qrCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, qrCode: e.target.value }))}
                      placeholder="URL to QR code image or upload file below"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="qrCodeFile"
                      />
                      <Label 
                        htmlFor="qrCodeFile" 
                        className="cursor-pointer bg-white/10 border border-white/20 text-white px-3 py-2 rounded-md hover:bg-white/20 transition-colors flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {uploadingQR ? 'Uploading...' : 'Upload QR Code'}
                      </Label>
                      {qrCodeFile && (
                        <span className="text-green-300 text-sm">
                          ✓ {qrCodeFile.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={processing === 'create' || processing === 'update'}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  >
                    {processing === 'create' || processing === 'update' ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {editingWallet ? 'Update Wallet' : 'Create Wallet'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingWallet(null);
                      resetForm();
                    }}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Wallets List */}
        {wallets.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/5 backdrop-blur-md rounded-lg p-8 max-w-md mx-auto border border-white/10">
              <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Crypto Wallets Found</h3>
              <p className="text-gray-300 mb-6">Get started by adding your first cryptocurrency wallet</p>
              <Button
                onClick={() => {
                  setShowForm(true);
                  setEditingWallet(null);
                  resetForm();
                }}
                className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Wallet
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wallets.map((wallet) => (
              <Card key={wallet._id} className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white text-lg">{wallet.name}</CardTitle>
                      <CardDescription className="text-gray-300">
                        {wallet.symbol} • {wallet.network}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={wallet.isActive ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}>
                        {wallet.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <span className="text-gray-400 text-sm">#{wallet.sortOrder}</span>
                    </div>
                  </div>
                </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-400 text-sm">Wallet Address:</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={wallet.address}
                      readOnly
                      className="bg-white/10 border-white/20 text-white text-sm font-mono"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(wallet.address)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {wallet.qrCode && (
                  <div className="text-center">
                    <img
                      src={wallet.qrCode}
                      alt="QR Code"
                      className="w-24 h-24 mx-auto border border-white/20 rounded"
                    />
                    <p className="text-gray-400 text-xs mt-1">QR Code</p>
                  </div>
                )}
                
                <Separator className="bg-white/10" />
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(wallet)}
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleStatus(wallet._id)}
                    disabled={processing === wallet._id}
                    className={`flex-1 ${
                      wallet.isActive 
                        ? 'border-red-500/30 text-red-300 hover:bg-red-500/10' 
                        : 'border-green-500/30 text-green-300 hover:bg-green-500/10'
                    }`}
                  >
                    {processing === wallet._id ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : wallet.isActive ? (
                      <ToggleLeft className="h-4 w-4 mr-2" />
                    ) : (
                      <ToggleRight className="h-4 w-4 mr-2" />
                    )}
                    {wallet.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(wallet._id)}
                    disabled={processing === wallet._id}
                    className="border-red-500/30 text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCryptoWallets;