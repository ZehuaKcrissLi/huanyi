import axios from 'axios';
import { COMFYUI_BASE_URL } from '../config';

// 创建axios实例
const api = axios.create({
  baseURL: COMFYUI_BASE_URL,
  timeout: 30000,
});

// Mock响应数据
const MOCK_RESPONSE = {
  success: true,
  data: {
    imageUrl: 'https://picsum.photos/400/600', // 使用随机图片作为mock数据
  }
};

export const uploadImage = async (image: File) => {
  const formData = new FormData();
  formData.append('image', image);

  try {
    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // 使用mock数据
    return MOCK_RESPONSE;
    
    // 后端准备好后，可以直接返回真实响应
    // return response.data;
  } catch (error) {
    console.error('上传图片失败:', error);
    throw error;
  }
};

export const processImage = async (imageId: string) => {
  try {
    // 这里先返回mock数据，等后端ready后可以改为真实API调用
    return MOCK_RESPONSE;
  } catch (error) {
    console.error('处理图片失败:', error);
    throw error;
  }
};
