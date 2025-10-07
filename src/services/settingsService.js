import { API_URL } from '../lib/api';

const API_BASE_URL = API_URL;

class SettingsService {
  async getSettings() {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async updateSettings(settingsData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settingsData),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async uploadLogo(file) {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/settings/logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload logo');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async uploadFavicon(file) {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/settings/favicon`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload favicon');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async uploadMentorPhoto(file) {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/settings/mentor-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload mentor photo');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async deleteLogo() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/settings/logo`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete logo');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async deleteFavicon() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/settings/favicon`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete favicon');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async deleteMentorPhoto() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/settings/mentor-photo`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete mentor photo');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}

export default new SettingsService();