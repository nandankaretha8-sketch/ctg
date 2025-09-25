import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Edit, Eye, CheckCircle, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { API_URL, authenticatedApiCall } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await authenticatedApiCall('/admin/users', {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if (!userSearchTerm) return true;
    const searchLower = userSearchTerm.toLowerCase();
    return (
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower)
    );
  });

  const handleViewUser = (user: any) => {
    console.log('View user:', user);
    // Implement view user functionality
  };

  const handleEditUser = (user: any) => {
    console.log('Edit user:', user);
    // Implement edit user functionality
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">User Management</h2>
        <p className="text-gray-300">Manage platform users and their accounts</p>
      </div>
      
      {/* Search Users */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <Label htmlFor="user-search" className="text-white text-sm font-medium mb-2 block">
                Search Users
              </Label>
              <div className="relative">
                <Input
                  id="user-search"
                  type="text"
                  placeholder="Search by name, email, or role..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-white/40 focus:ring-white/20 pl-10"
                />
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            {userSearchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUserSearchTerm('')}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Clear
              </Button>
            )}
          </div>
          {userSearchTerm && (
            <p className="text-gray-400 text-sm mt-2">
              Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} matching "{userSearchTerm}"
            </p>
          )}
        </CardContent>
      </Card>
      
      {/* Users Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Users</p>
                <p className="text-2xl font-bold text-white">
                  {users.filter(user => user.isActive !== false).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Admin Users</p>
                <p className="text-2xl font-bold text-white">
                  {users.filter(user => user.role === 'admin').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardHeader className="p-6">
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {usersLoading ? (
            <div className="text-center py-8">
              <LoadingSpinner message="Loading users..." size="sm" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                {userSearchTerm ? 'No Users Found' : 'No Users Found'}
              </h3>
              <p className="text-gray-400">
                {userSearchTerm 
                  ? `No users match your search for "${userSearchTerm}"`
                  : 'No users have registered on the platform yet.'
                }
              </p>
              {userSearchTerm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUserSearchTerm('')}
                  className="mt-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white/5 rounded-lg border border-white/10 gap-4"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-semibold truncate">
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}` 
                          : user.email
                        }
                      </h3>
                      <p className="text-gray-400 text-sm truncate">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            user.role === 'admin' 
                              ? 'border-purple-400 text-purple-400' 
                              : 'border-blue-400 text-blue-400'
                          }`}
                        >
                          {user.role || 'user'}
                        </Badge>
                        {user.isActive !== false && (
                          <Badge variant="outline" className="text-xs border-green-400 text-green-400">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-2 flex-shrink-0">
                    <div className="text-left sm:text-right">
                      <p className="text-gray-400 text-xs">Joined</p>
                      <p className="text-white text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewUser(user)}
                        className="text-gray-400 hover:text-white hover:bg-white/10 p-2"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        className="text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 p-2"
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
